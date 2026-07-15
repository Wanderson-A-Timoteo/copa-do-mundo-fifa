import { FlagIcon } from "@/components/FlagIcon";
import { IconClock, IconMapPin } from "@/components/Icons";
import { formatarData, formatarHora, formatarDataLonga } from "@/lib/format";
import ScoreInput from "@/components/ScoreInput";

export interface GrupoPartida {
  id: number;
  fase: string;
  grupoId: string;
  dataHora: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  encerrada: boolean;
  mandante: { id: number; nome: string; codigoPais: string | null };
  visitante: { id: number; nome: string; codigoPais: string | null };
  estadio: { nome: string; cidade: string; pais: string };
  numero?: number;
}

interface Props {
  partida: GrupoPartida;
  placar: { golsMandante: string; golsVisitante: string };
  onChangePlacar: (id: number, campo: "golsMandante" | "golsVisitante", valor: string) => void;
  isAdmin: boolean;
  salvando: boolean;
  onSalvar: (id: number) => void;
}

export default function GrupoPartidaEditor({
  partida: p,
  placar,
  onChangePlacar,
  isAdmin,
  salvando,
  onSalvar,
}: Props) {
  const golsM = placar.golsMandante;
  const golsV = placar.golsVisitante;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-shadow dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <FlagIcon codigo={p.mandante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
            <span className="truncate font-medium sm:text-base">{p.mandante.nome}</span>
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <ScoreInput
                value={golsM}
                onChange={(v) => onChangePlacar(p.id, "golsMandante", v)}
                onBlur={() => onSalvar(p.id)}
                salvando={salvando}
              />
              <span className="text-sm text-zinc-400 sm:text-base">x</span>
              <ScoreInput
                value={golsV}
                onChange={(v) => onChangePlacar(p.id, "golsVisitante", v)}
                onBlur={() => onSalvar(p.id)}
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
            <span className="truncate text-right font-medium sm:text-base">{p.visitante.nome}</span>
            <FlagIcon codigo={p.visitante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
          </div>
        </div>

        <div className="mt-4 border-t border-zinc-300/30 dark:border-zinc-700/30" />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 sm:gap-4 sm:text-sm">
          <span className="font-mono">J{p.numero ?? p.id}</span>
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
          <span className="text-zinc-400">Grupo {p.grupoId}</span>
          {p.encerrada && (
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              Encerrada
            </span>
          )}
        </div>
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <FlagIcon codigo={p.mandante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />
            <span className="truncate text-sm font-medium">{p.mandante.nome}</span>
          </div>
          {isAdmin ? (
            <ScoreInput
              value={golsM}
              onChange={(v) => onChangePlacar(p.id, "golsMandante", v)}
              onBlur={() => onSalvar(p.id)}
              salvando={salvando}
              isMobile
            />
          ) : (
            <span className="text-sm font-bold">{p.golsMandante ?? "-"}</span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <FlagIcon codigo={p.visitante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />
            <span className="truncate text-sm font-medium">{p.visitante.nome}</span>
          </div>
          {isAdmin ? (
            <ScoreInput
              value={golsV}
              onChange={(v) => onChangePlacar(p.id, "golsVisitante", v)}
              onBlur={() => onSalvar(p.id)}
              salvando={salvando}
              isMobile
            />
          ) : (
            <span className="text-sm font-bold">{p.golsVisitante ?? "-"}</span>
          )}
        </div>
        <div className="my-2 border-t border-zinc-300/30 dark:border-zinc-700/30" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          <span className="font-mono">J{p.numero ?? p.id}</span>
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
          <span className="text-zinc-400">Grupo {p.grupoId}</span>
          {p.encerrada && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              Encerrada
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function GrupoPartidaDia({
  jogos,
  placares,
  onChangePlacar,
  isAdmin,
  salvando,
  onSalvar,
}: {
  jogos: GrupoPartida[];
  placares: Record<number, { golsMandante: string; golsVisitante: string }>;
  onChangePlacar: (id: number, campo: "golsMandante" | "golsVisitante", valor: string) => void;
  isAdmin: boolean;
  salvando: Set<number>;
  onSalvar: (id: number) => void;
}) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold capitalize">{formatarDataLonga(jogos[0].dataHora)}</h2>
      <div className="space-y-3">
        {jogos.map((p) => (
          <GrupoPartidaEditor
            key={p.id}
            partida={p}
            placar={placares[p.id] ?? { golsMandante: "", golsVisitante: "" }}
            onChangePlacar={onChangePlacar}
            isAdmin={isAdmin}
            salvando={salvando.has(p.id)}
            onSalvar={onSalvar}
          />
        ))}
      </div>
    </section>
  );
}
