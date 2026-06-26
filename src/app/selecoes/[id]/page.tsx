"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import NavHeader from "@/components/NavHeader";

interface Jogador {
  id: number;
  nome: string;
  numeroCamisa: number | null;
  posicao: string;
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
  grupoId: string;
  continente: string;
  rankingFifa: number | null;
  corPrimaria: string | null;
  titulos: number;
  tecnico: string | null;
  grupo: { id: string; nome: string };
  jogadores: Jogador[];
  partidasCasa: Partida[];
  partidasFora: Partida[];
}

export default function DetalheSelecaoPage() {
  const params = useParams();
  const [selecao, setSelecao] = useState<Selecao | null>(null);

  useEffect(() => {
    fetch(`/api/selecoes/${params.id}`)
      .then((r) => r.json())
      .then((d) => setSelecao(d.selecao));
  }, [params.id]);

  if (!selecao) {
    return (
      <div className="min-h-screen">
        <NavHeader />
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-zinc-500">Carregando...</p>
        </div>
      </div>
    );
  }

  const posicoes = ["Goleiro", "Defensor", "Meia", "Atacante"];

  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center gap-6">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full text-4xl font-bold text-white"
            style={{ backgroundColor: selecao.corPrimaria || "#666" }}
          >
            {selecao.nome.charAt(0)}
          </div>
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
          <div className="mt-4 space-y-4">
            {posicoes.map((pos) => {
              const jogadores = selecao.jogadores.filter((j) => j.posicao === pos);
              if (jogadores.length === 0) return null;
              return (
                <div key={pos}>
                  <h3 className="mb-2 text-sm font-medium text-zinc-500">{pos}s</h3>
                  <div className="flex flex-wrap gap-2">
                    {jogadores.map((j) => (
                      <div
                        key={j.id}
                        className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
                      >
                        {j.numeroCamisa && (
                          <span className="mr-1.5 font-bold text-zinc-400">
                            {j.numeroCamisa}
                          </span>
                        )}
                        {j.nome}
                      </div>
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
  );
}
