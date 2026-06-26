import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-lg font-bold">Copa 2026</h1>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/selecoes" className="hover:underline">Seleções</Link>
          <Link href="/tabela" className="hover:underline">Tabela</Link>
          <Link href="/album" className="hover:underline">Álbum</Link>
          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Entrar
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Copa do Mundo FIFA 2026
        </h2>
        <p className="mt-4 max-w-lg text-zinc-500">
          Canadá · Estados Unidos · México
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/selecoes"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Ver Seleções
          </Link>
          <Link
            href="/tabela"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium dark:border-zinc-700"
          >
            Tabela de Jogos
          </Link>
          <Link
            href="/album"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium dark:border-zinc-700"
          >
            Álbum de Figurinhas
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-6 text-left dark:border-zinc-800">
            <div className="text-2xl">48</div>
            <div className="mt-1 text-sm text-zinc-500">Seleções</div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 text-left dark:border-zinc-800">
            <div className="text-2xl">104</div>
            <div className="mt-1 text-sm text-zinc-500">Partidas</div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6 text-left dark:border-zinc-800">
            <div className="text-2xl">16</div>
            <div className="mt-1 text-sm text-zinc-500">Estádios</div>
          </div>
        </div>
      </main>
    </div>
  );
}
