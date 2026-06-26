"use client";

import { useEffect, useState } from "react";
import NavHeader from "@/components/NavHeader";

interface SelecaoResumo {
  id: number;
  nome: string;
  corPrimaria: string | null;
}

interface PartidaComInfo {
  id: number;
  fase: string;
  dataHora: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  encerrada: boolean;
  mandante: SelecaoResumo;
  visitante: SelecaoResumo;
}

interface BracketPartida extends PartidaComInfo {
  linha: number;
  filhos?: [number, number];
}

export default function TabelaMataMataPage() {
  const [partidas, setPartidas] = useState<PartidaComInfo[]>([]);

  useEffect(() => {
    fetch("/api/partidas")
      .then((r) => r.json())
      .then((d) => {
        const filtrar = d.partidas.filter(
          (p: PartidaComInfo) => p.fase !== "GRUPOS"
        );
        setPartidas(filtrar);
      });
  }, []);

  const fases = [
    { key: "OITAVAS", label: "Oitavas de Final", cols: 16 },
    { key: "OITAVAS_16", label: "Oitavas-16", cols: 8 },
    { key: "QUARTAS", label: "Quartas de Final", cols: 4 },
    { key: "SEMI", label: "Semifinais", cols: 2 },
    { key: "TERCEIRO", label: "Terceiro Lugar", cols: 1 },
    { key: "FINAL", label: "Final", cols: 1 },
  ];

  const getFasePartidas = (fase: string) =>
    partidas.filter((p) => p.fase === fase);

  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-3xl font-bold">Mata-Mata</h1>
          <span className="text-sm text-zinc-500">
            Chaveamento eliminatório
          </span>
        </div>

        <div className="overflow-x-auto pb-8">
          <div className="flex gap-8" style={{ minWidth: 1200 }}>
            {fases.map((fase, fi) => {
              const fasePartidas = getFasePartidas(fase.key);
              const altura = Math.max(200, fase.cols * 100);

              return (
                <div key={fase.key} className="flex-shrink-0" style={{ width: 200 }}>
                  <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-wide text-zinc-500">
                    {fase.label}
                  </h2>
                  <div
                    className="flex flex-col justify-around gap-3"
                    style={{ height: altura }}
                  >
                    {Array.from({ length: fase.cols }).map((_, i) => {
                      const partida = fasePartidas[i];
                      const espacamento = Math.max(1, Math.floor(fase.cols / 2));

                      return (
                        <div
                          key={i}
                          className="rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                          style={{
                            marginTop: i > 0 ? `${espacamento * 12}px` : undefined,
                          }}
                        >
                          {partida ? (
                            <>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                      backgroundColor:
                                        partida.mandante.corPrimaria || "#666",
                                    }}
                                  />
                                  <span className="truncate max-w-[100px]">
                                    {partida.mandante.nome}
                                  </span>
                                </div>
                                <span className="font-bold">
                                  {partida.encerrada
                                    ? partida.golsMandante
                                    : "-"}
                                </span>
                              </div>
                              <div className="mt-1.5 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                      backgroundColor:
                                        partida.visitante.corPrimaria || "#666",
                                    }}
                                  />
                                  <span className="truncate max-w-[100px]">
                                    {partida.visitante.nome}
                                  </span>
                                </div>
                                <span className="font-bold">
                                  {partida.encerrada
                                    ? partida.golsVisitante
                                    : "-"}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] text-zinc-400">
                                {new Date(partida.dataHora).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                            </>
                          ) : (
                            <div className="py-2 text-center text-xs text-zinc-400">
                              A definir
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Partidas da Fase de Grupos</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partidas
              .filter((p) => p.fase === "GRUPOS" || !p.fase)
              .map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>{p.mandante.nome}</span>
                    <span className="font-bold">
                      {p.encerrada
                        ? `${p.golsMandante} x ${p.golsVisitante}`
                        : "vs"}
                    </span>
                    <span>{p.visitante.nome}</span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
