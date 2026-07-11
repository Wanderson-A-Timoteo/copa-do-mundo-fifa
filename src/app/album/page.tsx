"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import { IconStar, IconUser, IconTrophy } from "@/components/Icons";
import PlayerCard from "@/components/PlayerCard";
import PaginaAnimada from "@/components/PaginaAnimada";
import { SkeletonAlbum } from "@/components/Skeleton";

interface Figurinha {
  id: number;
  numero: number;
  tipo: string;
  raridade: string;
  selecao: { id: number; nome: string; codigoPais: string | null; corPrimaria: string | null };
  jogador: {
    nome: string;
    posicao: string;
    fotoUrl: string | null;
    numeroCamisa: number | null;
    dataNascimento: string | null;
    altura: number | null;
    peso: number | null;
    figurinha: { raridade: string } | null;
  } | null;
}

interface AlbumItem {
  figurinhaId: number;
  quantidade: number;
  figurinha: Figurinha;
}

export default function AlbumPage() {
  const [figurinhas, setFigurinhas] = useState<Figurinha[]>([]);
  const [album, setAlbum] = useState<Map<number, AlbumItem>>(new Map());
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [filtroNome, setFiltroNome] = useState("");
  const [abrindo, setAbrindo] = useState(false);
  const [novasFigurinhas, setNovasFigurinhas] = useState<Figurinha[]>([]);
  const [showAnimacao, setShowAnimacao] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; nome: string } | null>(null);
  const [pacotesRestantesHoje, setPacotesRestantesHoje] = useState(10);
  const [limiteDiario, setLimiteDiario] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(0);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const cached = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
    if (cached) setUser(cached);
  }, []);

  const getAuthHeaders = (): Record<string, string> => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const carregarDados = useCallback(async () => {
    const [figRes, albumRes] = await Promise.all([
      fetch("/api/figurinhas"),
      fetch("/api/album", { headers: { ...getAuthHeaders() } }),
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
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const abrirPacote = async () => {
    setAbrindo(true);

    const res = await fetch("/api/album/abrir-pacote", {
      method: "POST",
      headers: { ...getAuthHeaders() },
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

  const statusFigurinha = (figId: number) => {
    const item = album.get(figId);
    if (!item) return "faltando";
    if (item.quantidade > 1) return "repetida";
    return "tenho";
  };

  const getStatusStyle = (figId: number) => {
    const status = statusFigurinha(figId);
    if (status === "faltando") return "opacity-30 grayscale";
    if (status === "repetida") return "ring-2 ring-amber-400";
    return "";
  };

  const selecoesAgrupadas = useMemo(() => {
    const map = new Map<number, { selecao: Figurinha['selecao']; figurinhas: Figurinha[] }>();
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
      if (filtroNome && !selecao.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false;
      return figurinhas.some(f => {
        const status = statusFigurinha(f.id);
        if (filtroStatus === "tenho" && status !== "tenho") return false;
        if (filtroStatus === "faltando" && status !== "faltando") return false;
        if (filtroStatus === "repetida" && status !== "repetida") return false;
        return true;
      });
    });
  }, [selecoesAgrupadas, filtroStatus, filtroNome]);

  useEffect(() => {
    setPaginaAtual(0);
  }, [filtroStatus, filtroNome]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setPaginaAtual(p => Math.max(0, p - 1));
      if (e.key === "ArrowRight") setPaginaAtual(p => Math.min(selecoesFiltradas.length - 1, p + 1));
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selecoesFiltradas.length]);

  const progresso = figurinhas.length > 0
    ? Math.round((album.size / figurinhas.length) * 100)
    : 0;

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Álbum de Figurinhas</h1>
            <p className="mt-1 text-zinc-500">
              {album.size} de {figurinhas.length} figurinhas ({progresso}%)
            </p>
          </div>
          {user ? (
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={abrirPacote}
                disabled={abrindo || pacotesRestantesHoje === 0}
                className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {abrindo ? "Abrindo..." : pacotesRestantesHoje === 0 ? "Limite diário atingido" : "🎁 Abrir Pacotinho"}
              </button>
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
              <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">Álbum Completo!</h3>
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
                {s === "todas" ? "Todas" : s === "tenho" ? "Tenho" : s === "faltando" ? "Faltando" : "Repetidas"}
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
                const coletadas = figurinhasAtuais.filter(f => statusFigurinha(f.id) !== "faltando").length;

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
                        <FlagIcon codigo={selecaoAtual.codigoPais} className="h-6 w-auto rounded-sm" />
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
                        const repetidaQtd = status === "repetida" ? album.get(fig.id)?.quantidade : null;

                        return (
                          <div key={fig.id} className={`relative ${faltando ? "opacity-30 grayscale" : ""}`}>
                            {fig.jogador ? (
                              <PlayerCard
                                jogador={fig.jogador}
                                corPrimaria={fig.selecao.corPrimaria}
                                codigoPais={fig.selecao.codigoPais}
                              />
                            ) : (
                              <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border border-zinc-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                                <FlagIcon codigo={fig.selecao.codigoPais} className="mb-2 h-10 w-auto rounded-sm" />
                                <span className="text-center text-xs font-bold">{fig.selecao.nome}</span>
                                <span className="text-[10px] text-zinc-400">#{fig.numero}</span>
                              </div>
                            )}
                            {repetidaQtd && (
                              <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                                {repetidaQtd}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPaginaAtual(p => Math.max(0, p - 1))}
                disabled={paginaAtual === 0}
                className="flex items-center gap-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                ◀ Anterior
              </button>
              <span className="text-sm text-zinc-500">
                Página {paginaAtual + 1} de {selecoesFiltradas.length}
              </span>
              <button
                onClick={() => setPaginaAtual(p => Math.min(selecoesFiltradas.length - 1, p + 1))}
                disabled={paginaAtual === selecoesFiltradas.length - 1}
                className="flex items-center gap-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm transition-colors hover:bg-zinc-100 disabled:opacity-30 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Próxima ▶
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-20 text-center text-zinc-500">
            Nenhuma seleção encontrada
          </div>
        )}
      </main>

      {showAnimacao && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm py-8"
          onClick={() => setShowAnimacao(false)}
        >
          <div className="w-full max-w-2xl px-4 text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold text-white">
              <IconStar className="h-6 w-6 text-amber-400" />
              Suas novas figurinhas!
            </h2>
            <div className="mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2">
              {novasFigurinhas.map((fig, i) => (
                <div
                  key={i}
                  className="animate-bounce mx-auto w-full max-w-[200px] shadow-xl shadow-black/30"
                  style={{ animationDelay: `${i * 0.1}s`, animationDuration: "0.5s" }}
                >
                  {fig.jogador ? (
                    <PlayerCard
                      jogador={fig.jogador}
                      raridade={fig.raridade}
                      corPrimaria={fig.selecao.corPrimaria}
                      codigoPais={fig.selecao.codigoPais}
                    />
                  ) : (
                    <div className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 p-4 text-white backdrop-blur-sm">
                      <FlagIcon codigo={fig.selecao.codigoPais} className="h-10 w-auto rounded-sm" />
                      <span className="text-center text-sm font-bold">{fig.selecao.nome}</span>
                      <span className="text-xs text-white/70">#{fig.numero}</span>
                    </div>
                  )}
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
    </div>
    </PaginaAnimada>
  );
}
