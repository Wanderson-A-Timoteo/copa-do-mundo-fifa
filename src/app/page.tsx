import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import HeroCarousel from "@/components/HeroCarousel";
import ActiveLink from "@/components/ActiveLink";
import { FlagIcon } from "@/components/FlagIcon";
import { IconTrophy } from "@/components/Icons";
import PaginaAnimada from "@/components/PaginaAnimada";

export default function Home() {
  return (
    <PaginaAnimada>
      <div className="relative flex min-h-screen flex-col">
      <HeroCarousel />
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <h1 className="inline-flex items-center gap-1.5 text-lg font-bold text-white">
          <IconTrophy className="h-5 w-5" /> Copa 2026
        </h1>
        <nav className="flex items-center gap-4 text-sm text-white">
          <ActiveLink href="/">Início</ActiveLink>
          <ActiveLink href="/selecoes">Seleções</ActiveLink>
          <ActiveLink href="/tabela">Tabela</ActiveLink>
          <ActiveLink href="/album">Álbum</ActiveLink>
          <ActiveLink href="/estadios">Estádios</ActiveLink>
          <ThemeToggle />
          <UserMenu />
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div>
          <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Copa do Mundo FIFA 2026
          </h2>
          <p className="mt-4 inline-flex flex-wrap items-center justify-center gap-x-1.5 text-zinc-300">
            <span className="inline-flex items-center gap-1">Canadá <FlagIcon codigo="ca" className="h-4 w-auto rounded-sm" /></span>
            ·
            <span className="inline-flex items-center gap-1">Estados Unidos <FlagIcon codigo="us" className="h-4 w-auto rounded-sm" /></span>
            ·
            <span className="inline-flex items-center gap-1">México <FlagIcon codigo="mx" className="h-4 w-auto rounded-sm" /></span>
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/selecoes"
              className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-zinc-900"
            >
              Ver Seleções
            </Link>
            <Link
              href="/tabela"
              className="rounded-lg border border-white/40 px-6 py-3 text-sm font-medium text-white"
            >
              Tabela de Jogos
            </Link>
            <Link
              href="/album"
              className="rounded-lg border border-white/40 px-6 py-3 text-sm font-medium text-white"
            >
              Álbum de Figurinhas
            </Link>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center text-white backdrop-blur-sm">
              <div className="text-2xl font-bold">48</div>
              <div className="mt-1 text-sm text-zinc-300">Seleções</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center text-white backdrop-blur-sm">
              <div className="text-2xl font-bold">104</div>
              <div className="mt-1 text-sm text-zinc-300">Partidas</div>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 p-6 text-center text-white backdrop-blur-sm">
              <div className="text-2xl font-bold">16</div>
              <div className="mt-1 text-sm text-zinc-300">Estádios</div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </PaginaAnimada>
  );
}
