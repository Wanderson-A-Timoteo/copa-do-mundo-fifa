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

  const headerClass = transparent
    ? "absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-transparent px-6 py-4 text-white"
    : "sticky top-0 z-[110] flex items-center justify-between border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80";

  const btnHoverClass = transparent
    ? "hover:bg-white/10"
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
          <ActiveLink href="/tabela">Classificação</ActiveLink>
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
            <div className="invisible group-hover:visible absolute left-0 top-full mt-1 w-56 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 dark:border-zinc-700 dark:bg-zinc-900">
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
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`cursor-pointer rounded-lg p-2 transition-colors ${btnHoverClass}`}
            aria-label="Abrir menu"
          >
            {mobileOpen ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[105] bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <nav
        className={`fixed top-0 right-0 z-[110] flex h-full w-64 flex-col gap-6 border-l border-zinc-200 bg-white p-6 pt-20 shadow-lg transition-transform duration-300 dark:border-zinc-800 dark:bg-zinc-900 md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 cursor-pointer rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Fechar menu"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <ActiveLink href="/" onClick={() => setMobileOpen(false)}>
          Início
        </ActiveLink>
        <ActiveLink href="/selecoes" onClick={() => setMobileOpen(false)}>
          Seleções
        </ActiveLink>
        <ActiveLink href="/tabela" onClick={() => setMobileOpen(false)}>
          Classificação
        </ActiveLink>
        <div>
          <button
            onClick={() => setAlbumOpen(!albumOpen)}
            className="flex w-full items-center justify-between text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Álbum
            <svg
              className={`h-3 w-3 transition-transform ${albumOpen ? "rotate-180" : ""}`}
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
          {albumOpen && (
            <div className="ml-4 mt-3 flex flex-col gap-3">
              <Link
                href="/album"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <IconBook className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Álbuns de figurinhas</span>
              </Link>
              <Link
                href="/trocas"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                <IconRepeat className="h-4 w-4 shrink-0 text-zinc-400" />
                <span>Trocar Figurinhas</span>
              </Link>
            </div>
          )}
        </div>
        <ActiveLink href="/estadios" onClick={() => setMobileOpen(false)}>
          Estádios
        </ActiveLink>
      </nav>
    </>
  );
}
