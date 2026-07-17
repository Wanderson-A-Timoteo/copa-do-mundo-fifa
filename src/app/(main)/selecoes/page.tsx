"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlagIcon } from "@/components/FlagIcon";
import { SkeletonSelecaoCard } from "@/components/Skeleton";
import type { SelecaoResumo } from "@/types";

export default function SelecoesPage() {
  const [selecoes, setSelecoes] = useState<SelecaoResumo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [grupoFiltro, setGrupoFiltro] = useState("");

  useEffect(() => {
    setCarregando(true);
    const url = grupoFiltro ? `/api/selecoes?grupo=${grupoFiltro}` : "/api/selecoes";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setSelecoes(d.selecoes))
      .finally(() => setCarregando(false));
  }, [grupoFiltro]);

  const grupos = "ABCDEFGHIJKL".split("");

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
        Seleções
      </h1>
      <p className="mt-1 text-zinc-500">48 seleções divididas em 12 grupos</p>

      <div className="mt-6 flex flex-wrap gap-1.5 rounded-2xl bg-zinc-200/50 p-1.5 dark:bg-zinc-800/50 w-fit">
        <button
          onClick={() => setGrupoFiltro("")}
          className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
            !grupoFiltro
              ? "bg-zinc-800 text-zinc-50 shadow-sm dark:bg-zinc-300 dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50"
          }`}
        >
          Todos
        </button>
        {grupos.map((g) => (
          <button
            key={g}
            onClick={() => setGrupoFiltro(g)}
            className={`rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-300 ${
              grupoFiltro === g
                ? "bg-zinc-800 text-zinc-50 shadow-sm dark:bg-zinc-300 dark:text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50"
            }`}
          >
            Grupo {g}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {carregando ? (
          Array.from({ length: 12 }).map((_, i) => <SkeletonSelecaoCard key={i} />)
        ) : selecoes.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <p className="text-zinc-500">Nenhuma seleção encontrada.</p>
          </div>
        ) : (
          selecoes.map((sel) => (
            <Link
              key={sel.id}
              href={`/selecoes/${sel.slug || sel.id}`}
              className="group rounded-2xl border border-zinc-200/50 bg-zinc-100/90 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-700/50 dark:bg-zinc-800/90"
            >
              <div className="flex items-center gap-4">
                <FlagIcon
                  codigo={sel.codigoPais}
                  className="h-10 w-auto rounded-sm drop-shadow-sm"
                />
                <div>
                  <h2 className="font-semibold text-zinc-800 transition-colors group-hover:text-emerald-600 dark:text-zinc-100 dark:group-hover:text-emerald-400">
                    {sel.nome}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Grupo {sel.grupoId} · {sel.continente}
                    {sel.titulos > 0 && ` · ${sel.titulos} títulos`}
                  </p>
                  {sel.rankingFifa && (
                    <p className="text-xs text-zinc-400">Ranking FIFA: {sel.rankingFifa}º</p>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
