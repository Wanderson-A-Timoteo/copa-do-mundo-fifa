"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import PaginaAnimada from "@/components/PaginaAnimada";
import { computeBracket, type GrupoStanding, type BracketResult, type PartidaResolvida } from "@/lib/compute-bracket";
import { formatoCopa } from "@/data/formato-copa";
import type { PartidaBracket } from "@/lib/bracket-format";

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

const CARD_W = 200;
const CARD_H = 74;
const COL_GAP = 40;
const PITCH = CARD_W + COL_GAP;
const ROW_UNIT = 36;

interface Connector {
  from: { col: number; row: number };
  to: { col: number; row: number };
}

interface LayoutNode {
  numero: number;
  col: number;
  row: number;
}

function buildTree(): { nodes: Map<number, LayoutNode>; connectors: Connector[] } {
  const fases = formatoCopa.fases;
  const matchMap = new Map<number, PartidaBracket>();
  const matchToCol = new Map<number, number>();
  const fedBy = new Map<number, number[]>();

  let colIdx = 0;
  for (const fase of fases) {
    for (const p of fase.partidas) {
      matchMap.set(p.numero, p);
      matchToCol.set(p.numero, colIdx);
    }
    colIdx++;
  }

  for (const fase of fases) {
    for (const p of fase.partidas) {
      const kids: number[] = [];
      if (p.mandante.tipo === "vencedor") {
        kids.push(p.mandante.partidaAnterior);
      }
      if (p.visitante.tipo === "vencedor") {
        kids.push(p.visitante.partidaAnterior);
      }
      if (kids.length) fedBy.set(p.numero, kids);
    }
  }

  const col0Ordered: number[] = [];
  const col1 = [...matchMap.values()]
    .filter((p) => matchToCol.get(p.numero) === 1)
    .sort((a, b) => a.numero - b.numero);

  for (const c1 of col1) {
    const kids = fedBy.get(c1.numero);
    if (kids) col0Ordered.push(...kids.filter((c) => matchToCol.get(c) === 0));
  }

  const rows = new Map<number, number>();
  col0Ordered.forEach((n, i) => rows.set(n, i));

  for (let col = 1; col <= 4; col++) {
    const ms = [...matchMap.values()]
      .filter((p) => matchToCol.get(p.numero) === col)
      .sort((a, b) => a.numero - b.numero);
    for (const m of ms) {
      const kids = fedBy.get(m.numero);
      if (kids && kids.length >= 2) {
        rows.set(m.numero, ((rows.get(kids[0]) ?? 0) + (rows.get(kids[1]) ?? 0)) / 2);
      }
    }
  }

  const connectors: Connector[] = [];
  for (const [parent, kids] of fedBy) {
    for (const kid of kids) {
      connectors.push({
        from: { col: matchToCol.get(kid)!, row: rows.get(kid)! },
        to: { col: matchToCol.get(parent)!, row: rows.get(parent)! },
      });
    }
  }

  const nodes = new Map<number, LayoutNode>();
  for (const [num] of matchMap) {
    nodes.set(num, { numero: num, col: matchToCol.get(num)!, row: rows.get(num) ?? 0 });
  }

  return { nodes, connectors };
}

