"use client";

import Link from "next/link";
import { Trophy, ChevronUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-zinc-200/50 bg-zinc-100/60 px-6 pb-28 pt-12 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/60 md:pb-16">
      {/* Glow Effect */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-64 w-full max-w-3xl -translate-x-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent blur-3xl dark:from-emerald-500/5" />

      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-10 md:flex-row md:items-start">
        {/* Brand & Credits */}
        <div className="flex max-w-sm flex-col items-center gap-4 text-center md:items-start md:text-left">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xl font-black tracking-tight text-zinc-900 transition-all dark:text-zinc-100"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
              <Trophy className="h-5 w-5 text-emerald-500 transition-transform group-hover:scale-110" />
            </div>
            Copa 2026
          </Link>
          <div className="space-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              Aplicação desenvolvida pelos alunos do curso de{" "}
              <strong>Desenvolvimento Full Stack</strong> do <strong>Sesc Escola Cuiabá</strong>.
            </p>
            <p className="text-xs">
              Sob orientação do Prof. <strong>Wanderson Timóteo</strong>.
            </p>
          </div>
        </div>

        {/* Navigation & Social */}
        <div className="flex flex-col items-center gap-8 md:items-end">
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <Link
              href="/termos-de-uso"
              className="transition-all hover:-translate-y-0.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Termos de Uso
            </Link>
            <Link
              href="/politicas-de-privacidade"
              className="transition-all hover:-translate-y-0.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Privacidade
            </Link>
            <Link
              href="/faq"
              className="transition-all hover:-translate-y-0.5 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              FAQ
            </Link>
          </nav>

          <div className="flex gap-4">
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/25 active:scale-95 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-emerald-500 dark:hover:text-zinc-50"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/25 active:scale-95 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-emerald-500 dark:hover:text-zinc-50"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/25 active:scale-95 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-emerald-500 dark:hover:text-zinc-50"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto mt-12 flex max-w-5xl flex-col-reverse items-center justify-between gap-4 border-t border-zinc-200/50 pt-8 dark:border-zinc-800/50 md:flex-row">
        <div className="text-center text-xs font-medium text-zinc-400">
          &copy; {new Date().getFullYear()} Bolão da Copa. Todos os direitos reservados.
        </div>

        <button
          onClick={scrollToTop}
          className="group flex items-center gap-2 rounded-full border border-zinc-200/50 bg-zinc-100/50 px-4 py-2 text-xs font-bold text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-600 active:scale-95 dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:text-emerald-400"
        >
          <ChevronUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
          Voltar ao Topo
        </button>
      </div>
    </footer>
  );
}
