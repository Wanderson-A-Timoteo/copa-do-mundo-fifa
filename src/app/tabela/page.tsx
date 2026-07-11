"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import PaginaAnimada from "@/components/PaginaAnimada";
import { SkeletonTabela } from "@/components/Skeleton";

interface ClassificacaoSelecao {
  id: number;
  nome: string;
  codigoPais: string | null;
  p: number;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
}

interface GrupoComClassificacao {
  id: string;
  nome: string;
  selecoes: ClassificacaoSelecao[];
}

export default function TabelaPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [grupos, setGrupos] = useState<GrupoComClassificacao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((d) => setGrupos(d.grupos ?? []))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
          <h1 className="text-3xl font-bold">Tabela de Jogos</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/tabela")}
              className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm transition-colors ${
                pathname === "/tabela"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              Grupos
            </button>
            <button
              onClick={() => router.push("/tabela/placar")}
              className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm transition-colors ${
                pathname === "/tabela/placar"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              Adicionar Placar
            </button>
            <button
              onClick={() => router.push("/tabela/mata-mata")}
              className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm transition-colors ${
                pathname === "/tabela/mata-mata"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              Adicionar Mata-Mata
            </button>

          </div>
        </div>

        {carregando ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonTabela key={i} />)}
          </div>
        ) : grupos.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg text-zinc-500">Nenhum resultado oficial registrado ainda.</p>
          </div>
        ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {grupos.map((grupo) => (
            <div
              key={grupo.id}
              className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800"
            >
              <h2 className="mb-4 text-lg font-bold">{grupo.nome}</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-zinc-500">
                    <th className="pb-2 font-medium">#</th>
                    <th className="pb-2 font-medium">Seleção</th>
                    <th className="pb-2 text-center font-medium">P</th>
                    <th className="pb-2 text-center font-medium">J</th>
                    <th className="pb-2 text-center font-medium">V</th>
                    <th className="pb-2 text-center font-medium">E</th>
                    <th className="pb-2 text-center font-medium">D</th>
                    <th className="pb-2 text-center font-medium">SG</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.selecoes.map((sel, idx) => (
                    <tr
                      key={sel.id}
                      className="border-t border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="py-2 font-bold text-zinc-400">{idx + 1}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <FlagIcon codigo={sel.codigoPais} className="h-4 w-auto rounded-sm" />
                          <span className="font-medium">{sel.nome}</span>
                        </div>
                      </td>
                      <td className="py-2 text-center font-bold">{sel.p}</td>
                      <td className="py-2 text-center text-zinc-500">{sel.j}</td>
                      <td className="py-2 text-center text-zinc-500">{sel.v}</td>
                      <td className="py-2 text-center text-zinc-500">{sel.e}</td>
                      <td className="py-2 text-center text-zinc-500">{sel.d}</td>
                      <td className="py-2 text-center text-zinc-500">
                        {sel.sg > 0 ? `+${sel.sg}` : sel.sg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        )}
      </main>
    </div>
    </PaginaAnimada>
  );
}
