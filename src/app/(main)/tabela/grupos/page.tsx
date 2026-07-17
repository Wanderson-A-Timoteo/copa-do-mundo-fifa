"use client";

import { useEffect, useState } from "react";

import { FlagIcon } from "@/components/FlagIcon";
import { SkeletonTabela } from "@/components/Skeleton";
import type { GrupoComClassificacao } from "@/types";

export default function TabelaPage() {
  const [grupos, setGrupos] = useState<GrupoComClassificacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((d) => setGrupos(d.grupos ?? []))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
        <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
          Tabela de Jogos
        </h1>
      </div>

      {carregando ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonTabela key={i} />
          ))}
        </div>
      ) : grupos.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-zinc-500">Nenhum resultado oficial registrado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              className="overflow-hidden rounded-2xl border border-zinc-200/50 bg-zinc-100/90 p-4 sm:p-5 shadow-sm backdrop-blur-md dark:border-zinc-700/50 dark:bg-zinc-800/90"
            >
              <h2 className="mb-4 text-lg font-bold">{grupo.nome}</h2>
              <div className="overflow-x-auto pb-2">
                <table className="w-full text-sm min-w-[500px] table-fixed">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500">
                      <th className="pb-2 text-center font-medium sticky left-0 z-10 bg-zinc-100/90 backdrop-blur-md dark:bg-zinc-800/90 w-8 after:absolute after:inset-y-0 after:right-[-4px] after:w-[4px] after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.5)]">
                        #
                      </th>
                      <th className="pb-2 font-medium">Seleção</th>
                      <th className="pb-2 text-center font-medium w-8 text-zinc-900 dark:text-zinc-100">
                        P
                      </th>
                      <th className="pb-2 text-center font-medium w-8">J</th>
                      <th className="pb-2 text-center font-medium w-8">V</th>
                      <th className="pb-2 text-center font-medium w-8">E</th>
                      <th className="pb-2 text-center font-medium w-8">D</th>
                      <th className="pb-2 text-center font-medium w-10">GM</th>
                      <th className="pb-2 text-center font-medium w-10">GC</th>
                      <th className="pb-2 text-center font-medium w-10">SG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.selecoes.map((sel, idx) => (
                      <tr
                        key={sel.id}
                        className="border-t border-zinc-200 dark:border-zinc-700/50 transition-colors bg-zinc-100 hover:bg-zinc-200/80 even:bg-zinc-200/50 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:even:bg-zinc-700/50 group"
                      >
                        <td className="py-2.5 text-center font-bold text-zinc-400 sticky left-0 z-10 bg-inherit backdrop-blur-md after:absolute after:inset-y-0 after:right-[-4px] after:w-[4px] after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.5)]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <FlagIcon
                              codigo={sel.codigoPais}
                              className="h-4 w-auto rounded-sm shadow-sm"
                            />
                            <span className="font-medium">{sel.nome}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-bold">{sel.p}</td>
                        <td className="py-2.5 text-center text-zinc-500">{sel.j}</td>
                        <td className="py-2.5 text-center text-zinc-500">{sel.v}</td>
                        <td className="py-2.5 text-center text-zinc-500">{sel.e}</td>
                        <td className="py-2.5 text-center text-zinc-500">{sel.d}</td>
                        <td className="py-2.5 text-center text-zinc-500">{sel.gp}</td>
                        <td className="py-2.5 text-center text-zinc-500">{sel.gc}</td>
                        <td className="py-2.5 text-center font-medium text-zinc-600 dark:text-zinc-400">
                          {sel.sg > 0 ? `+${sel.sg}` : sel.sg}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
