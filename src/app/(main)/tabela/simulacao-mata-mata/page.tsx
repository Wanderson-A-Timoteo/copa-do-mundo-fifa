"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { FlagIcon } from "@/components/FlagIcon";

import { IconTrophy, IconClock, IconMapPin } from "@/components/Icons";
import ModalLogin from "@/components/ModalLogin";
import { SkeletonMataMata } from "@/components/Skeleton";
import { formatarData, formatarHora } from "@/lib/format";
import {
  computeBracket,
  type GrupoStanding,
  type BracketResult,
  type PartidaResolvida,
} from "@/lib/compute-bracket";
import { formatoCopa } from "@/data/formato-copa";
import { useAuth } from "@/contexts/AuthContext";

type PlacaresState = Record<
  number,
  {
    golsMandante: string;
    golsVisitante: string;
    penaltisMandante: string;
    penaltisVisitante: string;
  }
>;

const CARD_W = 220;
const CARD_H = 156;
const COL_GAP = 48;
const PITCH = CARD_W + COL_GAP;
const ROW_UNIT = 176;
const TOP_OFFSET = 48;

const LABELS: { col: number; label: string }[] = [
  { col: 0, label: "Segundas de final" },
  { col: 1, label: "Oitavas de final" },
  { col: 2, label: "Quartas de final" },
  { col: 3, label: "Semifinal" },
  { col: 4, label: "Decisão 3º lugar / Final" },
  { col: 5, label: "Semifinal" },
  { col: 6, label: "Quartas de final" },
  { col: 7, label: "Oitavas de final" },
  { col: 8, label: "Segundas de final" },
];

const LAYOUT_DATA = {
  nodes: [
    [74, 0, 0],
    [77, 0, 1],
    [73, 0, 2],
    [75, 0, 3],
    [83, 0, 4],
    [84, 0, 5],
    [81, 0, 6],
    [82, 0, 7],
    [89, 1, 0.5],
    [90, 1, 2.5],
    [93, 1, 4.5],
    [94, 1, 6.5],
    [97, 2, 1.5],
    [98, 2, 5.5],
    [101, 3, 3.5],
    [104, 4, 3.5],
    [103, 4, 7.5],
    [102, 5, 3.5],
    [99, 6, 1.5],
    [100, 6, 5.5],
    [91, 7, 0.5],
    [92, 7, 2.5],
    [95, 7, 4.5],
    [96, 7, 6.5],
    [76, 8, 0],
    [78, 8, 1],
    [79, 8, 2],
    [80, 8, 3],
    [86, 8, 4],
    [88, 8, 5],
    [85, 8, 6],
    [87, 8, 7],
  ] as [number, number, number][],
  connections: [
    [74, 89],
    [77, 89],
    [73, 90],
    [75, 90],
    [83, 93],
    [84, 93],
    [81, 94],
    [82, 94],
    [76, 91],
    [78, 91],
    [79, 92],
    [80, 92],
    [86, 95],
    [88, 95],
    [85, 96],
    [87, 96],
    [90, 97],
    [89, 97],
    [93, 98],
    [94, 98],
    [91, 99],
    [92, 99],
    [95, 100],
    [96, 100],
    [97, 101],
    [98, 101],
    [99, 102],
    [100, 102],
    [101, 104],
    [102, 104],
    [101, 103],
    [102, 103],
  ] as [number, number][],
};

