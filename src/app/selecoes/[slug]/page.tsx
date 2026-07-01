"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import { IconStar } from "@/components/Icons";
import PaginaAnimada from "@/components/PaginaAnimada";

interface Jogador {
  id: number;
  nome: string;
  numeroCamisa: number | null;
  posicao: string;
  fotoUrl: string | null;
  dataNascimento: string | null;
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
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-zinc-500">Carregando...</p>
        </div>
      </div>
      </PaginaAnimada>
    );
  }

  const posicoes = ["Goleiro", "Defensor", "Meia", "Atacante"];

  function calcIdade(dataNasc: string): number {
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  }

  function PlayerCard({ jogador, corPrimaria, codigoPais }: { jogador: Jogador; corPrimaria: string | null; codigoPais: string | null }) {
    const iniciais = jogador.nome
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const idade = jogador.dataNascimento ? calcIdade(jogador.dataNascimento) : null;

    return (
      <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-stone-50 px-5 pb-5 pt-6 shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative mb-3">
          {jogador.fotoUrl ? (
            <img
              src={jogador.fotoUrl}
              alt={jogador.nome}
              className="h-28 w-20 rounded-lg object-cover transition-transform duration-200 hover:scale-105 sm:h-32 sm:w-24"
            />
          ) : (
            <div
              className="flex h-28 w-20 items-center justify-center rounded-lg text-sm font-bold text-white transition-transform duration-200 hover:scale-105 sm:h-32 sm:w-24 sm:text-base"
              style={{ backgroundColor: corPrimaria || "#52525b" }}
            >
              {iniciais}
            </div>
          )}
          {codigoPais && (
            <div className="absolute -right-1 -top-1 overflow-hidden rounded-sm shadow-md">
              <FlagIcon codigo={codigoPais} className="h-4 w-auto sm:h-5" />
            </div>
          )}
        </div>

        <span className="text-xs font-bold text-zinc-400">#{jogador.numeroCamisa ?? "—"}</span>
        <span className="mt-0.5 text-center text-sm font-semibold leading-tight">{jogador.nome}</span>
        <span className="mt-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {jogador.posicao}
        </span>
        {jogador.figurinha?.raridade === "rara" && (
          <span className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
            <IconStar className="h-3 w-3" /> RARA
          </span>
        )}
        {idade && (
          <span className="mt-1 text-[10px] text-zinc-400">
            {idade} anos
          </span>
        )}
      </div>
    );
  }

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
