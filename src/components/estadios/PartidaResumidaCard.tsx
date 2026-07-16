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
  return fase.replace(/_/g, " ").toLowerCase();
}

export default function PartidaCard({ p }: { p: PartidaResumida }) {
  const ehFutura = new Date(p.dataHora) > new Date();

  const placarM = ehFutura ? "-" : (p.golsMandante ?? "-");
  const placarV = ehFutura ? "-" : (p.golsVisitante ?? "-");

  return (
    <div className="group w-full max-w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] sm:p-5">
      {/* Layout Desktop */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex flex-1 items-center justify-end gap-3">
          <span className="truncate text-right font-medium">{p.mandante?.nome ?? "A definir"}</span>
          {p.mandante && (
            <FlagIcon codigo={p.mandante.codigoPais} className="h-6 w-auto rounded-sm" />
          )}
        </div>

        <div className="flex flex-col items-center min-w-[100px]">
          <span className="text-xl font-bold tracking-widest">
            {placarM} x {placarV}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium uppercase tracking-wider mt-1">
            <IconClock className="h-3 w-3" />
            {new Date(p.dataHora).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
              day: "2-digit",
              month: "2-digit",
            })}
          </div>
          <span className="mt-1.5 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider dark:bg-zinc-800 dark:text-zinc-400">
            {formatarFase(p.fase)}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-3">
          {p.visitante && (
            <FlagIcon codigo={p.visitante.codigoPais} className="h-6 w-auto rounded-sm" />
          )}
          <span className="truncate font-medium">{p.visitante?.nome ?? "A definir"}</span>
        </div>
      </div>

      {/* Layout Mobile (Empilhado) */}
      <div className="flex flex-col md:hidden">
        <div className="flex items-center justify-between gap-3 p-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {p.mandante && (
              <FlagIcon codigo={p.mandante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />
            )}
            <span className="truncate text-sm font-semibold">
              {p.mandante?.nome ?? "A definir"}
            </span>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 font-bold dark:bg-zinc-800/50">
            {placarM}
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-3 p-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {p.visitante && (
              <FlagIcon
                codigo={p.visitante.codigoPais}
                className="h-5 w-auto shrink-0 rounded-sm"
              />
            )}
            <span className="truncate text-sm font-semibold">
              {p.visitante?.nome ?? "A definir"}
            </span>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-50 font-bold dark:bg-zinc-800/50">
            {placarV}
          </div>
        </div>

        <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800/50" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-zinc-500">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 uppercase tracking-wider dark:bg-zinc-800">
            {formatarFase(p.fase)}
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span className="inline-flex items-center gap-1 uppercase tracking-wider">
            <IconClock className="h-3 w-3" />
            {new Date(p.dataHora).toLocaleDateString("pt-BR", {
              timeZone: "UTC",
              day: "2-digit",
              month: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
