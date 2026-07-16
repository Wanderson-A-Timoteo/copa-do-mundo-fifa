import { FlagIcon } from "@/components/FlagIcon";
import { IconClock, IconMapPin } from "@/components/Icons";
import { formatarData, formatarHora } from "@/lib/format";
import ScoreInput from "@/components/ScoreInput";
import type { PartidaResumo } from "@/types";

interface Props {
  partida: PartidaResumo;
  numero?: number;
  golsMandante: string | number;
  golsVisitante: string | number;
  onChangeMandante: (valor: string) => void;
  onChangeVisitante: (valor: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  onOverlayClick?: () => void;
  salvando?: boolean;
  penaltisMandante?: string | number;
  penaltisVisitante?: string | number;
  onChangePenaltisMandante?: (valor: string) => void;
  onChangePenaltisVisitante?: (valor: string) => void;
  empate?: boolean;
}

export default function PlacarCard({
  partida: p,
  numero,
  golsMandante,
  golsVisitante,
  onChangeMandante,
  onChangeVisitante,
  onBlur,
  disabled,
  onOverlayClick,
  salvando,
  penaltisMandante,
  penaltisVisitante,
  onChangePenaltisMandante,
  onChangePenaltisVisitante,
  empate,
}: Props) {
  const faseFormatada = p.grupoId ? `Grupo ${p.grupoId}` : p.fase.replace(/_/g, " ").toLowerCase();

  const penInputClass = `w-12 rounded-lg border border-zinc-300 px-2 py-1 text-center text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:w-14 sm:text-sm`;

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col md:block rounded-xl border border-zinc-200 bg-zinc-100 p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <ScoreInput
              disabled={disabled || !p.mandante || !p.visitante}
              value={golsMandante.toString()}
              onChange={onChangeMandante}
              onBlur={onBlur}
              showOverlay={disabled || !p.mandante || !p.visitante}
              onOverlayClick={onOverlayClick}
              salvando={salvando}
            />
            <span className="text-sm text-zinc-400 sm:text-base">x</span>
            <ScoreInput
              disabled={disabled || !p.mandante || !p.visitante}
              value={golsVisitante.toString()}
              onChange={onChangeVisitante}
              onBlur={onBlur}
              showOverlay={disabled || !p.mandante || !p.visitante}
              onOverlayClick={onOverlayClick}
              salvando={salvando}
            />
          </div>

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

        {empate &&
          p.mandante &&
          p.visitante &&
          onChangePenaltisMandante &&
          onChangePenaltisVisitante && (
            <div className="mt-4 flex flex-col items-center justify-center border-t border-dashed border-zinc-200 pt-4 dark:border-zinc-800">
              <span className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Pênaltis
              </span>
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <FlagIcon
                    codigo={p.mandante.codigoPais}
                    className="h-5 w-auto rounded-sm shadow-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={penaltisMandante ?? ""}
                    onChange={(e) => onChangePenaltisMandante(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={penInputClass}
                  />
                </div>
                <span className="text-xs font-bold text-zinc-300">X</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={penaltisVisitante ?? ""}
                    onChange={(e) => onChangePenaltisVisitante(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={penInputClass}
                  />
                  <FlagIcon
                    codigo={p.visitante.codigoPais}
                    className="h-5 w-auto rounded-sm shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

        <div className="mt-4 border-t border-zinc-300/30 dark:border-zinc-700/30" />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 sm:gap-4 sm:text-sm">
          <span className="font-mono">J{numero ?? p.id}</span>
          <span className="text-zinc-300">|</span>
          <span className="capitalize">{faseFormatada}</span>
          <span className="text-zinc-300">|</span>
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3.5 w-3.5" />
            {formatarData(p.dataHora)} - {formatarHora(p.dataHora)}
          </span>
          <span className="text-zinc-300">|</span>
          <span className="inline-flex items-center gap-1">
            <IconMapPin className="h-3.5 w-3.5" />
            {p.estadio.nome}
          </span>
        </div>
      </div>

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
          <ScoreInput
            disabled={disabled || !p.mandante || !p.visitante}
            value={golsMandante.toString()}
            onChange={onChangeMandante}
            onBlur={onBlur}
            showOverlay={disabled || !p.mandante || !p.visitante}
            onOverlayClick={onOverlayClick}
            salvando={salvando}
            isMobile
          />
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
          <ScoreInput
            disabled={disabled || !p.mandante || !p.visitante}
            value={golsVisitante.toString()}
            onChange={onChangeVisitante}
            onBlur={onBlur}
            showOverlay={disabled || !p.mandante || !p.visitante}
            onOverlayClick={onOverlayClick}
            salvando={salvando}
            isMobile
          />
        </div>

        {empate &&
          p.mandante &&
          p.visitante &&
          onChangePenaltisMandante &&
          onChangePenaltisVisitante && (
            <div className="mt-4 flex flex-col items-center justify-center border-t border-dashed border-zinc-200 pt-3 dark:border-zinc-800">
              <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Pênaltis
              </span>
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1.5">
                  <FlagIcon
                    codigo={p.mandante.codigoPais}
                    className="h-4 w-auto rounded-sm shadow-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={penaltisMandante ?? ""}
                    onChange={(e) => onChangePenaltisMandante(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={penInputClass}
                  />
                </div>
                <span className="text-[10px] font-bold text-zinc-300">X</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={penaltisVisitante ?? ""}
                    onChange={(e) => onChangePenaltisVisitante(e.target.value)}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={penInputClass}
                  />
                  <FlagIcon
                    codigo={p.visitante.codigoPais}
                    className="h-4 w-auto rounded-sm shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

        <div className="my-2 border-t border-zinc-300/30 dark:border-zinc-700/30" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          <span className="font-mono">J{numero ?? p.id}</span>
          <span className="text-zinc-300">|</span>
          <span className="capitalize">{faseFormatada}</span>
          <span className="text-zinc-300">|</span>
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3 w-3" />
            {formatarData(p.dataHora)} - {formatarHora(p.dataHora)}
          </span>
          <span className="text-zinc-300 hidden sm:inline">|</span>
          <span className="inline-flex items-center gap-1 w-full sm:w-auto">
            <IconMapPin className="h-3 w-3" />
            {p.estadio.nome}
          </span>
        </div>
      </div>
    </div>
  );
}
