"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import { IconStar, IconUser } from "@/components/Icons";
import PaginaAnimada from "@/components/PaginaAnimada";

interface Figurinha {
  id: number;
  numero: number;
  tipo: string;
  raridade: string;
  selecao: { id: number; nome: string; codigoPais: string | null; corPrimaria: string | null };
  jogador: { nome: string; posicao: string } | null;
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
  const [filtroSelecao, setFiltroSelecao] = useState("");
  const [abrindo, setAbrindo] = useState(false);
  const [novasFigurinhas, setNovasFigurinhas] = useState<Figurinha[]>([]);
  const [showAnimacao, setShowAnimacao] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; nome: string } | null>(null);
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
    const params = filtroSelecao ? `?selecaoId=${filtroSelecao}` : "";
    const [figRes, albumRes] = await Promise.all([
      fetch(`/api/figurinhas${params}`),
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
    setCarregando(false);
  }, [filtroSelecao]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const abrirPacote = async () => {
    setAbrindo(true);

    const todas = [...figurinhas];
    const pacote: Figurinha[] = [];
    for (let i = 0; i < 7; i++) {
      const idx = Math.floor(Math.random() * todas.length);
      pacote.push(todas[idx]);
    }

    setNovasFigurinhas(pacote);
    setShowAnimacao(true);
    setAbrindo(false);

    const authHeaders = getAuthHeaders();
    for (const fig of pacote) {
      await fetch("/api/album", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ figurinhaId: fig.id }),
      });
    }

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
    return selecoesAgrupadas.filter(({ figurinhas }) =>
      figurinhas.some(f => {
        const status = statusFigurinha(f.id);
        if (filtroStatus === "tenho" && status !== "tenho") return false;
        if (filtroStatus === "faltando" && status !== "faltando") return false;
        if (filtroStatus === "repetida" && status !== "repetida") return false;
        return true;
      })
    );
  }, [selecoesAgrupadas, filtroStatus]);

  useEffect(() => {
    setPaginaAtual(0);
  }, [filtroStatus]);

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
            <button
              onClick={abrirPacote}
              disabled={abrindo}
              className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {abrindo ? "Abrindo..." : "🎁 Abrir Pacotinho"}
            </button>
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

        {carregando ? (
          <div className="mt-20 text-center text-zinc-500">
            Carregando álbum...
          </div>
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

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                      {figurinhasAtuais.map((fig) => {
                        const status = statusFigurinha(fig.id);
                        const cardClass = `relative flex aspect-[3/4] cursor-default flex-col items-center justify-center rounded-lg border p-2 text-center transition-all hover:scale-105 ${
                          status === "faltando"
                            ? "opacity-30 grayscale border-zinc-200 dark:border-zinc-700"
                            : fig.raridade === "rara"
                              ? "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-300 dark:border-amber-600"
                              : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                        } ${status === "repetida" ? "ring-2 ring-amber-400" : ""}`;

                        return (
                          <div key={fig.id} className={cardClass}>
                            <FlagIcon codigo={fig.selecao.codigoPais} className="mb-1 h-6 w-auto rounded-sm" />
                            <span className="text-xs font-bold leading-tight">
                              {fig.jogador?.nome || fig.selecao.nome}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              #{fig.numero}
                            </span>
                            {fig.raridade === "rara" && (
                              <span className="mt-0.5 text-[10px] font-bold text-amber-500">
                                RARA
                              </span>
                            )}
                            {status === "repetida" && (
                              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                                {album.get(fig.id)?.quantidade}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setShowAnimacao(false)}
        >
          <div className="text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-6 text-2xl font-bold text-white">
              🎉 Suas novas figurinhas!
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {novasFigurinhas.map((fig, i) => (
                <div
                  key={i}
                  className="animate-bounce rounded-xl border-2 border-white/30 p-4 text-center text-white"
                  style={{
                    backgroundColor: fig.selecao.corPrimaria || "#666",
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "0.5s",
                  }}
                >
                  <FlagIcon codigo={fig.selecao.codigoPais} className="mx-auto mb-2 h-8 w-auto rounded-sm" />
                  <div className="text-lg font-bold">
                    {fig.jogador?.nome || fig.selecao.nome}
                  </div>
                  <div className="text-sm text-white/70">
                    #{fig.numero} · {fig.selecao.nome}
                  </div>
                  {fig.raridade === "rara" && (
                    <div className="mt-1 text-sm font-bold text-yellow-300">
                      <IconStar className="mr-1 inline-block h-4 w-4" />
                      RARA
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAnimacao(false)}
              className="mt-8 rounded-lg bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-zinc-200"
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
