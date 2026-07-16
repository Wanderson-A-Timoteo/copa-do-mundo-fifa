"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StickerCard from "@/components/StickerCard";
import { IconRepeat, IconArrowLeft, IconUser } from "@/components/Icons";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import Pagination from "@/components/Pagination";
import type { RepetidaItem } from "@/types";

const ITENS_POR_PAGINA = 10;

export default function PerfilPublicoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user: userLogado } = useAuth();
  const [usuario, setUsuario] = useState<{ id: number; nome: string; slug: string } | null>(null);
  const [repetidas, setRepetidas] = useState<RepetidaItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(0);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/usuarios/${slug}/repetidas`)
      .then((r) => r.json())
      .then((data) => {
        setUsuario(data.usuario);
        setRepetidas(data.repetidas || []);
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, [slug]);

  const ehProprioPerfil = userLogado?.id === usuario?.id;

  const filtradas = useMemo(() => {
    if (!busca) return repetidas;
    const q = busca.toLowerCase();
    return repetidas.filter(
      (item) =>
        item.figurinha.jogador?.nome.toLowerCase().includes(q) ||
        item.figurinha.selecao.nome.toLowerCase().includes(q),
    );
  }, [repetidas, busca]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA));
  const paginaSegura = Math.min(paginaAtual, totalPaginas - 1);
  const paginaInicio = paginaSegura * ITENS_POR_PAGINA;
  const paginaFim = paginaInicio + ITENS_POR_PAGINA;
  const paginaItens = filtradas.slice(paginaInicio, paginaFim);

  useEffect(() => {
    setPaginaAtual(0);
  }, [busca]);

  if (carregando) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!usuario) {
    return (
      <main className="mx-auto max-w-lg px-6 py-8 text-center text-zinc-400">
        <IconUser className="mx-auto h-12 w-12" />
        <p className="mt-4 text-lg">Usuário não encontrado</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <Link
        href="/trocas"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <IconArrowLeft className="h-4 w-4" />
        Voltar para trocas
      </Link>

      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200 text-xl font-bold dark:bg-zinc-700">
          {usuario.nome.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{usuario.nome}</h1>
          <p className="text-sm text-zinc-500">
            {filtradas.length} figurinha{filtradas.length !== 1 ? "s" : ""} repetida
            {filtradas.length !== 1 ? "s" : ""} disponíve{filtradas.length !== 1 ? "is" : "l"} para
            troca
          </p>
        </div>
      </div>

      <div className="mt-6">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar figurinha ou seleção..."
          className="w-full rounded-lg border border-zinc-300 bg-transparent py-2 px-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400"
        />
      </div>

      {filtradas.length === 0 ? (
        <div className="mt-16 text-center text-zinc-400">
          <IconRepeat className="mx-auto h-12 w-12" />
          <p className="mt-4 text-lg font-medium">
            {busca ? "Nenhuma figurinha encontrada" : "Nenhuma figurinha repetida disponível"}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {paginaItens.map((item) => (
              <div key={item.figurinha.id} className="relative">
                <StickerCard figurinha={item.figurinha} />
                <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-zinc-50">
                  {item.quantidade}
                </span>
                {userLogado && !ehProprioPerfil && (
                  <Link
                    href={`/trocas/nova/${usuario.slug || usuario.id}/${item.figurinha.slug}`}
                    className="mt-1 flex w-full items-center justify-center gap-1 rounded-md bg-zinc-900 py-1 text-[10px] font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    Solicitar Troca
                  </Link>
                )}
              </div>
            ))}
          </div>

          <Pagination
            paginaAtual={paginaAtual}
            totalItens={filtradas.length}
            itensPorPagina={ITENS_POR_PAGINA}
            onPageChange={setPaginaAtual}
          />
        </>
      )}

      {!userLogado && (
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Faça login para solicitar trocas
          </Link>
        </div>
      )}
    </main>
  );
}
