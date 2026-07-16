import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import BolaAnimada from "@/components/BolaAnimada";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
        <BolaAnimada className="h-36 w-36" />
        <h1 className="mt-8 text-8xl font-bold tracking-tight">404</h1>
        <p className="mt-4 text-lg text-zinc-500">Página não encontrada</p>
        <p className="mt-1 text-sm text-zinc-400">
          A página que você procura não existe ou foi removida.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-50 transition-all hover:scale-[1.03] hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Voltar para o início
        </Link>
      </main>
    </div>
  );
}
