"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import ActiveLink from "./ActiveLink";
import {
  CalendarDays,
  Trophy,
  Calculator,
  Swords,
  Target,
  Medal,
  Book,
  Repeat,
} from "lucide-react";

export default function NavHeader({ transparent }: { transparent?: boolean }) {
  const pathname = usePathname();
  const headerClass = transparent
    ? "absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-transparent px-6 py-4 text-zinc-50"
    : "sticky top-0 z-[110] flex items-center justify-between border-b border-zinc-200 bg-zinc-100/80 px-6 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-800/80";

  return (
    <>
      <header className={headerClass}>
        <Link href="/" className="inline-flex items-center gap-1.5 text-lg font-bold">
          <Trophy className="h-5 w-5" /> Copa 2026
        </Link>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          <ActiveLink href="/">Início</ActiveLink>
          <ActiveLink href="/selecoes">Seleções</ActiveLink>
          <div className="relative group">
            <button
              className={`flex cursor-pointer items-center gap-1 transition-all ${pathname.startsWith("/tabela/grupos") || pathname.startsWith("/tabela/oficial") ? "opacity-100 font-semibold" : "opacity-50 hover:opacity-100"}`}
            >
              Classificação
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span
                className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-current transition-transform duration-300 ${pathname.startsWith("/tabela/grupos") || pathname.startsWith("/tabela/oficial") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
              />
            </button>
            <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-zinc-100 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900">
              <Link
                href="/tabela/grupos"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <CalendarDays className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Tabela de Grupos</span>
              </Link>
              <Link
                href="/tabela/oficial"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trophy className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Tabela Oficial</span>
              </Link>
            </div>
          </div>
          <div className="relative group">
            <button
              className={`flex cursor-pointer items-center gap-1 transition-all ${pathname.startsWith("/tabela/simulacao") ? "opacity-100 font-semibold" : "opacity-50 hover:opacity-100"}`}
            >
              Simulação
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span
                className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-current transition-transform duration-300 ${pathname.startsWith("/tabela/simulacao") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
              />
            </button>
            <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-zinc-100 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900">
              <Link
                href="/tabela/simulacao-grupos"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Calculator className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Simulador de Grupos</span>
              </Link>
              <Link
                href="/tabela/simulacao-mata-mata"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Swords className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Simulador Mata-Mata</span>
              </Link>
            </div>
          </div>
          <div className="relative group">
            <button
              className={`flex cursor-pointer items-center gap-1 transition-all ${pathname.startsWith("/palpites") ? "opacity-100 font-semibold" : "opacity-50 hover:opacity-100"}`}
            >
              Bolão Oficial
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span
                className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-current transition-transform duration-300 ${pathname.startsWith("/palpites") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
              />
            </button>
            <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-zinc-100 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900">
              <Link
                href="/palpites/bolao"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Target className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Palpites do Bolão</span>
              </Link>
              <Link
                href="/palpites/bolao/ranking"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Medal className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Ranking do Bolão</span>
              </Link>
            </div>
          </div>
          <div className="relative group">
            <button
              className={`flex cursor-pointer items-center gap-1 transition-all ${pathname === "/album" || pathname === "/trocas" ? "opacity-100 font-semibold" : "opacity-50 hover:opacity-100"}`}
            >
              Álbum
              <svg
                className="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <span
                className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-current transition-transform duration-300 ${pathname === "/album" || pathname === "/trocas" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
              />
            </button>
            <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-zinc-100 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900">
              <Link
                href="/album"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Book className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Álbuns de figurinhas</span>
              </Link>
              <Link
                href="/trocas"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-200/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Repeat className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Trocar Figurinhas</span>
              </Link>
            </div>
          </div>
          <ActiveLink href="/estadios">Estádios</ActiveLink>
          <ThemeToggle />
          <UserMenu />
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>
    </>
  );
}
