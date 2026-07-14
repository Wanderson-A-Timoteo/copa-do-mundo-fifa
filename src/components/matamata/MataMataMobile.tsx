import { FlagIcon } from "@/components/FlagIcon";
import { IconClock, IconMapPin } from "@/components/Icons";
import { formatarData, formatarHora } from "@/lib/format";
import type { BracketResult } from "@/lib/compute-bracket";

interface MataMataMobileProps {
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

export default function MataMataMobile({
  resultado,
  placares,
  salvando,
  onChangePlacar,
}: MataMataMobileProps) {
  return (
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
                
              const jogoIniciado = p.dataHora ? new Date() >= new Date(p.dataHora) : false;

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
                            disabled={jogoIniciado}
                            value={placar.golsMandante}
                            onChange={(e) =>
                              onChangePlacar(p.numero, "golsMandante", e.target.value)
                            }
                            className={`w-8 rounded border px-1 py-0.5 text-center text-sm ${salvandoAgora || jogoIniciado ? "opacity-50" : ""} ${jogoIniciado ? "cursor-not-allowed bg-zinc-200 dark:bg-zinc-700" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
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
                            disabled={jogoIniciado}
                            value={placar.golsVisitante}
                            onChange={(e) =>
                              onChangePlacar(p.numero, "golsVisitante", e.target.value)
                            }
                            className={`w-8 rounded border px-1 py-0.5 text-center text-sm ${salvandoAgora || jogoIniciado ? "opacity-50" : ""} ${jogoIniciado ? "cursor-not-allowed bg-zinc-200 dark:bg-zinc-700" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
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
                              disabled={jogoIniciado}
                              value={placar.penaltisMandante}
                              onChange={(e) =>
                                onChangePlacar(p.numero, "penaltisMandante", e.target.value)
                              }
                              className={`w-7 rounded border px-1 py-0.5 text-center text-xs ${salvandoAgora || jogoIniciado ? "opacity-50" : ""} ${jogoIniciado ? "cursor-not-allowed bg-zinc-200 dark:bg-zinc-700" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
                            />
                            <span className="text-xs text-zinc-400">x</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={2}
                              disabled={jogoIniciado}
                              value={placar.penaltisVisitante}
                              onChange={(e) =>
                                onChangePlacar(p.numero, "penaltisVisitante", e.target.value)
                              }
                              className={`w-7 rounded border px-1 py-0.5 text-center text-xs ${salvandoAgora || jogoIniciado ? "opacity-50" : ""} ${jogoIniciado ? "cursor-not-allowed bg-zinc-200 dark:bg-zinc-700" : ""} dark:border-zinc-700 dark:bg-zinc-800`}
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
                        {jogoIniciado && (
                          <span className="rounded bg-red-500/10 px-1 font-bold text-red-500">
                            Encerrado
                          </span>
                        )}
                        <span className="font-mono">J{p.numero}</span>
                        <span className="text-zinc-300">|</span>
                        {p.dataHora && (
                          <>
                            <span>{formatarData(p.dataHora)}</span>
                            <span className="inline-flex items-center gap-1">
                              <IconClock className="h-3 w-3" />
                              {formatarHora(p.dataHora)}
                            </span>
                            <span className="text-zinc-300">|</span>
                          </>
                        )}
                        {p.estadio && (
                          <span className="inline-flex items-center gap-1">
                            <IconMapPin className="h-3 w-3" />
                            <span className="truncate">{p.estadio.nome}</span>
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="py-2 text-center text-xs text-zinc-400">A definir</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
