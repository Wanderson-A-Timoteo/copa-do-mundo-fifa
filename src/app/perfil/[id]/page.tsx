"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import PaginaAnimada from "@/components/PaginaAnimada";
import PlayerCard from "@/components/PlayerCard";
import { FlagIcon } from "@/components/FlagIcon";
import { IconRepeat, IconUser } from "@/components/Icons";
import { Skeleton } from "@/components/Skeleton";

interface FigurinhaResumo {
  id: number;
  numero: number;
  raridade: string;
  selecao: { id: number; nome: string; codigoPais: string | null; corPrimaria: string | null };
  jogador: { nome: string; posicao: string; fotoUrl: string | null; numeroCamisa: number | null; dataNascimento: string | null; altura: number | null; peso: number | null; figurinha: { raridade: string } | null } | null;
}

interface RepetidaItem {
  quantidade: number;
  figurinha: FigurinhaResumo;
}

export default function PerfilPublicoPage() {
  const params = useParams();
  const usuarioId = Number(params.id);
  const [usuario, setUsuario] = useState<{ id: number; nome: string } | null>(null);
  const [repetidas, setRepetidas] = useState<RepetidaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [userLogado, setUserLogado] = useState<{ id: number; nome: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const cached = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
    if (cached) setUserLogado(cached);
  }, []);

  useEffect(() => {
    if (!usuarioId || isNaN(usuarioId)) return;
    fetch(`/api/usuarios/${usuarioId}/repetidas`)
      .then(r => r.json())
      .then(data => {
        setUsuario(data.usuario);
        setRepetidas(data.repetidas);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [usuarioId]);

  const ehProprioPerfil = userLogado?.id === usuarioId;

  if (carregando) {
    return (
      <PaginaAnimada>
        <div className="min-h-screen">
          <NavHeader />
          <main className="mx-auto max-w-5xl px-6 py-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
              </div>
            </div>
          </main>
        </div>
      </PaginaAnimada>
    );
  }

  if (!usuario) {
    return (
      <PaginaAnimada>
        <div className="min-h-screen">
          <NavHeader />
          <main className="mx-auto max-w-lg px-6 py-8 text-center text-zinc-400">
            <IconUser className="mx-auto h-12 w-12" />
            <p className="mt-4 text-lg">Usuário não encontrado</p>
          </main>
        </div>
      </PaginaAnimada>
    );
  }

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200 text-xl font-bold dark:bg-zinc-700">
              {usuario.nome.charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 className="text-2xl font-bold">{usuario.nome}</h1>
              <p className="text-sm text-zinc-500">{repetidas.length} figurinha{repetidas.length !== 1 ? "s" : ""} repetida{repetidas.length !== 1 ? "s" : ""} disponíve{repetidas.length !== 1 ? "is" : "l"} para troca</p>
            </div>
          </div>

          {repetidas.length === 0 ? (
            <div className="mt-16 text-center text-zinc-400">
              <IconRepeat className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-medium">Nenhuma figurinha repetida disponível</p>
              <p className="mt-1 text-sm">Este usuário não possui figurinhas repetidas no momento.</p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {repetidas.map((item) => (
                <div key={item.figurinha.id} className="relative">
                  {item.figurinha.jogador ? (
                    <PlayerCard
                      jogador={item.figurinha.jogador}
                      raridade={item.figurinha.raridade}
                      corPrimaria={item.figurinha.selecao.corPrimaria}
                      codigoPais={item.figurinha.selecao.codigoPais}
                    />
                  ) : (
                    <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border border-zinc-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                      <FlagIcon codigo={item.figurinha.selecao.codigoPais} className="mb-2 h-10 w-auto rounded-sm" />
                      <span className="text-center text-xs font-bold">{item.figurinha.selecao.nome}</span>
                      <span className="text-[10px] text-zinc-400">#{item.figurinha.numero}</span>
                    </div>
                  )}
                  <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                    {item.quantidade}
                  </span>
                  {userLogado && !ehProprioPerfil && (
                    <Link
                      href={`/trocas/nova/${usuario.id}/${item.figurinha.id}`}
                      className="mt-1 flex w-full items-center justify-center gap-1 rounded-md bg-zinc-900 py-1 text-[10px] font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    >
                      Solicitar Troca
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {!userLogado && (
            <div className="mt-8 text-center">
              <Link href="/login" className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300">
                Faça login para solicitar trocas
              </Link>
            </div>
          )}
        </main>
      </div>
    </PaginaAnimada>
  );
}
