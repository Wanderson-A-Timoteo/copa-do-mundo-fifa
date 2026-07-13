import { useMemo } from "react";
import { FlagIcon } from "@/components/FlagIcon";
import { IconMapPin } from "@/components/Icons";
import { formatarData, formatarHora } from "@/lib/format";
import type { BracketResult, PartidaResolvida } from "@/lib/compute-bracket";

const CARD_W = 200;
const CARD_H = 134;
const COL_GAP = 48;
const PITCH = CARD_W + COL_GAP;
const ROW_UNIT = 158;
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

interface MataMataDesktopProps {
  resultado: BracketResult;
  placares: Record<
    number,
    { golsMandante: string; golsVisitante: string; penaltisMandante: string; penaltisVisitante: string }
  >;
  salvando: Set<number>;
  onChangePlacar: (
    partidaId: number,
    campo: "golsMandante" | "golsVisitante" | "penaltisMandante" | "penaltisVisitante",
    valor: string,
  ) => void;
}

export default function MataMataDesktop({
  resultado,
  placares,
  salvando,
  onChangePlacar,
}: MataMataDesktopProps) {
  const layoutNodes = useMemo(() => {
    const map = new Map<number, { col: number; row: number }>();
    for (const [num, col, row] of LAYOUT_DATA.nodes) map.set(num, { col, row });
    return map;
  }, []);

  const maxCol = Math.max(...LAYOUT_DATA.nodes.map((n) => n[1]));
  const maxRow = Math.max(...LAYOUT_DATA.nodes.map((n) => n[2]));
  const svgW = (maxCol + 1) * PITCH + CARD_W;
  const svgH = TOP_OFFSET + (maxRow + 1) * ROW_UNIT + CARD_H;

  const partidasPorNumero = useMemo(() => {
    const m = new Map<number, PartidaResolvida>();
    for (const fase of resultado.fases) {
      for (const p of fase.partidas) m.set(p.numero, p);
    }
    return m;
  }, [resultado]);

  const faseNome = useMemo(() => {
    const m = new Map<number, string>();
    for (const fase of resultado.fases) {
      for (const p of fase.partidas) m.set(p.numero, fase.label);
    }
    return m;
  }, [resultado]);

  return (
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
          const placar = placares[p.numero] || {
            golsMandante: "",
            golsVisitante: "",
            penaltisMandante: "",
            penaltisVisitante: "",
          };
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
                          onChangePlacar(p.numero, "golsMandante", e.target.value)
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
                          onChangePlacar(p.numero, "golsVisitante", e.target.value)
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
                        <div className="text-center text-[10px] text-zinc-400">Penaltis</div>
                        <div
                          className={`flex items-center justify-center gap-1 ${isRight ? "flex-row-reverse" : ""}`}
                        >
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
                              onChangePlacar(p.numero, "penaltisMandante", e.target.value)
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
                              onChangePlacar(p.numero, "penaltisVisitante", e.target.value)
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
                    className={`flex items-center gap-2 text-[10px] text-zinc-400 ${isRight ? "flex-row-reverse" : ""}`}
                  >
                    <span className="font-mono">J{num}</span>
                    <span>{faseNome.get(num) ?? ""}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 text-[10px] text-zinc-400 ${isRight ? "flex-row-reverse" : ""}`}
                  >
                    {p.dataHora && (
                      <span>
                        {formatarData(p.dataHora)} {formatarHora(p.dataHora)}
                      </span>
                    )}
                    {p.estadio && (
                      <>
                        <IconMapPin className="h-3 w-3" />
                        <span className="truncate">{p.estadio.nome}</span>
                      </>
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
  );
}
