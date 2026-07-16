import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import BolaAnimada from "@/components/BolaAnimada";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-12 text-center">
        <div className="flex w-full max-w-lg flex-col items-center rounded-3xl border border-zinc-200 bg-zinc-100/50 p-12 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-800/50">
          <BolaAnimada className="h-40 w-40 drop-shadow-xl" />
          <h1 className="mt-8 text-8xl font-black tracking-tighter text-zinc-900 dark:text-zinc-100">
            404
          </h1>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
            Gol anulado!
          </h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            A página que você procura não existe ou está impedida.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 text-sm font-bold text-zinc-50 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:bg-emerald-500 active:scale-95"
          >
            Voltar para o campo
          </Link>
        </div>
      </main>
    </div>
  );
}
