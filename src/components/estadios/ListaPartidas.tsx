import PartidaCard, { PartidaResumida } from "./PartidaResumidaCard";

export default function ListaPartidas({
  titulo,
  partidas,
}: {
  titulo: string;
  partidas: PartidaResumida[];
  vazia?: string;
}) {
  if (partidas.length === 0) return null;
  return (
    <section className="relative mt-10 mb-8">
      <div className="sticky top-14 md:top-16 z-20 -mx-4 mb-6 bg-zinc-50/90 px-4 py-2 backdrop-blur-md shadow-sm border-y border-zinc-200/50 dark:bg-zinc-900/90 dark:border-zinc-800/50 sm:-mx-6 sm:px-6">
        <h2 className="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400 capitalize">
          {titulo}
        </h2>
      </div>
      <div className="space-y-4 border-l-2 border-zinc-200 pl-4 dark:border-zinc-800 ml-2 md:ml-4">
        {partidas.map((p) => (
          <div key={p.id} className="relative">
            <div className="absolute -left-[21px] top-1/2 -mt-1.5 h-3 w-3 rounded-full border-2 border-zinc-50 bg-zinc-300 dark:border-zinc-900 dark:bg-zinc-600" />
            <PartidaCard p={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
