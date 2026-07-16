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
        <h1 className="text-3xl font-bold">Tabela de Jogos</h1>
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
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="mb-4 text-lg font-bold">{grupo.nome}</h2>
              <div className="overflow-x-auto pb-2">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500">
                      <th className="pb-2 font-medium sticky left-0 z-10 bg-white dark:bg-zinc-900">
                        #
                      </th>
                      <th className="pb-2 font-medium sticky left-6 z-10 bg-white dark:bg-zinc-900 after:absolute after:inset-y-0 after:right-[-4px] after:w-[4px] after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.5)]">
                        Seleção
                      </th>
                      <th className="pb-2 text-center font-medium">P</th>
                      <th className="pb-2 text-center font-medium">J</th>
                      <th className="pb-2 text-center font-medium">V</th>
                      <th className="pb-2 text-center font-medium">E</th>
                      <th className="pb-2 text-center font-medium">D</th>
                      <th className="pb-2 text-center font-medium">GM</th>
                      <th className="pb-2 text-center font-medium">GC</th>
                      <th className="pb-2 text-center font-medium">SG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.selecoes.map((sel, idx) => (
                      <tr
                        key={sel.id}
                        className="border-t border-zinc-100 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 even:bg-zinc-50/50 dark:even:bg-zinc-800/30 group"
                      >
                        <td className="py-2.5 font-bold text-zinc-400 pl-1 sticky left-0 z-10 bg-inherit group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 sticky left-6 z-10 bg-inherit group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50 after:absolute after:inset-y-0 after:right-[-4px] after:w-[4px] after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] dark:after:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.5)]">
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
