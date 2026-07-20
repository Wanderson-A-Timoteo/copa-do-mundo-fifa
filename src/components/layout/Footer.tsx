"use client";

import Link from "next/link";
import { Trophy, ChevronUp, Instagram, Twitter, Github } from "lucide-react";

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
              <Instagram className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/25 active:scale-95 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-emerald-500 dark:hover:text-zinc-50"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200/50 text-zinc-600 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:bg-emerald-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/25 active:scale-95 dark:bg-zinc-800/50 dark:text-zinc-400 dark:hover:bg-emerald-500 dark:hover:text-zinc-50"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
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
