import { FlagIcon } from "@/components/FlagIcon";
import { IconClock } from "@/components/Icons";

export interface PartidaResumida {
  id: number;
  dataHora: string;
  fase: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  mandante: { id: number; nome: string; codigoPais: string | null };
  visitante: { id: number; nome: string; codigoPais: string | null };
}

function formatarFase(fase: string): string {
  if (fase === "GRUPOS" || fase.startsWith("Grupo")) return "Fase de Grupos";
  return fase;
}

export default function PartidaCard({ p }: { p: PartidaResumida }) {
  const ehFutura = new Date(p.dataHora) > new Date();
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 shadow transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:gap-4 sm:p-4">
      <div className="flex flex-1 items-center justify-end gap-2">
        <span className="truncate text-right font-medium">{p.mandante.nome}</span>
        <FlagIcon codigo={p.mandante.codigoPais} className="h-5 w-auto rounded-sm" />
      </div>

      <div className="flex flex-col items-center">
        <span className="text-base font-bold sm:text-lg">
          {ehFutura ? "- x -" : `${p.golsMandante ?? "-"} x ${p.golsVisitante ?? "-"}`}
        </span>
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <IconClock className="h-3 w-3" />
          {new Date(p.dataHora).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
            day: "2-digit",
            month: "2-digit",
          })}
        </div>
        <span className="mt-0.5 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {formatarFase(p.fase)}
        </span>
      </div>

      <div className="flex flex-1 items-center gap-2">
        <FlagIcon codigo={p.visitante.codigoPais} className="h-5 w-auto rounded-sm" />
        <span className="truncate font-medium">{p.visitante.nome}</span>
      </div>
    </div>
  );
}
