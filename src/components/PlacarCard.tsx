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
}: Props) {
  const faseFormatada = p.grupoId ? `Grupo ${p.grupoId}` : p.fase.replace(/_/g, " ").toLowerCase();

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col md:block rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <FlagIcon codigo={p.mandante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
            <span className="truncate font-medium sm:text-base">{p.mandante.nome}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ScoreInput
              disabled={disabled}
              value={golsMandante.toString()}
              onChange={onChangeMandante}
              onBlur={onBlur}
              showOverlay={disabled}
              onOverlayClick={onOverlayClick}
              salvando={salvando}
            />
            <span className="text-sm text-zinc-400 sm:text-base">x</span>
            <ScoreInput
              disabled={disabled}
              value={golsVisitante.toString()}
              onChange={onChangeVisitante}
              onBlur={onBlur}
              showOverlay={disabled}
              onOverlayClick={onOverlayClick}
              salvando={salvando}
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            <span className="truncate text-right font-medium sm:text-base">{p.visitante.nome}</span>
            <FlagIcon codigo={p.visitante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
          </div>
        </div>

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
        <div className="flex justify-between items-center w-full gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <FlagIcon codigo={p.mandante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />
            <span className="truncate text-sm font-medium">{p.mandante.nome}</span>
          </div>
          <ScoreInput
            disabled={disabled}
            value={golsMandante.toString()}
            onChange={onChangeMandante}
            onBlur={onBlur}
            showOverlay={disabled}
            onOverlayClick={onOverlayClick}
            salvando={salvando}
            isMobile
          />
        </div>
        <div className="mt-1 flex justify-between items-center w-full gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <FlagIcon codigo={p.visitante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />
            <span className="truncate text-sm font-medium">{p.visitante.nome}</span>
          </div>
          <ScoreInput
            disabled={disabled}
            value={golsVisitante.toString()}
            onChange={onChangeVisitante}
            onBlur={onBlur}
            showOverlay={disabled}
            onOverlayClick={onOverlayClick}
            salvando={salvando}
            isMobile
          />
        </div>
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
