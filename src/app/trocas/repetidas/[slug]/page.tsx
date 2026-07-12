"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import PaginaAnimada from "@/components/PaginaAnimada";
import StickerCard from "@/components/StickerCard";
import { IconUser, IconArrowLeft, IconRepeat } from "@/components/Icons";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface FigurinhaDetalhe {
  id: number;
  slug: string;
  numero: number;
  raridade: string;
  selecao: { id: number; nome: string; codigoPais: string | null; corPrimaria: string | null };
  jogador: {
    nome: string; posicao: string; fotoUrl: string | null; numeroCamisa: number | null;
    dataNascimento: string | null; altura: number | null; peso: number | null;
    figurinha: { raridade: string } | null;
  } | null;
}

export default function RepetidasDetalhePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user: userLogado } = useAuth();
  const [figurinha, setFigurinha] = useState<FigurinhaDetalhe | null>(null);
  const [usuarios, setUsuarios] = useState<{ id: number; nome: string; slug: string; quantidade: number }[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/figurinhas/repetidas/${slug}`)
      .then(r => r.json())
      .then(data => {
        setFigurinha(data.figurinha);
        setUsuarios(data.usuarios || []);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [slug]);

  if (carregando) {
    return (
      <PaginaAnimada>
        <div className="min-h-screen">
          <NavHeader />
          <main className="mx-auto max-w-3xl px-6 py-8">
            <Skeleton className="mb-4 h-6 w-48" />
            <div className="flex justify-center">
              <Skeleton className="h-64 w-48 rounded-xl" />
            </div>
            <div className="mt-8 space-y-3">
              {[1,2,3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </main>
        </div>
      </PaginaAnimada>
    );
  }

  if (!figurinha) {
    return (
      <PaginaAnimada>
        <div className="min-h-screen">
          <NavHeader />
          <main className="mx-auto max-w-lg px-6 py-8 text-center text-zinc-400">
            <IconRepeat className="mx-auto h-12 w-12" />
            <p className="mt-4 text-lg">Figurinha não encontrada</p>
          </main>
        </div>
      </PaginaAnimada>
    );
  }

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <Link href="/trocas" className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            <IconArrowLeft className="h-4 w-4" />
            Voltar para trocas
          </Link>

          <div className="mb-8 flex flex-col items-center">
            <h1 className="mb-6 text-2xl font-bold">Figurinhas disponíveis</h1>
            <div className="w-full max-w-[220px]">
              <StickerCard figurinha={figurinha} />
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold">
              {usuarios.length} {usuarios.length === 1 ? "usuário tem" : "usuários têm"} esta figurinha repetida
            </h2>

            {usuarios.length === 0 ? (
              <div className="rounded-xl border border-zinc-200 p-8 text-center text-zinc-400 dark:border-zinc-800">
                <IconUser className="mx-auto h-8 w-8" />
                <p className="mt-2 text-sm">Nenhum usuário disponível no momento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usuarios.map((usr) => (
                  <div
                    key={usr.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold dark:bg-zinc-700">
                        {usr.nome.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold">{usr.nome}</p>
                        <p className="text-xs text-zinc-400">{usr.quantidade} disponíve{usr.quantidade !== 1 ? "is" : "l"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {userLogado && userLogado.id !== usr.id && (
                        <Link
                          href={`/trocas/nova/${usr.slug || usr.id}/${figurinha.slug}`}
                          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          Solicitar Troca
                        </Link>
                      )}
                      <Link
                        href={`/perfil/${usr.slug || usr.id}`}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      >
                        Ver perfil
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </PaginaAnimada>
  );
}
