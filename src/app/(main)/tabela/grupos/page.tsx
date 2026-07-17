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
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-zinc-500">
                      <th className="px-3 py-2 font-medium sticky left-0 z-20 bg-zinc-100/90 backdrop-blur-sm dark:bg-zinc-800/90 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        Seleção
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-zinc-900 dark:text-zinc-100">
                        P
                      </th>
                      <th className="px-3 py-2 text-center font-medium">J</th>
                      <th className="px-3 py-2 text-center font-medium">V</th>
                      <th className="px-3 py-2 text-center font-medium">E</th>
                      <th className="px-3 py-2 text-center font-medium">D</th>
                      <th className="px-3 py-2 text-center font-medium">GM</th>
                      <th className="px-3 py-2 text-center font-medium">GC</th>
                      <th className="px-3 py-2 text-center font-medium">SG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.selecoes.map((sel, idx) => (
                      <tr
                        key={sel.id}
                        className={`border-t border-zinc-200 dark:border-zinc-700/50 transition-colors bg-zinc-100 hover:bg-zinc-200/80 even:bg-zinc-200/50 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:even:bg-zinc-700/50 group border-l-4 ${
                          idx < 2
                            ? "border-l-emerald-500"
                            : idx === 2
                              ? "border-l-amber-500"
                              : "border-l-red-500"
                        }`}
                      >
                        <td className="px-3 py-3 sticky left-0 z-10 bg-inherit backdrop-blur-md shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-400 w-4">{idx + 1}</span>
                            <FlagIcon codigo={sel.codigoPais} className="h-5 w-auto rounded-sm" />
                            <span className="font-medium">{sel.nome}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-bold">{sel.p}</td>
                        <td className="px-3 py-3 text-center text-zinc-500">{sel.j}</td>
                        <td className="px-3 py-3 text-center text-zinc-500">{sel.v}</td>
                        <td className="px-3 py-3 text-center text-zinc-500">{sel.e}</td>
                        <td className="px-3 py-3 text-center text-zinc-500">{sel.d}</td>
                        <td className="px-3 py-3 text-center text-zinc-500">{sel.gp}</td>
                        <td className="px-3 py-3 text-center text-zinc-500">{sel.gc}</td>
                        <td className="px-3 py-3 text-center font-medium text-zinc-600 dark:text-zinc-400">
                          {sel.sg > 0 ? `+${sel.sg}` : sel.sg}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 border-l-[3px] border-l-emerald-500" />
                    Classificado
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 border-l-[3px] border-l-amber-500" />
                    Repescagem
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-block h-3 border-l-[3px] border-l-red-500" />
                    Eliminado
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
