"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import ActiveLink from "./ActiveLink";
import { IconTrophy } from "./Icons";

export default function NavHeader() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <Link href="/" className="inline-flex items-center gap-1.5 text-lg font-bold">
        <IconTrophy className="h-5 w-5" /> Copa 2026
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <ActiveLink href="/">Início</ActiveLink>
        <ActiveLink href="/selecoes">Seleções</ActiveLink>
        <ActiveLink href="/tabela">Tabela</ActiveLink>
        <ActiveLink href="/album">Álbum</ActiveLink>
        <ActiveLink href="/estadios">Estádios</ActiveLink>
        <ThemeToggle />
        <UserMenu />
      </nav>
    </header>
  );
}
