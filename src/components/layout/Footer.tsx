import Link from "next/link";
import { Trophy } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white px-6 py-12 dark:border-zinc-800 dark:bg-zinc-950 pb-24 md:pb-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-100"
          >
            <Trophy className="h-5 w-5 text-emerald-500" />
            FIFA 2026
          </Link>
          <p className="text-center text-sm text-zinc-500 md:text-left">
            Acompanhe a maior Copa do Mundo de todos os tempos.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link
            href="/termos-de-uso"
            className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            Termos de Uso
          </Link>
          <Link
            href="/politicas-de-privacidade"
            className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            Privacidade
          </Link>
          <Link
            href="/faq"
            className="transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
          >
            FAQ
          </Link>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-5xl border-t border-zinc-200 pt-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
        &copy; {new Date().getFullYear()} Bolão da Copa. Todos os direitos reservados.
      </div>
    </footer>
  );
}
