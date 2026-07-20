"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StickerCard from "@/components/StickerCard";
import { IconRepeat, IconArrowLeft } from "@/components/Icons";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import type { FigurinhaResumo, FigurinhaAlbum } from "@/types";

export default function NovaTrocaPage() {
  const params = useParams();
  const router = useRouter();
  const usuarioSlug = params.usuarioSlug as string;
  const figurinhaSlug = params.figurinhaSlug as string;
  const { user: userLogado, getAuthHeaders } = useAuth();

  const [desejada, setDesejada] = useState<FigurinhaResumo | null>(null);
  const [destinatario, setDestinatario] = useState<{
    id: number;
    nome: string;
    slug: string;
  } | null>(null);
  const [minhasRepetidas, setMinhasRepetidas] = useState<FigurinhaAlbum[]>([]);
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const toggleSelecao = (id: number) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      const albumRes = await fetch("/api/album", { headers: getAuthHeaders() });
      if (albumRes.ok) {
        const albumData = await albumRes.json();
        if (albumData.album) {
          const repetidas = albumData.album.filter((item: FigurinhaAlbum) => item.quantidade >= 2);
          setMinhasRepetidas(repetidas);
        }
      }
    } catch {
      // silent
    }

    try {
      const userRes = await fetch(`/api/usuarios/${usuarioSlug}/repetidas`);
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.usuario) setDestinatario(userData.usuario);
        if (userData.repetidas) {
          const desejadaItem = userData.repetidas.find(
            (r: { figurinha: FigurinhaResumo }) => r.figurinha.slug === figurinhaSlug,
          );
          if (desejadaItem) setDesejada(desejadaItem.figurinha);
        }
      }
    } catch {
      // silent
    } finally {
      setCarregando(false);
    }
  }, [usuarioSlug, figurinhaSlug, getAuthHeaders]);

  useEffect(() => {
    if (!usuarioSlug || !figurinhaSlug) return;
    carregarDados();
  }, [usuarioSlug, figurinhaSlug, carregarDados]);

  const enviarSolicitacao = async () => {
    if (selecionadas.size === 0) return;
    setEnviando(true);
    setErro("");

    const res = await fetch("/api/trocas", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        figurinhasOferecidasIds: Array.from(selecionadas),
        figurinhaDesejadaId: desejada?.id,
        destinatarioId: destinatario?.id,
      }),
    });

    if (res.ok) {
      router.push("/trocas");
    } else {
      const data = await res.json();
      setErro(data.erro || "Erro ao enviar solicitação");
      setEnviando(false);
    }
  };

  if (!userLogado) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-8 text-center text-zinc-400">
        <IconRepeat className="mx-auto h-12 w-12" />
        <p className="mt-4 text-lg">Faça login para solicitar trocas</p>
        <Link
          href="/login"
          className="mt-2 inline-block text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Ir para login
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href={`/perfil/${destinatario?.slug || usuarioSlug}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <IconArrowLeft className="h-4 w-4" />
        Voltar ao perfil
      </Link>

      <h1 className="mb-2 text-2xl font-bold">Nova Solicitação de Troca</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Oferecendo para <strong>{destinatario?.nome || "..."}</strong>
      </p>

      {carregando ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-4 w-48" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {desejada && (
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-zinc-500">Figurinha desejada:</p>
              <div className="mx-auto max-w-[200px]">
                <StickerCard figurinha={desejada} />
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-zinc-500">
              Selecione uma ou mais figurinhas repetidas para oferecer:
            </p>
            {minhasRepetidas.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 p-8 text-center text-zinc-400 dark:border-zinc-800">
                <IconRepeat className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm">Você não tem figurinhas repetidas para oferecer.</p>
                <Link
                  href="/album"
                  className="mt-2 inline-block text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Ir para o álbum
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 min-[400px]:gap-3 sm:gap-4 sm:grid-cols-3">
                {minhasRepetidas.map((item) => {
                  const selecionado = selecionadas.has(item.figurinhaId);
                  return (
                    <button
                      key={item.figurinhaId}
                      onClick={() => toggleSelecao(item.figurinhaId)}
                      className={`relative flex flex-col h-full cursor-pointer text-left transition-all ${
                        selecionado
                          ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900 scale-[1.02]"
                          : "hover:scale-[1.02]"
                      }`}
                    >
                      <StickerCard figurinha={item.figurinha} />
                      {selecionado && (
                        <span className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-zinc-50">
                          &#10003;
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {erro && <p className="mb-4 text-sm text-red-500">{erro}</p>}

          <button
            onClick={enviarSolicitacao}
            disabled={selecionadas.size === 0 || enviando}
            className="mt-4 w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-all hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {enviando
              ? "Enviando..."
              : `Enviar Solicitação (${selecionadas.size} figurinha${selecionadas.size !== 1 ? "s" : ""})`}
          </button>
        </>
      )}
    </main>
  );
}
