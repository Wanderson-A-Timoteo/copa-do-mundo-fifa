"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function NavHeader() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
      <Link href="/" className="text-lg font-bold">
        Copa 2026
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/selecoes" className="hover:underline">Seleções</Link>
        <Link href="/tabela" className="hover:underline">Tabela</Link>
        <Link href="/album" className="hover:underline">Álbum</Link>
        <Link href="/estadios" className="hover:underline">Estádios</Link>
        <ThemeToggle />
        <Link
          href="/login"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Entrar
        </Link>
      </nav>
    </header>
  );
}
