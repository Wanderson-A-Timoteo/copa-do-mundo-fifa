import { FlagIcon } from "@/components/FlagIcon";
import { IconClock, IconMapPin } from "@/components/Icons";
import { formatarData, formatarHora, formatarDataLonga } from "@/lib/format";
import ScoreInput from "@/components/ScoreInput";
import { useState } from "react";
import { useToast } from "@/contexts/ToastContext";

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

  const [isApurando, setIsApurando] = useState(false);
  const toast = useToast();

  const handleApurar = async () => {
    setIsApurando(true);
    try {
      const res = await fetch("/api/admin/apurar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partidaId: p.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao apurar");
      toast.success(`${data.palpitesApurados} palpites apurados com sucesso!`);
    } catch (e: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      toast.error(e.message);
    } finally {
      setIsApurando(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/50 bg-zinc-100/90 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-700/50 dark:bg-zinc-800/90 sm:p-6">
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
          {isAdmin && p.encerrada && (
            <button
              onClick={handleApurar}
              className="ml-auto flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
            >
              {isApurando ? "Apurando..." : "Apurar Pontos"}
            </button>
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
          {isAdmin && p.encerrada && (
            <button
              onClick={handleApurar}
              disabled={isApurando}
              className="ml-auto flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
            >
              {isApurando ? "Apurando..." : "Apurar Pontos"}
            </button>
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
    <section className="relative mb-8">
      <div className="mb-6">
        <h2 className="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400 capitalize">
          {formatarDataLonga(jogos[0].dataHora)}
        </h2>
      </div>
      <div className="space-y-4 border-l-2 border-zinc-200 pl-4 dark:border-zinc-800 ml-2 md:ml-4">
        {jogos.map((p) => (
          <div key={p.id} className="relative">
            <div className="absolute -left-[21px] top-1/2 -mt-1.5 h-3 w-3 rounded-full border-2 border-zinc-50 bg-zinc-300 dark:border-zinc-900 dark:bg-zinc-600" />
            <GrupoPartidaEditor
              partida={p}
              placar={placares[p.id] ?? { golsMandante: "", golsVisitante: "" }}
              onChangePlacar={onChangePlacar}
              isAdmin={isAdmin}
              salvando={salvando.has(p.id)}
              onSalvar={onSalvar}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
