"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { SkeletonMataMata } from "@/components/Skeleton";
import { formatarData } from "@/lib/format";
import { computeBracket, type GrupoStanding, type BracketResult } from "@/lib/compute-bracket";
import { formatoCopa } from "@/data/formato-copa";
import { GrupoPartidaDia, type GrupoPartida } from "@/components/admin/GrupoPartidaEditor";
import MataMataPartidaEditor from "@/components/admin/MataMataPartidaEditor";

export default function PublicOficialPage() {
  const [partidas, setPartidas] = useState<GrupoPartida[]>([]);
  const [resultadoMataMata, setResultadoMataMata] = useState<BracketResult | null>(null);
  const [loadingKnockout, setLoadingKnockout] = useState(true);

  useEffect(() => {
    fetch("/api/partidas?fase=GRUPOS")
      .then((r) => r.json())
      .then((d) => {
        setPartidas(d.partidas ?? []);
      });
  }, []);

  const recalcularMataMata = useCallback(() => {
    setLoadingKnockout(true);
    Promise.all([fetch("/api/grupos"), fetch("/api/resultados-oficiais")])
      .then(([rGrupos, rResultados]) => Promise.all([rGrupos.json(), rResultados.json()]))
      .then(([dataGrupos, dataResultados]) => {
        const grupos: GrupoStanding[] = dataGrupos.grupos ?? [];
        const palpites = (dataResultados.resultados ?? []).map(
          (p: {
            partidaId: number;
            golsMandante: number | null;
            golsVisitante: number | null;
            penaltisMandante: number | null;
            penaltisVisitante: number | null;
          }) => ({
            partidaId: p.partidaId,
            golsMandante: p.golsMandante,
            golsVisitante: p.golsVisitante,
            penaltisMandante: p.penaltisMandante,
            penaltisVisitante: p.penaltisVisitante,
          }),
        );
        const r = computeBracket(formatoCopa, grupos, palpites);
        setResultadoMataMata(r);
      })
      .finally(() => setLoadingKnockout(false));
  }, []);

  useEffect(() => {
    recalcularMataMata();
  }, [recalcularMataMata]);

  const fasesVisiveis = useMemo(() => {
    if (!resultadoMataMata) return [];
    return resultadoMataMata.fases.filter((f) => f.partidas.some((p) => p.mandante || p.visitante));
  }, [resultadoMataMata]);

  const partidasPorDia = partidas.reduce<Record<string, GrupoPartida[]>>((acc, p, index) => {
    const chave = formatarData(p.dataHora);
    if (!acc[chave]) acc[chave] = [];
    p.numero = index + 1;
    acc[chave].push(p);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">
        Resultados Oficiais
      </h1>
      <p className="mt-1 text-zinc-500">Acompanhe os resultados reais da competição</p>

      {fasesVisiveis.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-1.5 rounded-2xl bg-zinc-200/50 p-1.5 dark:bg-zinc-800/50 w-fit">
          {fasesVisiveis.map((fase) => (
            <button
              key={fase.key}
              onClick={() => {
                document.getElementById(`fase-${fase.key}`)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-300 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/50"
            >
              {fase.label}
            </button>
          ))}
        </div>
      )}

      <section className="relative">
        <div className="sticky top-[60px] md:top-[64px] z-30 mb-6 py-4 bg-zinc-50/95 backdrop-blur-md dark:bg-zinc-950/95">
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Fases de Grupos
          </h2>
        </div>
        <div className="mt-6 space-y-8">
          {Object.entries(partidasPorDia).map(([data, jogos]) => (
            <GrupoPartidaDia
              key={data}
              jogos={jogos}
              placares={{}}
              onChangePlacar={() => {}}
              isAdmin={false}
              salvando={new Set()}
              onSalvar={() => {}}
            />
          ))}
        </div>
      </section>

      {/* Mata‑mata */}
      {loadingKnockout ? (
        <div className="mt-12">
          <SkeletonMataMata />
        </div>
      ) : resultadoMataMata ? (
        <section className="mt-12 space-y-10 relative">
          <div className="sticky top-[60px] md:top-[64px] z-30 mb-6 py-4 bg-zinc-50/95 backdrop-blur-md dark:bg-zinc-950/95">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Fase Eliminatória
            </h2>
          </div>
          {resultadoMataMata.fases.map((fase) => {
            const todasNulas = fase.partidas.every((p) => !p.mandante && !p.visitante);
            if (todasNulas) return null;
            return (
              <section key={fase.key} id={`fase-${fase.key}`} className="relative mb-8">
                <div className="sticky top-[125px] md:top-[132px] z-20 mb-6 py-2 bg-zinc-50/95 backdrop-blur-md dark:bg-zinc-950/95">
                  <h3 className="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400 capitalize">
                    {fase.label}
                  </h3>
                </div>
                <div className="space-y-4 border-l-2 border-zinc-200 pl-4 dark:border-zinc-800 ml-2 md:ml-4">
                  {fase.partidas.map((p) => {
                    if (!p.mandante && !p.visitante) return null;
                    return (
                      <div key={p.numero} className="relative">
                        <div className="absolute -left-[21px] top-1/2 -mt-1.5 h-3 w-3 rounded-full border-2 border-zinc-50 bg-zinc-300 dark:border-zinc-900 dark:bg-zinc-600" />
                        <MataMataPartidaEditor
                          partida={p}
                          placar={{
                            golsMandante: "",
                            golsVisitante: "",
                            penaltisMandante: "",
                            penaltisVisitante: "",
                          }}
                          onChangePlacar={() => {}}
                          isAdmin={false}
                          salvando={false}
                          onSalvar={() => {}}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>
      ) : null}
    </main>
  );
}