function connectorPath(
  from: { col: number; row: number },
  to: { col: number; row: number },
): string {
  const y1 = TOP_OFFSET + from.row * ROW_UNIT + CARD_H / 2;
  const y2 = TOP_OFFSET + to.row * ROW_UNIT + CARD_H / 2;
  const x1 = to.col > from.col ? from.col * PITCH + CARD_W : from.col * PITCH;
  const x2 = to.col > from.col ? to.col * PITCH : to.col * PITCH + CARD_W;
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} L ${mx} ${y1} L ${mx} ${y2} L ${x2} ${y2}`;
}

function matchDependents(matchNum: number): number[] {
  const result: number[] = [];
  const stack = [matchNum];
  const todasPartidas = formatoCopa.fases.flatMap((f) => f.partidas);
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const p of todasPartidas) {
      for (const fonte of [p.mandante, p.visitante]) {
        if (
          (fonte.tipo === "vencedor" || fonte.tipo === "perdedor") &&
          fonte.partidaAnterior === current
        ) {
          if (!result.includes(p.numero)) {
            result.push(p.numero);
            stack.push(p.numero);
          }
        }
      }
    }
  }
  return result;
}

export default function TabelaMataMataPage() {
  const [resultado, setResultado] = useState<BracketResult | null>(null);
  const [placares, setPlacares] = useState<PlacaresState>({});
  const [salvando, setSalvando] = useState<Set<number>>(new Set());
  const { user, token } = useAuth();
  const [showModalLogin, setShowModalLogin] = useState(false);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const gruposRef = useRef<GrupoStanding[]>([]);

  const layoutNodes = useMemo(() => {
    const map = new Map<number, { col: number; row: number }>();
    for (const [num, col, row] of LAYOUT_DATA.nodes) map.set(num, { col, row });
    return map;
  }, []);

  const maxCol = Math.max(...LAYOUT_DATA.nodes.map((n) => n[1]));
  const maxRow = Math.max(...LAYOUT_DATA.nodes.map((n) => n[2]));
  const svgW = (maxCol + 1) * PITCH + CARD_W;
  const svgH = TOP_OFFSET + (maxRow + 1) * ROW_UNIT + CARD_H;

  const carregar = useCallback(async () => {
    const usuarioId = user?.id ?? null;
    if (!usuarioId) return;

    const headers = { Authorization: `Bearer ${token}` };

    const [resGrupos, resPalpites] = await Promise.all([
      fetch(`/api/grupos?usuarioId=${usuarioId}`, { headers }),
      fetch("/api/simulacao/mata-mata", { headers }),
    ]);

    const dataGrupos = await resGrupos.json();
    const dataPalpites = await resPalpites.json();

    const grupos: GrupoStanding[] = dataGrupos.grupos;
    gruposRef.current = grupos;
    const simulacoes = dataPalpites.simulacoes.map(
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

    const r = computeBracket(formatoCopa, grupos, simulacoes);
    setResultado(r);

    const ps: PlacaresState = {};
    for (const fase of r.fases) {
      for (const p of fase.partidas) {
        if (p.golsMandante !== null && p.golsVisitante !== null) {
          ps[p.numero] = {
            golsMandante: String(p.golsMandante),
            golsVisitante: String(p.golsVisitante),
            penaltisMandante: p.penaltisMandante !== null ? String(p.penaltisMandante) : "",
            penaltisVisitante: p.penaltisVisitante !== null ? String(p.penaltisVisitante) : "",
          };
        }
      }
    }
    setPlacares(ps);
  }, [token, user?.id]);

  useEffect(() => {
    if (user) carregar();
  }, [carregar, user]);

  const salvarSimulacaoMataMata = async (
    partidaId: number,
    golsMandante: number | null,
    golsVisitante: number | null,
    penaltisMandante: number | null = null,
    penaltisVisitante: number | null = null,
  ) => {
    setSalvando((prev) => new Set(prev).add(partidaId));
    try {
      const body: Record<string, unknown> = { partidaId, golsMandante, golsVisitante };
      if (penaltisMandante !== null) body.penaltisMandante = penaltisMandante;
      if (penaltisVisitante !== null) body.penaltisVisitante = penaltisVisitante;
      await fetch("/api/simulacao/mata-mata", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } finally {
      setSalvando((prev) => {
        const next = new Set(prev);
        next.delete(partidaId);
        return next;
      });
    }
  };

  function bracketFromPlacares(ps: PlacaresState): BracketResult | null {
    if (gruposRef.current.length === 0) return null;
    const simulacoesInput = Object.entries(ps)
      .filter(([, v]) => v.golsMandante !== "" && v.golsVisitante !== "")
      .map(([id, v]) => ({
        partidaId: Number(id),
        golsMandante: Number(v.golsMandante),
        golsVisitante: Number(v.golsVisitante),
        penaltisMandante: v.penaltisMandante !== "" ? Number(v.penaltisMandante) : undefined,
        penaltisVisitante: v.penaltisVisitante !== "" ? Number(v.penaltisVisitante) : undefined,
      }));
    return computeBracket(formatoCopa, gruposRef.current, simulacoesInput);
  }

  const handleChange = (
    partidaId: number,
    campo: "golsMandante" | "golsVisitante" | "penaltisMandante" | "penaltisVisitante",
    value: string,
  ) => {
    const updated = {
      ...placares,
      [partidaId]: {
        ...(placares[partidaId] ?? {
          golsMandante: "",
          golsVisitante: "",
          penaltisMandante: "",
          penaltisVisitante: "",
        }),
        [campo]: value,
      },
    };
    setPlacares(updated);

    if (timers.current[partidaId]) clearTimeout(timers.current[partidaId]);

    const placar = updated[partidaId];
    const gM = placar.golsMandante === "" ? null : Number(placar.golsMandante);
    const gV = placar.golsVisitante === "" ? null : Number(placar.golsVisitante);
    const completo = gM !== null && gV !== null && !isNaN(gM) && !isNaN(gV);
    const vazio = gM === null && gV === null;

    if (completo) {
      const pM = placar.penaltisMandante !== "" ? Number(placar.penaltisMandante) : null;
      const pV = placar.penaltisVisitante !== "" ? Number(placar.penaltisVisitante) : null;
      timers.current[partidaId] = setTimeout(() => {
        salvarSimulacaoMataMata(partidaId, gM, gV, pM, pV);
      }, 800);

      const r = bracketFromPlacares(updated);
      if (r) setResultado(r);
    }

    if (vazio) {
      const dependents = matchDependents(partidaId);

      timers.current[partidaId] = setTimeout(async () => {
        const ids = [partidaId, ...dependents];
        setSalvando((prev) => new Set([...prev, ...ids]));
        try {
          for (const id of ids) {
            await fetch("/api/simulacao/mata-mata", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ partidaId: id, golsMandante: null, golsVisitante: null }),
            });
          }
          await carregar();
        } finally {
          setSalvando((prev) => {
            const next = new Set(prev);
            for (const id of ids) next.delete(id);
            return next;
          });
        }
      }, 800);

      const cleanPlacares = { ...updated };
      delete cleanPlacares[partidaId];
      for (const dep of dependents) delete cleanPlacares[dep];
      setPlacares(cleanPlacares);

      const r = bracketFromPlacares(cleanPlacares);
      if (r) setResultado(r);
    }
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

  const temConteudo = useMemo(() => {
    if (!resultado) return false;
    return resultado.fases.some((f) => f.partidas.some((p) => p.mandante || p.visitante));
  }, [resultado]);

  return (
    <>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <a
          href="/tabela"
          className="inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Voltar
        </a>
        <h1 className="mt-2 text-3xl font-bold">Simulador de Mata-Mata</h1>
        <p className="mt-1 text-zinc-500">Simule o chaveamento eliminatório</p>

        {!token ? (
          <div className="py-16 text-center">
            <p className="text-lg text-zinc-500">Faça login para palpitar nos jogos</p>
            <button
              onClick={() => setShowModalLogin(true)}
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Fazer Login
            </button>
          </div>
        ) : !resultado ? (
          <div className="py-10">
            <SkeletonMataMata />
          </div>
        ) : !temConteudo ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <IconTrophy className="h-16 w-16 text-zinc-200 dark:text-zinc-700" />
            <h2 className="mt-4 text-xl font-semibold text-zinc-500">
              Chaveamento ainda não disponível
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-400">
              O mata-mata é preenchido automaticamente conforme você registra os resultados na
              página{" "}
              <a
                href="/tabela/simulacao-grupos"
                className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                Simulador de Grupos
              </a>
              .
            </p>
          </div>
        ) : (
          <>
            {resultado.classificadosTerceiros.length > 0 && (
              <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-2 text-sm font-semibold">8 melhores 3º colocados</h3>
                <div className="flex flex-wrap gap-2">
                  {resultado.classificadosTerceiros.map((s) => (
                    <span
                      key={s.id}
                      className="flex items-center gap-1 rounded bg-zinc-200 px-2 py-0.5 text-xs dark:bg-zinc-800"
                    >
                      <FlagIcon codigo={s.codigoPais} className="h-3 w-auto rounded-sm" />
                      {s.nome}
                      <span className="text-zinc-500">({s.p}pts)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="hidden md:block overflow-x-auto pb-8">
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
                  {LABELS.map(({ col, label }) => {
                    const cx = col * PITCH + CARD_W / 2;
                    return (
                      <text
                        key={col}
                        x={cx}
                        y={TOP_OFFSET / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-zinc-500 text-[11px] font-semibold dark:fill-zinc-400"
                      >
                        {col === 4 ? (
                          <>
                            <tspan x={cx} dy="-7">
                              Decisão 3º lugar
                            </tspan>
                            <tspan x={cx} dy="14">
                              / Final
                            </tspan>
                          </>
                        ) : (
                          label
                        )}
                      </text>
                    );
                  })}
                </svg>

                {LAYOUT_DATA.nodes.map(([num, col, row]) => {
                  const p = partidasPorNumero.get(num);
                  if (!p) return null;
                  const placar = placares[p.numero] || { golsMandante: "", golsVisitante: "" };
                  const x = col * PITCH;
                  const y = TOP_OFFSET + row * ROW_UNIT;
                  const podeEditar = !!p.mandante && !!p.visitante;
                  const salvandoAgora = salvando.has(p.numero);
                  const isRight = col >= 5;
                  const empate =
                    podeEditar &&
                    placar.golsMandante !== "" &&
                    placar.golsVisitante !== "" &&
                    Number(placar.golsMandante) === Number(placar.golsVisitante);

                  return (
                    <div
                      key={num}
                      className="absolute rounded-lg border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900"
                      style={{ left: x, top: y, width: CARD_W, height: CARD_H, zIndex: 1 }}
                    >
                      {p.mandante || p.visitante ? (
                        <div
                          className={`flex h-full flex-col gap-0.5 text-[13px] ${empate ? "" : "justify-center"}`}
                        >
                          <div
                            className={`flex items-center gap-1.5 ${isRight ? "flex-row-reverse" : ""}`}
                          >
                            <div
                              className={`flex min-w-0 flex-1 items-center gap-1.5 ${isRight ? "flex-row-reverse" : ""}`}
                            >
                              {p.mandante ? (
                                <>
                                  <FlagIcon
                                    codigo={p.mandante.codigoPais}
                                    className="h-4 w-auto shrink-0 rounded-sm"
                                  />
                                  <span
                                    className={`truncate ${p.vencedor?.id === p.mandante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                                  >
                                    {p.mandante.nome}
                                  </span>
                                </>
                              ) : (
                                <span className="text-zinc-400 italic text-[11px]">A definir</span>
                              )}
                            </div>
                            {podeEditar ? (
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={2}
                                value={placar.golsMandante}
                                onChange={(e) =>
                                  handleChange(p.numero, "golsMandante", e.target.value)
                                }
                                className={`w-7 rounded border px-0.5 py-0 text-center text-xs ${salvandoAgora ? "opacity-50" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
                              />
                            ) : (
                              <span className="w-7 text-center text-xs font-bold">
                                {p.golsMandante ?? ""}
                              </span>
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${isRight ? "flex-row-reverse" : ""}`}
                          >
                            <div
                              className={`flex min-w-0 flex-1 items-center gap-1.5 ${isRight ? "flex-row-reverse" : ""}`}
                            >
                              {p.visitante ? (
                                <>
                                  <FlagIcon
                                    codigo={p.visitante.codigoPais}
                                    className="h-4 w-auto shrink-0 rounded-sm"
                                  />
                                  <span
                                    className={`truncate ${p.vencedor?.id === p.visitante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                                  >
                                    {p.visitante.nome}
                                  </span>
                                </>
                              ) : (
                                <span className="text-zinc-400 italic text-[11px]">A definir</span>
                              )}
                            </div>
                            {podeEditar ? (
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={2}
                                value={placar.golsVisitante}
                                onChange={(e) =>
                                  handleChange(p.numero, "golsVisitante", e.target.value)
                                }
                                className={`w-7 rounded border px-0.5 py-0 text-center text-xs ${salvandoAgora ? "opacity-50" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
                              />
                            ) : (
                              <span className="w-7 text-center text-xs font-bold">
                                {p.golsVisitante ?? ""}
                              </span>
                            )}
                          </div>
                          {podeEditar &&
                            placar.golsMandante !== "" &&
                            placar.golsVisitante !== "" &&
                            Number(placar.golsMandante) === Number(placar.golsVisitante) && (
                              <>
                                <div className="text-center text-[10px] text-zinc-400">
                                  Penaltis
                                </div>
                                <div className="flex items-center justify-center gap-1">
                                  {p.mandante && (
                                    <FlagIcon
                                      codigo={p.mandante.codigoPais}
                                      className="h-3 w-auto shrink-0 rounded-sm"
                                    />
                                  )}
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    value={placar.penaltisMandante}
                                    onChange={(e) =>
                                      handleChange(p.numero, "penaltisMandante", e.target.value)
                                    }
                                    className={`w-5 rounded border px-0.5 py-0 text-center text-[10px] ${salvandoAgora ? "opacity-50" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
                                  />
                                  <span className="text-[10px] text-zinc-400">x</span>
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    value={placar.penaltisVisitante}
                                    onChange={(e) =>
                                      handleChange(p.numero, "penaltisVisitante", e.target.value)
                                    }
                                    className={`w-5 rounded border px-0.5 py-0 text-center text-[10px] ${salvandoAgora ? "opacity-50" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
                                  />
                                  {p.visitante && (
                                    <FlagIcon
                                      codigo={p.visitante.codigoPais}
                                      className="h-3 w-auto shrink-0 rounded-sm"
                                    />
                                  )}
                                </div>
                              </>
                            )}
                          <div className="my-1 border-t border-zinc-300/30 dark:border-zinc-700/30" />
                          <div
                            className={`flex flex-col gap-0.5 text-[10px] text-zinc-400 ${isRight ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`flex items-center gap-2 ${isRight ? "flex-row-reverse" : ""}`}
                            >
                              <span className="font-mono">J{num}</span>
                              <span>{faseNome.get(num) ?? ""}</span>
                            </div>
                            {p.dataHora && (
                              <div
                                className={`flex items-center gap-2 ${isRight ? "flex-row-reverse" : ""}`}
                              >
                                <span>{formatarData(p.dataHora)}</span>
                                <span>{formatarHora(p.dataHora)}</span>
                              </div>
                            )}
                            {p.estadio && (
                              <div
                                className={`flex items-center gap-1 min-w-0 w-full ${isRight ? "flex-row-reverse" : ""}`}
                              >
                                <IconMapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{p.estadio.nome}</span>
                              </div>
                            )}
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

            {/* Mobile: lista em coluna por fase */}
            <div className="block md:hidden space-y-6">
              {resultado.fases.map((fase) => (
                <div key={fase.key}>
                  <h2 className="mb-3 text-lg font-bold">{fase.label}</h2>
                  <div className="space-y-2">
                    {fase.partidas.map((p) => {
                      const placar = placares[p.numero] || {
                        golsMandante: "",
                        golsVisitante: "",
                        penaltisMandante: "",
                        penaltisVisitante: "",
                      };
                      const podeEditar = !!p.mandante && !!p.visitante;
                      const salvandoAgora = salvando.has(p.numero);
                      const empate =
                        podeEditar &&
                        placar.golsMandante !== "" &&
                        placar.golsVisitante !== "" &&
                        Number(placar.golsMandante) === Number(placar.golsVisitante);

                      return (
                        <div
                          key={p.numero}
                          className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                        >
                          {p.mandante || p.visitante ? (
                            <>
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  {p.mandante ? (
                                    <>
                                      <FlagIcon
                                        codigo={p.mandante.codigoPais}
                                        className="h-5 w-auto shrink-0 rounded-sm"
                                      />
                                      <span
                                        className={`truncate text-sm ${p.vencedor?.id === p.mandante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                                      >
                                        {p.mandante.nome}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm italic text-zinc-400">A definir</span>
                                  )}
                                </div>
                                {podeEditar ? (
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    value={placar.golsMandante}
                                    onChange={(e) =>
                                      handleChange(p.numero, "golsMandante", e.target.value)
                                    }
                                    className={`w-8 rounded border px-1 py-0.5 text-center text-sm ${salvandoAgora ? "opacity-50" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
                                  />
                                ) : (
                                  <span className="text-sm font-bold">{p.golsMandante ?? ""}</span>
                                )}
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  {p.visitante ? (
                                    <>
                                      <FlagIcon
                                        codigo={p.visitante.codigoPais}
                                        className="h-5 w-auto shrink-0 rounded-sm"
                                      />
                                      <span
                                        className={`truncate text-sm ${p.vencedor?.id === p.visitante.id ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                                      >
                                        {p.visitante.nome}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm italic text-zinc-400">A definir</span>
                                  )}
                                </div>
                                {podeEditar ? (
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={2}
                                    value={placar.golsVisitante}
                                    onChange={(e) =>
                                      handleChange(p.numero, "golsVisitante", e.target.value)
                                    }
                                    className={`w-8 rounded border px-1 py-0.5 text-center text-sm ${salvandoAgora ? "opacity-50" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
                                  />
                                ) : (
                                  <span className="text-sm font-bold">{p.golsVisitante ?? ""}</span>
                                )}
                              </div>
                              {empate && (
                                <>
                                  <div className="mt-1 text-center text-[11px] text-zinc-400">
                                    Penaltis
                                  </div>
                                  <div className="flex items-center justify-center gap-1.5">
                                    {p.mandante && (
                                      <FlagIcon
                                        codigo={p.mandante.codigoPais}
                                        className="h-4 w-auto shrink-0 rounded-sm"
                                      />
                                    )}
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={2}
                                      value={placar.penaltisMandante}
                                      onChange={(e) =>
                                        handleChange(p.numero, "penaltisMandante", e.target.value)
                                      }
                                      className={`w-7 rounded border px-1 py-0.5 text-center text-xs ${salvandoAgora ? "opacity-50" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
                                    />
                                    <span className="text-xs text-zinc-400">x</span>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={2}
                                      value={placar.penaltisVisitante}
                                      onChange={(e) =>
                                        handleChange(p.numero, "penaltisVisitante", e.target.value)
                                      }
                                      className={`w-7 rounded border px-1 py-0.5 text-center text-xs ${salvandoAgora ? "opacity-50" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
                                    />
                                    {p.visitante && (
                                      <FlagIcon
                                        codigo={p.visitante.codigoPais}
                                        className="h-4 w-auto shrink-0 rounded-sm"
                                      />
                                    )}
                                  </div>
                                </>
                              )}
                              <div className="my-1 border-t border-zinc-300/30 dark:border-zinc-700/30" />
                              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                <span className="font-mono">J{p.numero}</span>
                                <span>{faseNome.get(p.numero) ?? ""}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                {p.dataHora && (
                                  <>
                                    <IconClock className="h-3 w-3" />
                                    <span>
                                      {formatarData(p.dataHora)} {formatarHora(p.dataHora)}
                                    </span>
                                  </>
                                )}
                                {p.estadio && (
                                  <>
                                    <IconMapPin className="h-3 w-3" />
                                    <span className="truncate">{p.estadio.nome}</span>
                                  </>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center py-2 text-sm text-zinc-400">
                              A definir
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {showModalLogin && <ModalLogin onClose={() => setShowModalLogin(false)} />}
    </>
  );
}
