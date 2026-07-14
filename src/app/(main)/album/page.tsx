"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FlagIcon } from "@/components/FlagIcon";
import { IconStar, IconUser, IconTrophy, IconRepeat } from "@/components/Icons";
import StickerCard from "@/components/StickerCard";
import { SkeletonAlbum } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import type { FigurinhaResumo } from "@/types";

interface Figurinha extends FigurinhaResumo {
  tipo: string;
}

interface AlbumItem {
  figurinhaId: number;
  quantidade: number;
  figurinha: Figurinha;
}

export default function AlbumPage() {
  const { user, getAuthHeaders } = useAuth();
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [album, setAlbum] = useState<Map<number, AlbumItem>>(new Map());
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [filtroNome, setFiltroNome] = useState("");
  const [abrindo, setAbrindo] = useState(false);
  const [novasFigurinhas, setNovasFigurinhas] = useState<Figurinha[]>([]);
  const [showAnimacao, setShowAnimacao] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [pacotesRestantesHoje, setPacotesRestantesHoje] = useState(10);
  const [limiteDiario, setLimiteDiario] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const carregarDados = useCallback(async () => {
    const [figRes, albumRes] = await Promise.all([
      fetch("/api/figurinhas"),
      fetch("/api/album", { headers: getAuthHeaders() }),
    ]);

    const figData = await figRes.json();
    const albumData = await albumRes.json();

    setFigurinhas(figData.figurinhas);

    const albumMap = new Map<number, AlbumItem>();
    if (albumData.album) {
      for (const item of albumData.album) {
        albumMap.set(item.figurinhaId, item);
      }
    }
    setAlbum(albumMap);
    setPacotesRestantesHoje(albumData.pacotesRestantesHoje ?? 10);
    setLimiteDiario(albumData.limiteDiario ?? 10);
    setCarregando(false);
  }, [getAuthHeaders]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const abrirPacote = async () => {
    setAbrindo(true);

    const res = await fetch("/api/album/abrir-pacote", {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const data = await res.json();

    if (!res.ok) {
      setAbrindo(false);
      setPacotesRestantesHoje(data.pacotesRestantesHoje ?? 0);
      return;
    }

    setNovasFigurinhas(data.figurinhas);
    setPacotesRestantesHoje(data.pacotesRestantesHoje);
    setShowAnimacao(true);
    setAbrindo(false);

    await carregarDados();
  };

  const statusFigurinha = useCallback(
    (figId: number) => {
      const item = album.get(figId);
      if (!item) return "faltando";
      if (item.quantidade > 1) return "repetida";
      return "tenho";
    },
    [album],
  );


  const selecoesAgrupadas = useMemo(() => {
    const map = new Map<number, { selecao: Figurinha["selecao"]; figurinhas: Figurinha[] }>();
    for (const fig of figurinhas) {
      if (!map.has(fig.selecao.id)) {
        map.set(fig.selecao.id, { selecao: fig.selecao, figurinhas: [] });
      }
      map.get(fig.selecao.id)!.figurinhas.push(fig);
    }
    return Array.from(map.values());
  }, [figurinhas]);

  const selecoesFiltradas = useMemo(() => {
    return selecoesAgrupadas.filter(({ selecao, figurinhas }) => {
      if (filtroNome && !selecao.nome.toLowerCase().includes(filtroNome.toLowerCase()))
        return false;
      return figurinhas.some((f) => {
        const status = statusFigurinha(f.id);
        if (filtroStatus === "tenho" && status !== "tenho") return false;
        if (filtroStatus === "faltando" && status !== "faltando") return false;
        if (filtroStatus === "repetida" && status !== "repetida") return false;
        return true;
      });
    });
  }, [selecoesAgrupadas, filtroStatus, filtroNome, statusFigurinha]);

  useEffect(() => {
    setPaginaAtual(0);
  }, [filtroStatus, filtroNome]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setPaginaAtual((p) => Math.max(0, p - 1));
      if (e.key === "ArrowRight")
        setPaginaAtual((p) => Math.min(selecoesFiltradas.length - 1, p + 1));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selecoesFiltradas.length]);

  const progresso = figurinhas.length > 0 ? Math.round((album.size / figurinhas.length) * 100) : 0;

  return (
    <>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Álbum de Figurinhas</h1>
            <p className="mt-1 text-zinc-500">
              {album.size} de {figurinhas.length} figurinhas ({progresso}%)
            </p>
          </div>
          {user ? (
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href="/trocas"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <IconRepeat className="h-4 w-4" />
                  Minhas Trocas
                </Link>
                <button
                  onClick={abrirPacote}
                  disabled={abrindo || pacotesRestantesHoje === 0}
                  className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  {abrindo
                    ? "Abrindo..."
                    : pacotesRestantesHoje === 0
                      ? "Limite diário atingido"
                      : "Abrir Pacotinho"}
                </button>
              </div>
              <span className="text-xs text-zinc-400">
                {pacotesRestantesHoje}/{limiteDiario} pacotes hoje
              </span>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <IconUser className="h-4 w-4 text-zinc-400" />
              Faça login para abrir pacotinhos
            </Link>
          )}
        </div>

        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all duration-500 dark:bg-zinc-100"
            style={{ width: `${progresso}%` }}
          />
        </div>

        {figurinhas.length > 0 && album.size === figurinhas.length && (
          <div className="mt-6 flex items-center gap-4 rounded-xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-700 dark:bg-emerald-950">
            <IconTrophy className="h-8 w-8 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                Álbum Completo!
              </h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Parabéns! Você coletou todas as {figurinhas.length} figurinhas!
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex gap-2">
            {["todas", "tenho", "faltando", "repetida"].map((s) => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`rounded-lg px-3 py-1.5 text-sm capitalize transition-colors ${
                  filtroStatus === s
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                {s === "todas"
                  ? "Todas"
                  : s === "tenho"
                    ? "Tenho"
                    : s === "faltando"
                      ? "Faltando"
                      : "Repetidas"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <IconTrophy className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              placeholder="Buscar seleção..."
              className="w-full rounded-lg border border-zinc-300 bg-transparent py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400"
            />
          </div>
        </div>

        {carregando ? (
          <SkeletonAlbum />
        ) : selecoesFiltradas.length > 0 ? (
          <div className="mt-6">
            <AnimatePresence mode="wait">
              {(() => {
                const { selecao, figurinhas } = selecoesFiltradas[paginaAtual];
                const selecaoAtual = selecao;
                const figurinhasAtuais = figurinhas;
                const coletadas = figurinhasAtuais.filter(
                  (f) => statusFigurinha(f.id) !== "faltando",
                ).length;

                return (
                  <motion.div
                    key={selecaoAtual.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlagIcon
                          codigo={selecaoAtual.codigoPais}
                          className="h-6 w-auto rounded-sm"
                        />
                        <h2 className="text-lg font-bold">{selecaoAtual.nome}</h2>
                      </div>
                      <span className="text-sm text-zinc-500">
                        {coletadas}/{figurinhasAtuais.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {figurinhasAtuais.map((fig) => {
                        const status = statusFigurinha(fig.id);
                        const faltando = status === "faltando";
                        const repetidaQtd =
                          status === "repetida" ? album.get(fig.id)?.quantidade : null;

                        return (
                          <StickerCard
                            key={fig.id}
                            figurinha={fig}
                            className={faltando ? "opacity-30 grayscale" : ""}
                          >
                            {repetidaQtd && (
                              <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                                {repetidaQtd}
                              </span>
                            )}
                          </StickerCard>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPaginaAtual((p) => Math.max(0, p - 1))}
                disabled={paginaAtual === 0}
                className="flex items-center gap-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                &#9664; Anterior
              </button>
              <span className="text-sm text-zinc-500">
                Página {paginaAtual + 1} de {selecoesFiltradas.length}
              </span>
              <button
                onClick={() => setPaginaAtual((p) => Math.min(selecoesFiltradas.length - 1, p + 1))}
                disabled={paginaAtual === selecoesFiltradas.length - 1}
                className="flex items-center gap-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Próxima &#9654;
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-20 text-center text-zinc-500">Nenhuma seleção encontrada</div>
        )}
      </main>

      {showAnimacao && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm pt-[10vh] pb-8"
          onClick={() => setShowAnimacao(false)}
        >
          <div className="w-full max-w-2xl px-4 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-white">
              <IconStar className="h-6 w-6 text-amber-400" />
              Suas novas figurinhas!
            </h2>
            <div className="mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2">
              {novasFigurinhas.slice(0, 4).map((fig, i) => (
                <div
                  key={i}
                  className="animate-bounce mx-auto w-full max-w-[200px] shadow-xl shadow-black/30"
                  style={{ animationDelay: `${i * 0.1}s`, animationDuration: "0.5s" }}
                >
                  <StickerCard figurinha={fig} />
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAnimacao(false)}
              className="mt-8 mb-8 rounded-lg bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-zinc-200"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
