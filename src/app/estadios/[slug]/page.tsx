"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import PaginaAnimada from "@/components/PaginaAnimada";
import { FlagIcon } from "@/components/FlagIcon";
import { IconMapPin, IconClock } from "@/components/Icons";

interface PartidaResumida {
  id: number;
  dataHora: string;
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
          <main className="mx-auto max-w-3xl px-6 py-8"><p className="text-zinc-500">Carregando...</p></main>
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
            <Link href="/estadios" className="text-sm text-zinc-500 hover:text-zinc-800">&larr; Voltar</Link>
            <p className="mt-8 text-zinc-500">{error ?? "Estádio não encontrado"}</p>
          </main>
        </div>
      </PaginaAnimada>
    );
  }

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <Link href="/estadios" className="inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            &larr; Voltar
          </Link>

          <h1 className="mt-2 text-3xl font-bold">{estadio.nome}</h1>
          <p className="mt-1 text-zinc-500">
            <IconMapPin className="mr-1 inline h-4 w-4" />
            {estadio.cidade}, {estadio.pais} &middot; {estadio.capacidade.toLocaleString()} lugares
          </p>

          {estadio.fotoUrl && (
            <img
              src={estadio.fotoUrl}
              alt={estadio.nome}
              className="mt-6 h-64 w-full rounded-xl object-cover sm:h-96"
            />
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
            <a
              href={`https://www.google.com/maps?q=${estadio.latitude},${estadio.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-500 underline hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              <IconMapPin className="h-4 w-4" />
              Ver no Google Maps
            </a>
          )}

          {estadio.partidas.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold">Jogos neste estádio</h2>
              <div className="mt-3 space-y-2">
                {estadio.partidas.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 sm:gap-4 sm:p-4"
                  >
                    <div className="flex flex-1 items-center justify-end gap-2">
                      <span className="truncate text-right font-medium">{p.mandante.nome}</span>
                      <FlagIcon codigo={p.mandante.codigoPais} className="h-5 w-auto rounded-sm" />
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-base font-bold sm:text-lg">
                        {p.golsMandante !== null ? p.golsMandante : "-"} x {p.golsVisitante !== null ? p.golsVisitante : "-"}
                      </span>
                      <span className="text-xs text-zinc-400">
                        <IconClock className="mr-0.5 inline h-3 w-3" />
                        {new Date(p.dataHora).toLocaleDateString("pt-BR", { timeZone: "UTC", day: "2-digit", month: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex flex-1 items-center gap-2">
                      <FlagIcon codigo={p.visitante.codigoPais} className="h-5 w-auto rounded-sm" />
                      <span className="truncate font-medium">{p.visitante.nome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </PaginaAnimada>
  );
}
