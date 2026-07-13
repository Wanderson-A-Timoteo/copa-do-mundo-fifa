"use client";

import React from "react";
import Link from "next/link";
import BolaAnimada from "@/components/BolaAnimada";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <BolaAnimada className="h-36 w-36" />
        <h1 className="mt-8 text-5xl font-bold">Algo deu errado</h1>
        <p className="mt-4 text-zinc-500">Ocorreu um erro inesperado ao carregar esta página.</p>
        <p className="mt-1 text-sm text-zinc-400">
          {error?.message || "Tente novamente ou volte para o início."}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Tentar novamente
          </button>
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-all hover:scale-[1.03] hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Voltar para o início
          </Link>
        </div>
      </main>
    </div>
  );
}
