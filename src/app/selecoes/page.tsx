"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NavHeader from "@/components/NavHeader";

interface Selecao {
  id: number;
  nome: string;
  bandeiraUrl: string | null;
  grupoId: string;
  continente: string;
  rankingFifa: number | null;
  corPrimaria: string | null;
  corSecundaria: string | null;
  titulos: number;
  _count: { jogadores: number };
}

export default function SelecoesPage() {
  const [selecoes, setSelecoes] = useState<Selecao[]>([]);
  const [grupoFiltro, setGrupoFiltro] = useState("");

  useEffect(() => {
    const url = grupoFiltro ? `/api/selecoes?grupo=${grupoFiltro}` : "/api/selecoes";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setSelecoes(d.selecoes));
  }, [grupoFiltro]);

  const grupos = "ABCDEFGHIJKL".split("");

  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold">Seleções</h1>
        <p className="mt-1 text-zinc-500">48 seleções divididas em 12 grupos</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => setGrupoFiltro("")}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              !grupoFiltro
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            }`}
          >
            Todos
          </button>
          {grupos.map((g) => (
            <button
              key={g}
              onClick={() => setGrupoFiltro(g)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                grupoFiltro === g
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              Grupo {g}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {selecoes.map((sel) => (
            <Link
              key={sel.id}
              href={`/selecoes/${sel.id}`}
              className="group rounded-xl border border-zinc-200 p-5 transition-all hover:border-zinc-400 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-600"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-white"
                  style={{ backgroundColor: sel.corPrimaria || "#666" }}
                >
                  {sel.nome.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold group-hover:underline">
                    {sel.nome}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Grupo {sel.grupoId} · {sel.continente}
                    {sel.titulos > 0 && ` · ${sel.titulos} títulos`}
                  </p>
                  {sel.rankingFifa && (
                    <p className="text-xs text-zinc-400">
                      Ranking FIFA: {sel.rankingFifa}º
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
