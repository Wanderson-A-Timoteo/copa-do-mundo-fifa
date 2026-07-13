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
    <section className="mt-10">
      <h2 className="text-lg font-bold">{titulo}</h2>
      <div className="mt-3 space-y-2">
        {partidas.map((p) => (
          <PartidaCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
