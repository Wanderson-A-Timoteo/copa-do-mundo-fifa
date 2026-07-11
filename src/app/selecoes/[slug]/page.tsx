"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import PaginaAnimada from "@/components/PaginaAnimada";
import { SkeletonSelecaoDetalhe } from "@/components/Skeleton";
import PlayerCard from "@/components/PlayerCard";

interface Jogador {
  id: number;
  nome: string;
  numeroCamisa: number | null;
  posicao: string;
  fotoUrl: string | null;
  dataNascimento: string | null;
  altura: number | null;
  peso: number | null;
  figurinha: { raridade: string } | null;
}

interface Partida {
  id: number;
  fase: string;
  dataHora: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  encerrada: boolean;
  mandante: { id: number; nome: string };
  visitante: { id: number; nome: string };
  estadio: { nome: string };
}

interface Selecao {
  id: number;
  nome: string;
  codigoPais: string | null;
  grupoId: string;
  continente: string;
  rankingFifa: number | null;
  titulos: number;
  tecnico: string | null;
  corPrimaria: string | null;
  grupo: { id: string; nome: string };
  jogadores: Jogador[];
  partidasCasa: Partida[];
  partidasFora: Partida[];
}

export default function DetalheSelecaoPage() {
  const params = useParams();
  const [selecao, setSelecao] = useState<Selecao | null>(null);

  useEffect(() => {
    fetch(`/api/selecoes/${params.slug}`)
      .then((r) => r.json())
      .then((d) => setSelecao(d.selecao));
  }, [params.slug]);

  if (!selecao) {
    return (
      <PaginaAnimada>
        <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto max-w-5xl px-6 py-8">
          <SkeletonSelecaoDetalhe />
        </main>
      </div>
      </PaginaAnimada>
    );
  }

  const posicoes = ["Goleiro", "Defensor", "Meia", "Atacante"];

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link href="/selecoes" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Voltar
        </Link>
        <div className="flex items-center gap-6">
          <FlagIcon codigo={selecao.codigoPais} className="h-20 w-auto rounded-sm" />
          <div>
            <h1 className="text-3xl font-bold">{selecao.nome}</h1>
            <p className="text-zinc-500">
              {selecao.grupo.nome} · {selecao.continente}
              {selecao.titulos > 0 && ` · ${selecao.titulos} títulos mundiais`}
              {selecao.rankingFifa && ` · Ranking FIFA: ${selecao.rankingFifa}º`}
            </p>
            {selecao.tecnico && (
              <p className="text-sm text-zinc-400">Técnico: {selecao.tecnico}</p>
            )}
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Elenco</h2>
          <div className="mt-4 space-y-6">
            {posicoes.map((pos) => {
              const jogadores = selecao.jogadores.filter((j) => j.posicao === pos);
              if (jogadores.length === 0) return null;
              return (
                <div key={pos}>
                  <h3 className="mb-3 text-sm font-medium text-zinc-500">{pos}s</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {jogadores.map((j) => (
                      <PlayerCard key={j.id} jogador={j} corPrimaria={selecao.corPrimaria} codigoPais={selecao.codigoPais} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Jogos</h2>
          <div className="mt-4 space-y-3">
            {[...selecao.partidasCasa, ...selecao.partidasFora]
              .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/tabela`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                      {p.fase === "GRUPOS" ? "F. Grupos" : p.fase}
                    </span>
                    <span className="text-zinc-500">
                      {p.mandante.nome} vs {p.visitante.nome}
                    </span>
                  </div>
                  <div className="text-sm">
                    {p.encerrada ? (
                      <span className="font-bold">
                        {p.golsMandante} x {p.golsVisitante}
                      </span>
                    ) : (
                      <span className="text-zinc-400">
                        {new Date(p.dataHora).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>
    </div>
    </PaginaAnimada>
  );
}
