import { FlagIcon } from "@/components/FlagIcon";
import { IconClock, IconMapPin } from "@/components/Icons";
import { formatarData, formatarHora } from "@/lib/format";
import ScoreInput from "@/components/ScoreInput";
import type { PartidaResumo } from "@/types";

interface PartidasListProps {
  partidas: PartidaResumo[];
  placares: Record<number, { golsMandante: string; golsVisitante: string }>;
  token: string | null;
  onScoreChange: (partidaId: number, campo: "golsMandante" | "golsVisitante", valor: string) => void;
  onAutoSalvar: (partidaId: number) => void;
  onOpenModal: () => void;
}

export default function PartidasList({
  partidas,
  placares,
  token,
  onScoreChange,
  onAutoSalvar,
  onOpenModal,
}: PartidasListProps) {
  if (partidas.length === 0) {
    return <p className="text-zinc-500">Nenhum jogo encontrado para este grupo.</p>;
  }

  return (
    <div className="space-y-3">
      {partidas.map((p) => {
        const golsM = placares[p.id]?.golsMandante ?? "";
        const golsV = placares[p.id]?.golsVisitante ?? "";
        return (
          <div
            key={p.id}
            className="rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
          >
            <div className="hidden md:block">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                  <FlagIcon
                    codigo={p.mandante.codigoPais}
                    className="h-6 w-auto rounded-sm sm:h-8"
                  />
                  <span className="truncate font-medium sm:text-base">
                    {p.mandante.nome}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <ScoreInput
                    disabled={!token}
                    value={golsM}
                    onChange={(v) => onScoreChange(p.id, "golsMandante", v)}
                    onBlur={() => onAutoSalvar(p.id)}
                    showOverlay={!token}
                    onOverlayClick={onOpenModal}
                  />
                  <span className="text-sm text-zinc-400 sm:text-base">x</span>
                  <ScoreInput
                    disabled={!token}
                    value={golsV}
                    onChange={(v) => onScoreChange(p.id, "golsVisitante", v)}
                    onBlur={() => onAutoSalvar(p.id)}
                    showOverlay={!token}
                    onOverlayClick={onOpenModal}
                  />
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
                  <span className="truncate text-right font-medium sm:text-base">
                    {p.visitante.nome}
                  </span>
                  <FlagIcon
                    codigo={p.visitante.codigoPais}
                    className="h-6 w-auto rounded-sm sm:h-8"
                  />
                </div>
              </div>

              <div className="mt-4 border-t border-zinc-300/30 dark:border-zinc-700/30" />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 sm:gap-4 sm:text-sm">
                <span className="font-mono">J{p.id}</span>
                <span className="text-zinc-300">|</span>
                <span>{formatarData(p.dataHora)}</span>
                <span className="inline-flex items-center gap-1">
                  <IconClock className="h-3.5 w-3.5" />
                  {formatarHora(p.dataHora)}
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
                  <FlagIcon
                    codigo={p.mandante.codigoPais}
                    className="h-5 w-auto shrink-0 rounded-sm"
                  />
                  <span className="truncate text-sm font-medium">
                    {p.mandante.nome}
                  </span>
                </div>
                <ScoreInput
                  disabled={!token}
                  value={golsM}
                  onChange={(v) => onScoreChange(p.id, "golsMandante", v)}
                  onBlur={() => onAutoSalvar(p.id)}
                  showOverlay={!token}
                  onOverlayClick={onOpenModal}
                  isMobile
                />
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <FlagIcon
                    codigo={p.visitante.codigoPais}
                    className="h-5 w-auto shrink-0 rounded-sm"
                  />
                  <span className="truncate text-sm font-medium">
                    {p.visitante.nome}
                  </span>
                </div>
                <ScoreInput
                  disabled={!token}
                  value={golsV}
                  onChange={(v) => onScoreChange(p.id, "golsVisitante", v)}
                  onBlur={() => onAutoSalvar(p.id)}
                  showOverlay={!token}
                  onOverlayClick={onOpenModal}
                  isMobile
                />
              </div>
              <div className="my-2 border-t border-zinc-300/30 dark:border-zinc-700/30" />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <span className="font-mono">J{p.id}</span>
                <span className="text-zinc-300">|</span>
                <span>{formatarData(p.dataHora)}</span>
                <span className="inline-flex items-center gap-1">
                  <IconClock className="h-3 w-3" />
                  {formatarHora(p.dataHora)}
                </span>
                <span className="text-zinc-300">|</span>
                <span className="inline-flex items-center gap-1">
                  <IconMapPin className="h-3 w-3" />
                  {p.estadio.nome}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
