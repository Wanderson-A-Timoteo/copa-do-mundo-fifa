"use client";

import { useMemo } from "react";

interface PaginationProps {
  paginaAtual: number;
  totalItens: number;
  itensPorPagina: number;
  onPageChange: (page: number) => void;
  maxVisiveis?: number;
}

export default function Pagination({
  paginaAtual,
  totalItens,
  itensPorPagina,
  onPageChange,
  maxVisiveis = 7,
}: PaginationProps) {
  const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
  const paginaSegura = Math.min(paginaAtual, totalPaginas - 1);

  const numeros = useMemo(() => {
    const metade = Math.floor(maxVisiveis / 2);
    let inicio = Math.max(0, paginaSegura - metade);
    const fim = Math.min(totalPaginas, inicio + maxVisiveis);
    if (fim - inicio < maxVisiveis) inicio = Math.max(0, fim - maxVisiveis);
    return Array.from({ length: fim - inicio }, (_, i) => inicio + i);
  }, [paginaSegura, totalPaginas, maxVisiveis]);

  if (totalPaginas <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button
        disabled={paginaSegura === 0}
        onClick={() => onPageChange(Math.max(0, paginaSegura - 1))}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Anterior
      </button>
      {numeros.map((n) => (
        <button
          key={n}
          onClick={() => onPageChange(n)}
          className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-sm transition-colors ${
            n === paginaSegura
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          }`}
        >
          {n + 1}
        </button>
      ))}
      <button
        disabled={paginaSegura >= totalPaginas - 1}
        onClick={() => onPageChange(Math.min(totalPaginas - 1, paginaSegura + 1))}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        Próximo
      </button>
    </div>
  );
}
