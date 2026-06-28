"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import { IconArrowLeft } from "@/components/Icons";
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

const CARD_W = 200;
const CARD_H = 78;
const COL_GAP = 48;
const PITCH = CARD_W + COL_GAP;
const ROW_UNIT = 100;

const LAYOUT_DATA = {
  nodes: [
    [73, 0, 0], [75, 0, 1], [74, 0, 2], [77, 0, 3],
    [79, 0, 4], [80, 0, 5], [83, 0, 6], [84, 0, 7],
    [90, 1, 0.5], [89, 1, 2.5], [92, 1, 4.5], [93, 1, 6.5],
    [97, 2, 1.5], [98, 2, 5.5],
    [101, 3, 1.5], [104, 3, 4.5], [103, 3, 6.5], [102, 3, 7.5],
    [99, 4, 1.5], [100, 4, 5.5],
    [95, 5, 0.5], [94, 5, 2.5], [96, 5, 4.5], [91, 5, 6.5],
    [86, 6, 0], [88, 6, 1], [81, 6, 2], [82, 6, 3],
    [85, 6, 4], [87, 6, 5], [76, 6, 6], [78, 6, 7],
  ] as [number, number, number][],
  connections: [
    [73, 90], [75, 90], [74, 89], [77, 89],
    [79, 92], [80, 92], [83, 93], [84, 93],
    [90, 97], [89, 97], [92, 98], [93, 98],
    [97, 101], [98, 101],
    [86, 95], [88, 95], [81, 94], [82, 94],
    [85, 96], [87, 96], [76, 91], [78, 91],
    [95, 99], [94, 99], [96, 100], [91, 100],
    [99, 102], [100, 102],
    [101, 104], [102, 104],
    [101, 103], [102, 103],
  ] as [number, number][],
};

function connectorPath(from: { col: number; row: number }, to: { col: number; row: number }): string {
  const y1 = from.row * ROW_UNIT + CARD_H / 2;
  const y2 = to.row * ROW_UNIT + CARD_H / 2;
  const OFFSET = 10;
  if (to.col > from.col) {
    const x1 = from.col * PITCH + CARD_W;
    const x2 = to.col * PITCH;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`;
  }
  if (to.col < from.col) {
    const x1 = from.col * PITCH;
    const x2 = to.col * PITCH + CARD_W;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`;
  }
  const x = from.col * PITCH + CARD_W;
  const mx = x + OFFSET;
  return `M ${x} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x} ${y2}`;
}

export default function TabelaMataMataPage() {
  const router = useRouter();
  const [resultado, setResultado] = useState<BracketResult | null>(null);
  const [placares, setPlacares] = useState<PlacaresState>({});
  const [salvando, setSalvando] = useState<Set<number>>(new Set());
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const layoutNodes = useMemo(() => {
    const map = new Map<number, { col: number; row: number }>();
    for (const [num, col, row] of LAYOUT_DATA.nodes) map.set(num, { col, row });
    return map;
  }, []);

  const maxCol = Math.max(...LAYOUT_DATA.nodes.map((n) => n[1]));
  const maxRow = Math.max(...LAYOUT_DATA.nodes.map((n) => n[2]));
  const svgW = (maxCol + 1) * PITCH + CARD_W;
  const svgH = (maxRow + 1) * ROW_UNIT + CARD_H;

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

  const faseNome = useMemo(() => {
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
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <IconArrowLeft className="h-4 w-4" />
              Voltar
            </button>
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
                {LAYOUT_DATA.connections.map(([fromNum, toNum], i) => {
                  const from = layoutNodes.get(fromNum);
                  const to = layoutNodes.get(toNum);
                  if (!from || !to) return null;
                  return (
                    <path
                      key={i}
                      d={connectorPath(from, to)}
                      fill="none"
                      strokeWidth="2"
                      className="stroke-zinc-300 dark:stroke-zinc-600"
                    />
                  );
                })}
              </svg>

              {LAYOUT_DATA.nodes.map(([num, col, row]) => {
                const p = partidasPorNumero.get(num);
                if (!p) return null;
                const placar = placares[p.numero] || { golsMandante: "", golsVisitante: "" };
                const x = col * PITCH;
                const y = row * ROW_UNIT;
                const podeEditar = !!p.mandante && !!p.visitante;
                const salvandoAgora = salvando.has(p.numero);
                const isRight = col >= 4;

                return (
                  <div
                    key={num}
                    className="absolute rounded-lg border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
                    style={{ left: x, top: y, width: CARD_W, height: CARD_H, zIndex: 1 }}
                  >
                    {p.mandante && p.visitante ? (
                      <div className="flex h-full flex-col gap-0.5 text-[13px]">
                        <div className={`flex items-center gap-1.5 ${isRight ? "flex-row-reverse" : ""}`}>
                          <div className={`flex min-w-0 flex-1 items-center gap-1.5 ${isRight ? "flex-row-reverse" : ""}`}>
                            <FlagIcon codigo={p.mandante.codigoPais} className="h-4 w-auto shrink-0 rounded-sm" />
                            <span
                              className={`truncate ${p.vencedor?.id === p.mandante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                            >
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
                              className={`w-7 rounded border px-0.5 py-0 text-center text-xs ${
                                salvandoAgora ? "opacity-50" : ""
                              } dark:border-zinc-700 dark:bg-zinc-800`}
                            />
                          ) : (
                            <span className="w-7 text-center text-xs font-bold">{p.golsMandante ?? ""}</span>
                          )}
                        </div>
                        <div className={`flex items-center gap-1.5 ${isRight ? "flex-row-reverse" : ""}`}>
                          <div className={`flex min-w-0 flex-1 items-center gap-1.5 ${isRight ? "flex-row-reverse" : ""}`}>
                            <FlagIcon codigo={p.visitante.codigoPais} className="h-4 w-auto shrink-0 rounded-sm" />
                            <span
                              className={`truncate ${p.vencedor?.id === p.visitante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                            >
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
                              className={`w-7 rounded border px-0.5 py-0 text-center text-xs ${
                                salvandoAgora ? "opacity-50" : ""
                              } dark:border-zinc-700 dark:bg-zinc-800`}
                            />
                          ) : (
                            <span className="w-7 text-center text-xs font-bold">{p.golsVisitante ?? ""}</span>
                          )}
                        </div>
                        <div className={`flex items-center gap-2 text-[10px] text-zinc-400 ${isRight ? "flex-row-reverse" : ""}`}>
                          <span className="font-mono">J{num}</span>
                          <span>{faseNome.get(num) ?? ""}</span>
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
