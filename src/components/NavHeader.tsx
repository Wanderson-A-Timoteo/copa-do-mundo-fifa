"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import ActiveLink from "./ActiveLink";
import { IconTrophy } from "./Icons";

export default function NavHeader({ transparent }: { transparent?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <ActiveLink href="/tabela">Tabela</ActiveLink>
          <ActiveLink href="/album">Álbum</ActiveLink>
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
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
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
        <ActiveLink href="/" onClick={() => setMobileOpen(false)}>Início</ActiveLink>
        <ActiveLink href="/selecoes" onClick={() => setMobileOpen(false)}>Seleções</ActiveLink>
        <ActiveLink href="/tabela" onClick={() => setMobileOpen(false)}>Tabela</ActiveLink>
        <ActiveLink href="/album" onClick={() => setMobileOpen(false)}>Álbum</ActiveLink>
        <ActiveLink href="/estadios" onClick={() => setMobileOpen(false)}>Estádios</ActiveLink>
      </nav>
    </>
  );
}
