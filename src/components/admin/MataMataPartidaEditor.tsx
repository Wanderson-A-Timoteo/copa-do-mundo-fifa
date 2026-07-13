"use client";

import { FlagIcon } from "@/components/FlagIcon";
import { IconClock, IconMapPin } from "@/components/Icons";
import { formatarData, formatarHora } from "@/lib/format";
import type { PartidaResolvida } from "@/lib/compute-bracket";
import ScoreInput from "@/components/ScoreInput";

interface Props {
  partida: PartidaResolvida;
  placar: {
    golsMandante: string;
    golsVisitante: string;
    penaltisMandante: string;
    penaltisVisitante: string;
  };
  onChangePlacar: (numero: number, campo: string, valor: string) => void;
  isAdmin: boolean;
  salvando: boolean;
  onSalvar: (numero: number) => void;
}

export default function MataMataPartidaEditor({
  partida: p,
  placar,
  onChangePlacar,
  isAdmin,
  salvando,
  onSalvar,
}: Props) {
  const golsM = placar.golsMandante;
  const golsV = placar.golsVisitante;
  const penM = placar.penaltisMandante;
  const penV = placar.penaltisVisitante;

  const empate =
    golsM !== "" && golsV !== "" && Number(golsM) === Number(golsV) && Number(golsM) > 0;

  const estadioLabel = p.estadio?.nome ?? "A definir";

  const penInputClass = `w-12 rounded-lg border border-zinc-300 px-2 py-1 text-center text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:w-14 sm:text-sm ${salvando ? "opacity-50" : ""}`;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-shadow dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {p.mandante ? (
              <>
                <FlagIcon codigo={p.mandante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
                <span className="truncate font-medium sm:text-base">{p.mandante.nome}</span>
              </>
            ) : (
              <span className="truncate text-sm text-zinc-400">A definir</span>
            )}
          </div>

          {isAdmin && p.mandante && p.visitante ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <ScoreInput
                value={golsM}
                onChange={(v) => onChangePlacar(p.numero, "golsMandante", v)}
                onBlur={() => onSalvar(p.numero)}
                salvando={salvando}
              />
              <span className="text-sm text-zinc-400 sm:text-base">x</span>
              <ScoreInput
                value={golsV}
                onChange={(v) => onChangePlacar(p.numero, "golsVisitante", v)}
                onBlur={() => onSalvar(p.numero)}
                salvando={salvando}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="min-w-[3.5rem] text-center text-lg font-bold sm:min-w-[4rem] sm:text-xl">
                {p.golsMandante !== null ? p.golsMandante : "-"}
              </span>
              <span className="text-sm text-zinc-400 sm:text-base">x</span>
              <span className="min-w-[3.5rem] text-center text-lg font-bold sm:min-w-[4rem] sm:text-xl">
                {p.golsVisitante !== null ? p.golsVisitante : "-"}
              </span>
            </div>
          )}

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            {p.visitante ? (
              <>
                <span className="truncate text-right font-medium sm:text-base">
                  {p.visitante.nome}
                </span>
                <FlagIcon
                  codigo={p.visitante.codigoPais}
                  className="h-6 w-auto rounded-sm sm:h-8"
                />
              </>
            ) : (
              <span className="truncate text-right text-sm text-zinc-400">A definir</span>
            )}
          </div>
        </div>

        {isAdmin && empate && p.mandante && p.visitante && (
          <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Pênaltis:
            </span>
            <div className="hidden md:flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="20"
                value={penM}
                onChange={(e) => onChangePlacar(p.numero, "penaltisMandante", e.target.value)}
                onBlur={() => onSalvar(p.numero)}
                className={penInputClass}
              />
              <span className="text-xs text-zinc-400">x</span>
              <input
                type="number"
                min="0"
                max="20"
                value={penV}
                onChange={(e) => onChangePlacar(p.numero, "penaltisVisitante", e.target.value)}
                onBlur={() => onSalvar(p.numero)}
                className={penInputClass}
              />
            </div>
          </div>
        )}

        {!isAdmin && empate && p.penaltisMandante !== null && p.penaltisVisitante !== null && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <span className="text-xs font-medium">Pênaltis:</span>
            <span className="font-bold">{p.penaltisMandante}</span>
            <span className="text-xs text-zinc-400">x</span>
            <span className="font-bold">{p.penaltisVisitante}</span>
          </div>
        )}

        <div className="mt-4 border-t border-zinc-300/30 dark:border-zinc-700/30" />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 sm:gap-4 sm:text-sm">
          <span className="font-mono">J{p.numero}</span>
          <span className="text-zinc-300">|</span>
          <span>{formatarData(p.dataHora)}</span>
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3.5 w-3.5" />
            {formatarHora(p.dataHora)}
          </span>
          <span className="text-zinc-300">|</span>
          <span className="inline-flex items-center gap-1">
            <IconMapPin className="h-3.5 w-3.5" />
            {estadioLabel}
          </span>
          {p.resolvida && (
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              Encerrada
            </span>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {p.mandante ? (
              <>
                <FlagIcon
                  codigo={p.mandante.codigoPais}
                  className="h-5 w-auto shrink-0 rounded-sm"
                />
                <span className="truncate text-sm font-medium">{p.mandante.nome}</span>
              </>
            ) : (
              <span className="truncate text-xs text-zinc-400">A definir</span>
            )}
          </div>
          {isAdmin && p.mandante && p.visitante ? (
            <ScoreInput
              value={golsM}
              onChange={(v) => onChangePlacar(p.numero, "golsMandante", v)}
              onBlur={() => onSalvar(p.numero)}
              salvando={salvando}
              isMobile
            />
          ) : (
            <span className="text-sm font-bold">{p.golsMandante ?? "-"}</span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {p.visitante ? (
              <>
                <FlagIcon
                  codigo={p.visitante.codigoPais}
                  className="h-5 w-auto shrink-0 rounded-sm"
                />
                <span className="truncate text-sm font-medium">{p.visitante.nome}</span>
              </>
            ) : (
              <span className="truncate text-xs text-zinc-400">A definir</span>
            )}
          </div>
          {isAdmin && p.mandante && p.visitante ? (
            <ScoreInput
              value={golsV}
              onChange={(v) => onChangePlacar(p.numero, "golsVisitante", v)}
              onBlur={() => onSalvar(p.numero)}
              salvando={salvando}
              isMobile
            />
          ) : (
            <span className="text-sm font-bold">{p.golsVisitante ?? "-"}</span>
          )}
        </div>

        {isAdmin && empate && p.mandante && p.visitante && (
          <div className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 dark:bg-amber-900/20">
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              Pênaltis:
            </span>
            <div className="md:hidden flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="20"
                value={penM}
                onChange={(e) => onChangePlacar(p.numero, "penaltisMandante", e.target.value)}
                onBlur={() => onSalvar(p.numero)}
                className={`w-10 rounded-lg border border-zinc-300 px-1.5 py-1 text-center text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 ${salvando ? "opacity-50" : ""}`}
              />
              <span className="text-[11px] text-zinc-400">x</span>
              <input
                type="number"
                min="0"
                max="20"
                value={penV}
                onChange={(e) => onChangePlacar(p.numero, "penaltisVisitante", e.target.value)}
                onBlur={() => onSalvar(p.numero)}
                className={`w-10 rounded-lg border border-zinc-300 px-1.5 py-1 text-center text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 ${salvando ? "opacity-50" : ""}`}
              />
            </div>
          </div>
        )}

        {!isAdmin && empate && p.penaltisMandante !== null && p.penaltisVisitante !== null && (
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <span className="font-medium">Pênaltis:</span>
            <span className="font-bold">{p.penaltisMandante}</span>
            <span className="text-zinc-400">x</span>
            <span className="font-bold">{p.penaltisVisitante}</span>
          </div>
        )}

        <div className="my-2 border-t border-zinc-300/30 dark:border-zinc-700/30" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          <span className="font-mono">J{p.numero}</span>
          <span className="text-zinc-300">|</span>
          <span>{formatarData(p.dataHora)}</span>
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3 w-3" />
            {formatarHora(p.dataHora)}
          </span>
          <span className="text-zinc-300">|</span>
          <span className="inline-flex items-center gap-1">
            <IconMapPin className="h-3 w-3" />
            {estadioLabel}
          </span>
          {p.resolvida && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              Encerrada
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