function connectorPath(from: { col: number; row: number }, to: { col: number; row: number }): string {
  const x1 = from.col * PITCH + CARD_W;
  const y1 = from.row * ROW_UNIT + ROW_UNIT / 2;
  const x2 = to.col * PITCH;
  const y2 = to.row * ROW_UNIT + ROW_UNIT / 2;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`;
}

export default function TabelaMataMataPage() {
  const [resultado, setResultado] = useState<BracketResult | null>(null);
  const [placares, setPlacares] = useState<PlacaresState>({});
  const [salvando, setSalvando] = useState<Set<number>>(new Set());
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const tree = useMemo(() => buildTree(), []);
  const maxCol = Math.max(...[...tree.nodes.values()].map((n) => n.col), 5);
  const maxRow = Math.max(...[...tree.nodes.values()].map((n) => n.row), 16);
  const svgW = PITCH * maxCol + CARD_W + 80;
  const svgH = maxRow * ROW_UNIT + CARD_H + 40;

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
    const palpites = dataPalpites.palpites.map(
      (p: { partidaId: number; golsMandante: number | null; golsVisitante: number | null }) => ({
        partidaId: p.partidaId,
        golsMandante: p.golsMandante,
        golsVisitante: p.golsVisitante,
      })
    );

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

  const partidasPorNumero = useMemo(() => {
    if (!resultado) return new Map<number, PartidaResolvida>();
    const m = new Map<number, PartidaResolvida>();
    for (const fase of resultado.fases) {
      for (const p of fase.partidas) m.set(p.numero, p);
    }
    return m;
  }, [resultado]);

  const faseLabels = useMemo(() => {
    if (!resultado) return new Map<number, string>();
    const m = new Map<number, string>();
    for (const fase of resultado.fases) {
      for (const p of fase.partidas) m.set(p.numero, fase.label);
    }
    return m;
  }, [resultado]);

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
            <div className="relative" style={{ width: svgW, minHeight: svgH }}>
              <svg
                width={svgW}
                height={svgH}
                className="pointer-events-none absolute inset-0"
                style={{ zIndex: 0 }}
              >
                {tree.connectors.map((c, i) => (
                  <path
                    key={i}
                    d={connectorPath(c.from, c.to)}
                    fill="none"
                    strokeWidth="1.5"
                    className="stroke-zinc-300 dark:stroke-zinc-600"
                  />
                ))}
              </svg>

              {[...tree.nodes.values()].map((node) => {
                const p = partidasPorNumero.get(node.numero);
                if (!p) return null;
                const placar = placares[p.numero] || { golsMandante: "", golsVisitante: "" };
                const x = node.col * PITCH;
                const y = node.row * ROW_UNIT;
                const podeEditar = !!p.mandante && !!p.visitante;
                const salvandoAgora = salvando.has(p.numero);

                return (
                  <div
                    key={node.numero}
                    className="absolute rounded-lg border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
                    style={{ left: x, top: y, width: CARD_W, height: CARD_H, zIndex: 1 }}
                  >
                    {p.mandante && p.visitante ? (
                      <div className="flex h-full flex-col justify-between text-[13px]">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 truncate">
                            <FlagIcon codigo={p.mandante.codigoPais} className="h-3.5 w-auto shrink-0 rounded-sm" />
                            <span
                              className={`truncate ${p.vencedor?.id === p.mandante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                            >
                              {p.mandante.nome}
                            </span>
                          </span>
                          {podeEditar ? (
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={2}
                              value={placar.golsMandante}
                              onChange={(e) => handleChange(p.numero, "golsMandante", e.target.value)}
                              className={`w-7 rounded border px-0.5 py-0 text-center text-xs ${
                                salvandoAgora ? "opacity-50" : ""
                              } dark:border-zinc-700 dark:bg-zinc-800`}
                            />
                          ) : (
                            <span className="w-7 text-center text-xs font-bold">{p.golsMandante ?? ""}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 truncate">
                            <FlagIcon codigo={p.visitante.codigoPais} className="h-3.5 w-auto shrink-0 rounded-sm" />
                            <span
                              className={`truncate ${p.vencedor?.id === p.visitante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                            >
                              {p.visitante.nome}
                            </span>
                          </span>
                          {podeEditar ? (
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={2}
                              value={placar.golsVisitante}
                              onChange={(e) => handleChange(p.numero, "golsVisitante", e.target.value)}
                              className={`w-7 rounded border px-0.5 py-0 text-center text-xs ${
                                salvandoAgora ? "opacity-50" : ""
                              } dark:border-zinc-700 dark:bg-zinc-800`}
                            />
                          ) : (
                            <span className="w-7 text-center text-xs font-bold">{p.golsVisitante ?? ""}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span>J{node.numero}</span>
                          <span>{p.dataHora ? new Date(p.dataHora).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) : ""}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        A definir
                      </div>
                    )}
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
