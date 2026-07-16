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

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

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
  const pacotesAbertosHoje = limiteDiario - pacotesRestantesHoje;
  const pctPacotes = limiteDiario > 0 ? (pacotesAbertosHoje / limiteDiario) * 100 : 0;

  return (
    <>
      <main className="mx-auto max-w-6xl p-2 sm:p-4 md:p-8 space-y-8 overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-zinc-50 shadow-xl flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Álbum de Figurinhas</h1>
            <p className="mt-2 text-blue-200 text-lg">
              {album.size} de {figurinhas.length} figurinhas ({progresso}%)
            </p>
            <div className="mt-4 h-3 w-full max-w-sm overflow-hidden rounded-full bg-blue-950/50">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
          {user ? (
            <div className="flex flex-col items-center sm:items-end gap-3 w-full sm:w-auto sm:min-w-[250px]">
              <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 w-full">
                <Link
                  href="/trocas"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-100/20 bg-zinc-100/10 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100/20 backdrop-blur-sm"
                >
                  <IconRepeat className="h-4 w-4" />
                  Trocas
                </Link>
                <button
                  onClick={abrirPacote}
                  disabled={abrindo || pacotesAbertosHoje >= limiteDiario}
                  className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-6 py-2.5 text-sm font-bold text-zinc-50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {abrindo
                    ? "Abrindo..."
                    : pacotesAbertosHoje >= limiteDiario
                      ? "Limite atingido"
                      : "Abrir Pacotinho"}
                </button>
              </div>
              <div className="w-full text-center sm:text-right">
                <span className="text-sm font-medium text-blue-200 block mb-1">
                  Pacotes: {pacotesAbertosHoje} / {limiteDiario}
                </span>
                <div className="w-full bg-slate-200/20 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${pctPacotes}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-100/20 bg-zinc-100/10 px-6 py-3 text-sm font-medium transition-colors hover:bg-zinc-100/20 backdrop-blur-sm"
            >
              <IconUser className="h-4 w-4" />
              Faça login para abrir pacotinhos
            </Link>
          )}
        </div>

        {figurinhas.length > 0 && album.size === figurinhas.length && (
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-6 shadow-sm dark:border-emerald-700 dark:bg-emerald-950">
            <IconTrophy className="h-10 w-10 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                Álbum Completo!
              </h3>
              <p className="mt-1 text-emerald-600 dark:text-emerald-400">
                Parabéns! Você coletou todas as {figurinhas.length} figurinhas!
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            {["todas", "tenho", "faltando", "repetida"].map((s) => (
              <button
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${
                  filtroStatus === s
                    ? "bg-zinc-900 text-zinc-50 shadow-md dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-200 bg-zinc-100 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
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

          <div className="relative flex-grow sm:max-w-xs">
            <IconTrophy className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              placeholder="Buscar seleção..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-100 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600 dark:focus:ring-zinc-800"
            />
          </div>
        </div>

        {carregando ? (
          <SkeletonAlbum />
        ) : selecoesFiltradas.length > 0 ? (
          <div>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-zinc-200 bg-zinc-100 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-800"
                  >
                    <div className="mb-6 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <FlagIcon
                          codigo={selecaoAtual.codigoPais}
                          className="h-8 w-auto rounded shadow-sm"
                        />
                        <h2 className="text-2xl font-bold">{selecaoAtual.nome}</h2>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {coletadas}/{figurinhasAtuais.length}
                        </span>
                        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          Completas
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 min-[400px]:gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {figurinhasAtuais.map((fig) => {
                        const status = statusFigurinha(fig.id);
                        const faltando = status === "faltando";
                        const repetidaQtd =
                          status === "repetida" ? album.get(fig.id)?.quantidade : null;

                        return (
                          <div
                            key={fig.id}
                            className="relative flex flex-col h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-xl"
                          >
                            <StickerCard
                              figurinha={fig}
                              className={faltando ? "opacity-30 grayscale" : ""}
                            >
                              {repetidaQtd && (
                                <span className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-zinc-50 shadow-md border-2 border-zinc-100 dark:border-zinc-900">
                                  {repetidaQtd}
                                </span>
                              )}
                            </StickerCard>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setPaginaAtual((p) => Math.max(0, p - 1))}
                disabled={paginaAtual === 0}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                &#9664; Anterior
              </button>
              <span className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                Página {paginaAtual + 1} de {selecoesFiltradas.length}
              </span>
              <button
                onClick={() => setPaginaAtual((p) => Math.min(selecoesFiltradas.length - 1, p + 1))}
                disabled={paginaAtual === selecoesFiltradas.length - 1}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-5 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                Próxima &#9654;
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-20 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 py-16 text-zinc-500 dark:border-zinc-700">
            <IconStar className="mb-4 h-12 w-12 text-zinc-300 dark:text-zinc-700" />
            <p className="text-lg font-medium">Nenhuma seleção encontrada</p>
          </div>
        )}
      </main>

      {showAnimacao && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/80 backdrop-blur-md pt-[10vh] pb-8"
          onClick={() => setShowAnimacao(false)}
        >
          <div className="w-full max-w-3xl px-4 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-8 flex items-center justify-center gap-3 text-3xl font-extrabold text-zinc-50 drop-shadow-lg">
              <IconStar className="h-8 w-8 text-amber-400 animate-pulse" />
              Novas Figurinhas!
            </h2>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="mx-auto grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4"
            >
              {novasFigurinhas.map((fig, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="mx-auto w-full h-full flex flex-col max-w-[220px] transition-all duration-300 hover:-translate-y-2 hover:scale-105"
                >
                  <StickerCard figurinha={fig} />
                </motion.div>
              ))}
            </motion.div>

            <button
              onClick={() => setShowAnimacao(false)}
              className="mt-12 mb-8 rounded-xl bg-zinc-100 px-10 py-3.5 text-sm font-bold text-zinc-900 shadow-xl transition-all hover:scale-105 hover:bg-zinc-100"
            >
              Continuar Colecionando
            </button>
          </div>
        </div>
      )}
    </>
  );
}
