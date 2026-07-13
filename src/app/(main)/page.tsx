import Link from "next/link";
import { FlagIcon } from "@/components/FlagIcon";

export default function Home() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div>
        <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Copa do Mundo FIFA 2026
        </h2>
        <p className="mt-4 inline-flex flex-wrap items-center justify-center gap-x-1.5 text-zinc-500">
          <span className="inline-flex items-center gap-1">
            Canadá <FlagIcon codigo="ca" className="h-4 w-auto rounded-sm" />
          </span>
          ·
          <span className="inline-flex items-center gap-1">
            Estados Unidos <FlagIcon codigo="us" className="h-4 w-auto rounded-sm" />
          </span>
          ·
          <span className="inline-flex items-center gap-1">
            México <FlagIcon codigo="mx" className="h-4 w-auto rounded-sm" />
          </span>
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/selecoes"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.03] hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Ver Seleções
          </Link>
          <Link
            href="/tabela"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
          >
            Tabela de Jogos
          </Link>
          <Link
            href="/album"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium transition-all duration-200 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:bg-zinc-800"
          >
            Álbum de Figurinhas
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
            <div className="text-2xl font-bold">48</div>
            <div className="mt-1 text-sm text-zinc-500">Seleções</div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
            <div className="text-2xl font-bold">104</div>
            <div className="mt-1 text-sm text-zinc-500">Partidas</div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
            <div className="text-2xl font-bold">16</div>
            <div className="mt-1 text-sm text-zinc-500">Estádios</div>
          </div>
        </div>
      </div>
    </main>
  );
}
