"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import PaginaAnimada from "@/components/PaginaAnimada";
import { computeBracket, type GrupoStanding, type BracketResult, type PartidaResolvida } from "@/lib/compute-bracket";
import { formatoCopa } from "@/data/formato-copa";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function getUserId(): number | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw).id ?? null;
  } catch {
    return null;
  }
}

type PlacaresState = Record<number, { golsMandante: string; golsVisitante: string }>;

export default function TabelaMataMataPage() {
  const [resultado, setResultado] = useState<BracketResult | null>(null);
  const [placares, setPlacares] = useState<PlacaresState>({});
  const [salvando, setSalvando] = useState<Set<number>>(new Set());
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const carregar = useCallback(async () => {
    const usuarioId = getUserId();
    if (!usuarioId) return;

    const [resGrupos, resPalpites] = await Promise.all([
      fetch(`/api/grupos?usuarioId=${usuarioId}`, { headers: getAuthHeaders() }),
      fetch("/api/palpites/mata-mata", { headers: getAuthHeaders() }),
    ]);

    const dataGrupos = await resGrupos.json();
    const dataPalpites = await resPalpites.json();

    const grupos: GrupoStanding[] = dataGrupos.grupos;
    const palpites = dataPalpites.palpites.map((p: { partidaId: number; golsMandante: number | null; golsVisitante: number | null }) => ({
      partidaId: p.partidaId,
      golsMandante: p.golsMandante,
      golsVisitante: p.golsVisitante,
    }));

    const r = computeBracket(formatoCopa, grupos, palpites);
    setResultado(r);

    const ps: PlacaresState = {};
    for (const fase of r.fases) {
      for (const p of fase.partidas) {
        if (p.golsMandante !== null && p.golsVisitante !== null) {
          ps[p.numero] = { golsMandante: String(p.golsMandante), golsVisitante: String(p.golsVisitante) };
        }
      }
    }
    setPlacares(ps);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const salvarPalpite = async (partidaId: number, golsMandante: number | null, golsVisitante: number | null) => {
    setSalvando((prev) => new Set(prev).add(partidaId));
    try {
      await fetch("/api/palpites/mata-mata", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ partidaId, golsMandante, golsVisitante }),
      });
      await carregar();
    } finally {
      setSalvando((prev) => {
        const next = new Set(prev);
        next.delete(partidaId);
        return next;
      });
    }
  };

  const handleChange = (partidaId: number, campo: "golsMandante" | "golsVisitante", value: string) => {
    setPlacares((prev) => ({
      ...prev,
      [partidaId]: { ...prev[partidaId], [campo]: value },
    }));

    if (timers.current[partidaId]) clearTimeout(timers.current[partidaId]);
    timers.current[partidaId] = setTimeout(() => {
      const placar = { ...placares[partidaId], [campo]: value };
      const gM = placar.golsMandante === "" ? null : Number(placar.golsMandante);
      const gV = placar.golsVisitante === "" ? null : Number(placar.golsVisitante);
      if (gM === null && gV === null) {
        salvarPalpite(partidaId, null, null);
      } else if (gM !== null && gV !== null && !isNaN(gM) && !isNaN(gV)) {
        salvarPalpite(partidaId, gM, gV);
      }
    }, 800);
  };

  const getPlacar = (p: PartidaResolvida) => placares[p.numero] || { golsMandante: "", golsVisitante: "" };

  const fasesBracket = resultado?.fases ?? [];

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 flex items-center gap-4">
            <h1 className="text-3xl font-bold">Mata-Mata</h1>
            <span className="text-sm text-zinc-500">Chaveamento eliminatório</span>
          </div>

          {resultado && resultado.classificadosTerceiros.length > 0 && (
            <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-2 text-sm font-semibold">8 melhores 3º colocados</h3>
              <div className="flex flex-wrap gap-2">
                {resultado.classificadosTerceiros.map((s, i) => (
                  <span key={s.id} className="flex items-center gap-1 rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800">
                    <FlagIcon codigo={s.codigoPais} className="h-3 w-auto rounded-sm" />
                    {s.nome}
                    <span className="text-zinc-500">({s.p}pts)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto pb-8">
            <div className="flex gap-6" style={{ minWidth: 1200 }}>
              {fasesBracket.map((fase, fi) => {
                const cols = fase.partidas.length;
                const alturaBase = cols * 80;

                return (
                  <div key={fase.key} className="flex-shrink-0" style={{ width: 210 }}>
                    <h2 className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-zinc-500">
                      {fase.label}
                    </h2>
                    <div className="flex flex-col justify-around" style={{ height: alturaBase }}>
                      {fase.partidas.map((p, i) => {
                        const placar = getPlacar(p);
                        const salvandoAgora = salvando.has(p.numero);
                        const podeEditar = !!p.mandante && !!p.visitante;

                        return (
                          <div
                            key={p.numero}
                            className="rounded-lg border border-zinc-200 p-2.5 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                          >
                            {p.mandante && p.visitante ? (
                              <>
                                <div className="flex items-center justify-between gap-1 text-sm">
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <FlagIcon codigo={p.mandante.codigoPais} className="h-4 w-auto shrink-0 rounded-sm" />
                                    <span className={`truncate ${p.vencedor?.id === p.mandante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}>
                                      {p.mandante.nome}
                                    </span>
                                  </div>
                                  {podeEditar ? (
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={2}
                                      value={placar.golsMandante}
                                      onChange={(e) => handleChange(p.numero, "golsMandante", e.target.value)}
                                      className={`w-8 rounded border px-1 py-0.5 text-center text-sm ${
                                        salvandoAgora ? "opacity-50" : ""
                                      } dark:border-zinc-700 dark:bg-zinc-800`}
                                    />
                                  ) : (
                                    <span className="w-8 text-center text-sm font-bold">{p.golsMandante ?? ""}</span>
                                  )}
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-1 text-sm">
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <FlagIcon codigo={p.visitante.codigoPais} className="h-4 w-auto shrink-0 rounded-sm" />
                                    <span className={`truncate ${p.vencedor?.id === p.visitante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}>
                                      {p.visitante.nome}
                                    </span>
                                  </div>
                                  {podeEditar ? (
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={2}
                                      value={placar.golsVisitante}
                                      onChange={(e) => handleChange(p.numero, "golsVisitante", e.target.value)}
                                      className={`w-8 rounded border px-1 py-0.5 text-center text-sm ${
                                        salvandoAgora ? "opacity-50" : ""
                                      } dark:border-zinc-700 dark:bg-zinc-800`}
                                    />
                                  ) : (
                                    <span className="w-8 text-center text-sm font-bold">{p.golsVisitante ?? ""}</span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <div className="py-2 text-center text-xs text-zinc-400">
                                A definir
                              </div>
                            )}
                            <p className="mt-1 text-[10px] text-zinc-400">
                              {new Date(p.dataHora).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


        </main>
      </div>
    </PaginaAnimada>
  );
}
