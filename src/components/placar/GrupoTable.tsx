import { FlagIcon } from "@/components/FlagIcon";
import type { ClassificacaoSelecao } from "@/types";

interface GrupoTableProps {
  grupo: {
    nome: string;
    selecoes: ClassificacaoSelecao[];
  };
}

export default function GrupoTable({ grupo }: GrupoTableProps) {
  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold">{grupo.nome}</h2>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Seleção</th>
              <th className="px-3 py-2 text-center font-medium">P</th>
              <th className="px-3 py-2 text-center font-medium">J</th>
              <th className="px-3 py-2 text-center font-medium">V</th>
              <th className="px-3 py-2 text-center font-medium">E</th>
              <th className="px-3 py-2 text-center font-medium">D</th>
              <th className="px-3 py-2 text-center font-medium">GM</th>
              <th className="px-3 py-2 text-center font-medium">GC</th>
              <th className="px-3 py-2 text-center font-medium">SG</th>
            </tr>
          </thead>
          <tbody>
            {grupo.selecoes.map((sel, idx) => (
              <tr
                key={sel.id}
                className={`border-t border-zinc-100 dark:border-zinc-800 border-l-4 ${
                  idx < 2
                    ? "border-l-emerald-500"
                    : idx === 2
                      ? "border-l-amber-500"
                      : "border-l-red-500"
                }`}
              >
                <td className="px-3 py-3 font-bold text-zinc-400">{idx + 1}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <FlagIcon codigo={sel.codigoPais} className="h-5 w-auto rounded-sm" />
                    <span className="font-medium">{sel.nome}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center font-bold">{sel.p}</td>
                <td className="px-3 py-3 text-center text-zinc-500">{sel.j}</td>
                <td className="px-3 py-3 text-center text-zinc-500">{sel.v}</td>
                <td className="px-3 py-3 text-center text-zinc-500">{sel.e}</td>
                <td className="px-3 py-3 text-center text-zinc-500">{sel.d}</td>
                <td className="px-3 py-3 text-center text-zinc-500">{sel.gp}</td>
                <td className="px-3 py-3 text-center text-zinc-500">{sel.gc}</td>
                <td className="px-3 py-3 text-center text-zinc-500">
                  {sel.sg > 0 ? `+${sel.sg}` : sel.sg}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 border-l-[3px] border-l-emerald-500" />
          Classificado
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 border-l-[3px] border-l-amber-500" />
          Repescagem
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block h-3 border-l-[3px] border-l-red-500" />
          Eliminado
        </span>
      </div>
    </section>
  );
}
