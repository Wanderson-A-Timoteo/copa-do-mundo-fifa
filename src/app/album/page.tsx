"use client";

import { useEffect, useState, useCallback } from "react";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import { IconStar } from "@/components/Icons";
import Link from "next/link";
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

  const usuarioId = 1;

  const carregarDados = useCallback(async () => {
    const params = filtroSelecao ? `?selecaoId=${filtroSelecao}` : "";
    const [figRes, albumRes] = await Promise.all([
      fetch(`/api/figurinhas${params}`),
      fetch("/api/album", { headers: { "x-usuario-id": "1" } }),
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

    for (const fig of pacote) {
      await fetch("/api/album", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-usuario-id": "1",
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
          <button
            onClick={abrirPacote}
            disabled={abrindo}
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {abrindo ? "Abrindo..." : "🎁 Abrir Pacotinho"}
          </button>
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
        ) : (
          <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            {figurinhas
              .filter((f) => {
                const status = statusFigurinha(f.id);
                if (filtroStatus === "tenho" && status !== "tenho") return false;
                if (filtroStatus === "faltando" && status !== "faltando") return false;
                if (filtroStatus === "repetida" && status !== "repetida") return false;
                return true;
              })
              .map((fig) => (
                  <div
                    key={fig.id}
                    className={`relative flex aspect-[3/4] cursor-default flex-col items-center justify-center rounded-lg border p-1 text-center transition-all hover:scale-105 ${getStatusStyle(fig.id)} ${
                      statusFigurinha(fig.id) === "faltando"
                        ? "border-zinc-200 dark:border-zinc-800"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                    style={{
                      backgroundColor: statusFigurinha(fig.id) !== "faltando"
                        ? (fig.selecao.corPrimaria || "#666") + "20"
                        : undefined,
                    }}
                  >
                    <FlagIcon codigo={fig.selecao.codigoPais} className="mb-1 h-5 w-auto rounded-sm" />
                  <span className="text-[10px] font-bold leading-tight">
                    {fig.jogador?.nome || fig.selecao.nome}
                  </span>
                  <span className="text-[8px] text-zinc-400">
                    #{fig.numero}
                  </span>
                  {fig.raridade === "rara" && (
                    <span className="mt-0.5 text-[8px] font-bold text-amber-500">
                      RARA
                    </span>
                  )}
                  {statusFigurinha(fig.id) === "repetida" && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                      {album.get(fig.id)?.quantidade}
                    </span>
                  )}
                </div>
              ))}
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
