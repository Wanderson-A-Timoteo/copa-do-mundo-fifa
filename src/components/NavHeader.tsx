"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import ActiveLink from "./ActiveLink";
import { IconTrophy, IconBook, IconRepeat } from "./Icons";

export default function NavHeader({ transparent }: { transparent?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [tabelaOpen, setTabelaOpen] = useState(false);
  const [simulacaoOpen, setSimulacaoOpen] = useState(false);
  const [bolaoOpen, setBolaoOpen] = useState(false);

  const headerClass = transparent
    ? "absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-transparent px-6 py-4 text-zinc-50"
    : "sticky top-0 z-[110] flex items-center justify-between border-b border-zinc-200 bg-zinc-100/80 px-6 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-800/80";

  const btnHoverClass = transparent
    ? "hover:bg-zinc-100/10"
    : "hover:bg-zinc-100 dark:hover:bg-zinc-800";

  return (
    <>
      <header className={headerClass}>
        <Link href="/" className="inline-flex items-center gap-1.5 text-lg font-bold">
          <IconTrophy className="h-5 w-5" /> Copa 2026
        </Link>
        <nav className="hidden items-center gap-4 text-sm md:flex">
          <ActiveLink href="/">Início</ActiveLink>
          <ActiveLink href="/selecoes">Seleções</ActiveLink>
          <div className="relative group">
            <button className="flex cursor-pointer items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
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
            </button>
            <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-zinc-100 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900">
              <Link
                href="/tabela/grupos"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <IconTrophy className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Tabela de Grupos</span>
              </Link>
              <Link
                href="/tabela/oficial"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <IconTrophy className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Tabela Oficial</span>
              </Link>
            </div>
          </div>
          <div className="relative group">
            <button className="flex cursor-pointer items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
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
            </button>
            <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-zinc-100 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900">
              <Link
                href="/tabela/simulacao-grupos"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <IconTrophy className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Simulador de Grupos</span>
              </Link>
              <Link
                href="/tabela/simulacao-mata-mata"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <IconTrophy className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Simulador Mata-Mata</span>
              </Link>
            </div>
          </div>
          <div className="relative group">
            <button className="flex cursor-pointer items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
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
            </button>
            <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-zinc-100 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900">
              <Link
                href="/palpites/bolao"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <IconTrophy className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Palpites do Bolão</span>
              </Link>
              <Link
                href="/palpites/bolao/ranking"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <IconTrophy className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Ranking do Bolão</span>
              </Link>
            </div>
          </div>
          <div className="relative group">
            <button className="flex cursor-pointer items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
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
            </button>
            <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-zinc-100 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900">
              <Link
                href="/album"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <IconBook className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Álbuns de figurinhas</span>
              </Link>
              <Link
                href="/trocas"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <IconRepeat className="h-4 w-4 shrink-0 text-zinc-400" />
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
