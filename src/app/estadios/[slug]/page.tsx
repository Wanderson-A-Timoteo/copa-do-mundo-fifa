"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import NavHeader from "@/components/NavHeader";
import PaginaAnimada from "@/components/PaginaAnimada";
import { FlagIcon } from "@/components/FlagIcon";
import { IconMapPin, IconClock, IconStar } from "@/components/Icons";

interface PartidaResumida {
  id: number;
  dataHora: string;
  fase: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  mandante: { id: number; nome: string; codigoPais: string | null };
  visitante: { id: number; nome: string; codigoPais: string | null };
}

interface EstadioDetalhado {
  id: number;
  slug: string;
  nome: string;
  cidade: string;
  pais: string;
  capacidade: number;
  fotoUrl: string | null;
  descricao: string | null;
  historia: string | null;
  latitude: number | null;
  longitude: number | null;
  partidas: PartidaResumida[];
}

function formatarFase(fase: string): string {
  if (fase === "GRUPOS" || fase.startsWith("Grupo")) return "Fase de Grupos";
  return fase;
}

function capacidadeBadge(capacidade: number): { label: string; cor: string } | null {
  if (capacidade >= 87000) return { label: "Maior estádio do torneio", cor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" };
  if (capacidade >= 80000) return { label: "Top 3 maior", cor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" };
  if (capacidade >= 70000) return { label: "Capacidade gigante", cor: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200" };
  return null;
}

function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-64 w-full rounded-xl bg-zinc-200 dark:bg-zinc-800 sm:h-96" />
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export default function EstadioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [estadio, setEstadio] = useState<EstadioDetalhado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/estadios/${slug}`)
      .then((r) => r.ok ? r.json() : Promise.reject("Not found"))
      .then((d) => setEstadio(d.estadio))
      .catch(() => setError("Estádio não encontrado"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <PaginaAnimada>
        <div className="min-h-screen">
          <NavHeader />
          <main className="mx-auto max-w-3xl px-6 py-8">
            <SkeletonCard />
          </main>
        </div>
      </PaginaAnimada>
    );
  }

  if (error || !estadio) {
    return (
      <PaginaAnimada>
        <div className="min-h-screen">
          <NavHeader />
          <main className="mx-auto max-w-3xl px-6 py-8">
            <nav className="mb-6 text-sm text-zinc-400">
              <Link href="/estadios" className="hover:text-zinc-800 dark:hover:text-zinc-200">Estádios</Link>
              <span className="mx-2">&rsaquo;</span>
              <span className="text-zinc-500">Não encontrado</span>
            </nav>
            <p className="mt-8 text-zinc-500">{error ?? "Estádio não encontrado"}</p>
            <Link href="/estadios" className="mt-4 inline-block text-sm text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200">
              &larr; Voltar para estádios
            </Link>
          </main>
        </div>
      </PaginaAnimada>
    );
  }

  const agora = new Date();
  const partidasFuturas = estadio.partidas.filter((p) => new Date(p.dataHora) > agora);
  const partidasPassadas = estadio.partidas.filter((p) => new Date(p.dataHora) <= agora);
  const badge = capacidadeBadge(estadio.capacidade);

  function PartidaCard({ p }: { p: PartidaResumida }) {
    const ehFutura = new Date(p.dataHora) > agora;
    return (
      <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:gap-4 sm:p-4">
        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="truncate text-right font-medium">{p.mandante.nome}</span>
          <FlagIcon codigo={p.mandante.codigoPais} className="h-5 w-auto rounded-sm" />
        </div>

        <div className="flex flex-col items-center">
          <span className="text-base font-bold sm:text-lg">
            {ehFutura ? "- x -" : `${p.golsMandante ?? "-"} x ${p.golsVisitante ?? "-"}`}
          </span>
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <IconClock className="h-3 w-3" />
            {new Date(p.dataHora).toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" })}
          </div>
          <span className="mt-0.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {formatarFase(p.fase)}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-2">
          <FlagIcon codigo={p.visitante.codigoPais} className="h-5 w-auto rounded-sm" />
          <span className="truncate font-medium">{p.visitante.nome}</span>
        </div>
      </div>
    );
  }

  function ListaPartidas({ titulo, partidas, vazia }: { titulo: string; partidas: PartidaResumida[]; vazia: string }) {
    if (partidas.length === 0) return null;
    return (
      <section className="mt-10">
        <h2 className="text-lg font-bold">{titulo}</h2>
        <div className="mt-3 space-y-2">
          {partidas.map((p) => <PartidaCard key={p.id} p={p} />)}
        </div>
      </section>
    );
  }

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <nav className="mb-4 text-sm text-zinc-400">
            <Link href="/estadios" className="hover:text-zinc-800 dark:hover:text-zinc-200">Estádios</Link>
            <span className="mx-2">&rsaquo;</span>
            <span className="text-zinc-500">{estadio.nome}</span>
          </nav>

          <div className="flex flex-wrap items-start gap-3">
            <h1 className="text-3xl font-bold">{estadio.nome}</h1>
            {badge && (
              <span className={`mt-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.cor}`}>
                <IconStar className="mr-0.5 inline h-3 w-3" />
                {badge.label}
              </span>
            )}
          </div>

          <p className="mt-1 flex items-center gap-1 text-zinc-500">
            <IconMapPin className="h-4 w-4" />
            {estadio.cidade}, {estadio.pais} &middot; {estadio.capacidade.toLocaleString()} lugares
          </p>

          {estadio.fotoUrl && (
            <div className="relative mt-6 h-64 w-full sm:h-96">
              <Image
                src={estadio.fotoUrl}
                alt={estadio.nome}
                fill
                className="rounded-xl object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          {estadio.descricao && (
            <section className="mt-8">
              <h2 className="text-lg font-bold">Sobre o estádio</h2>
              <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{estadio.descricao}</p>
            </section>
          )}

          {estadio.historia && (
            <section className="mt-6">
              <h2 className="text-lg font-bold">História</h2>
              <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">{estadio.historia}</p>
            </section>
          )}

          {estadio.latitude && estadio.longitude && (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-bold">Localização</h2>
              <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                <iframe
                  title={`Mapa do ${estadio.nome}`}
                  width="100%"
                  height="300"
                  frameBorder="0"
                  scrolling="no"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${estadio.longitude - 0.02}%2C${estadio.latitude - 0.02}%2C${estadio.longitude + 0.02}%2C${estadio.latitude + 0.02}&layer=mapnik&marker=${estadio.latitude}%2C${estadio.longitude}`}
                />
              </div>
              <a
                href={`https://www.google.com/maps?q=${estadio.latitude},${estadio.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <IconMapPin className="h-4 w-4" />
                Abrir no Google Maps
              </a>
            </div>
          )}

          {estadio.partidas.length === 0 ? (
            <section className="mt-10">
              <h2 className="text-lg font-bold">Jogos neste estádio</h2>
              <p className="mt-3 text-sm text-zinc-400">Nenhuma partida programada neste estádio.</p>
            </section>
          ) : (
            <>
              <ListaPartidas titulo="Próximas Partidas" partidas={partidasFuturas} vazia="Nenhuma partida futura." />
              <ListaPartidas titulo="Partidas Realizadas" partidas={partidasPassadas} vazia="Nenhuma partida realizada." />
            </>
          )}
        </main>
      </div>
    </PaginaAnimada>
  );
}
