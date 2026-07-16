import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FlagIcon } from "@/components/FlagIcon";
import PlayerCard from "@/components/PlayerCard";

export default async function DetalheSelecaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let selecao = await prisma.selecao.findUnique({
    where: { slug },
    include: {
      grupo: true,
      jogadores: {
        orderBy: { posicao: "asc" },
        include: { figurinha: { select: { raridade: true } } },
      },
      partidasCasa: { include: { estadio: true, mandante: true, visitante: true } },
      partidasFora: { include: { estadio: true, mandante: true, visitante: true } },
    },
  });

  if (!selecao) {
    const id = Number(slug);
    if (!isNaN(id)) {
      selecao = await prisma.selecao.findUnique({
        where: { id },
        include: {
          grupo: true,
          jogadores: {
            orderBy: { posicao: "asc" },
            include: { figurinha: { select: { raridade: true } } },
          },
          partidasCasa: { include: { estadio: true, mandante: true, visitante: true } },
          partidasFora: { include: { estadio: true, mandante: true, visitante: true } },
        },
      });
    }
  }

  if (!selecao) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8">
        <p className="text-zinc-500">Seleção não encontrada</p>
        <Link href="/selecoes" className="mt-4 inline-block text-sm text-zinc-500 underline">
          ← Voltar
        </Link>
      </main>
    );
  }

  const posicoes = ["Goleiro", "Defensor", "Meia", "Atacante"];

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <Link
        href="/selecoes"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
      >
        &larr; Voltar
      </Link>
      
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
        <FlagIcon codigo={selecao.codigoPais} className="h-24 w-auto rounded-md drop-shadow-md" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">{selecao.nome}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-700/50">{selecao.grupo.nome}</span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-700/50">{selecao.continente}</span>
            {selecao.titulos > 0 && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                {selecao.titulos} {selecao.titulos === 1 ? "título mundial" : "títulos mundiais"}
              </span>
            )}
            {selecao.rankingFifa && (
              <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-700/50">
                Ranking FIFA: {selecao.rankingFifa}º
              </span>
            )}
          </div>
          {selecao.tecnico && <p className="mt-4 text-sm font-medium text-zinc-500">Técnico: <span className="text-zinc-700 dark:text-zinc-300">{selecao.tecnico}</span></p>}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Elenco</h2>
        <div className="mt-4 space-y-6">
          {posicoes.map((pos) => {
            const jogadores = selecao.jogadores.filter((j) => j.posicao === pos);
            if (jogadores.length === 0) return null;
            return (
              <div key={pos}>
                <h3 className="mb-3 text-sm font-medium text-zinc-500">{pos}s</h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {jogadores.map((j) => (
                    <PlayerCard
                      key={j.id}
                      jogador={j}
                      corPrimaria={selecao.corPrimaria}
                      codigoPais={selecao.codigoPais}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Jogos</h2>
        <div className="mt-4 space-y-3">
          {[...selecao.partidasCasa, ...selecao.partidasFora]
            .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
            .map((p) => (
              <Link
                key={p.id}
                href={`/tabela/grupos`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] gap-3"
              >
                <div className="flex items-center gap-3 text-sm font-medium">
                  <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300">
                    {p.fase === "GRUPOS" ? "F. Grupos" : p.fase}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {p.mandante?.nome ?? "A definir"} <span className="text-zinc-400 mx-1">vs</span> {p.visitante?.nome ?? "A definir"}
                  </span>
                </div>
                <div className="text-sm">
                  {p.encerrada ? (
                    <span className="font-bold">
                      {p.golsMandante} x {p.golsVisitante}
                    </span>
                  ) : (
                    <span className="text-zinc-400">
                      {new Date(p.dataHora).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
