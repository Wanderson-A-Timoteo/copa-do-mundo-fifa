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
      <h1 className="mt-2 text-3xl font-bold">Resultados Oficiais</h1>
      <p className="mt-1 text-zinc-500">Acompanhe os resultados reais da competição</p>

      {fasesVisiveis.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {fasesVisiveis.map((fase) => (
            <button
              key={fase.key}
              onClick={() => {
                document.getElementById(`fase-${fase.key}`)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              {fase.label}
            </button>
          ))}
        </div>
      )}

      <h2 className="mt-10 text-2xl font-bold">Fases de Grupos</h2>
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

      {/* Mata‑mata */}
      {loadingKnockout ? (
        <div className="mt-12">
          <SkeletonMataMata />
        </div>
      ) : resultadoMataMata ? (
        <div className="mt-12 space-y-10">
          <h2 className="text-2xl font-bold">Fase Eliminatória</h2>
          {resultadoMataMata.fases.map((fase) => {
            const todasNulas = fase.partidas.every((p) => !p.mandante && !p.visitante);
            if (todasNulas) return null;
            return (
              <section key={fase.key} id={`fase-${fase.key}`}>
                <h3 className="mb-4 text-lg font-bold">{fase.label}</h3>
                <div className="space-y-3">
                  {fase.partidas.map((p) => {
                    if (!p.mandante && !p.visitante) return null;
                    return (
                      <MataMataPartidaEditor
                        key={p.numero}
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
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
