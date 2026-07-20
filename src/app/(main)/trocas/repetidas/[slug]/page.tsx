import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StickerCard from "@/components/StickerCard";
import TradeLink from "@/components/TradeLink";
import { IconUser, IconArrowLeft, IconRepeat } from "@/components/Icons";

export default async function RepetidasDetalhePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const idNum = parseInt(slug, 10);
  const figurinhaBase = isNaN(idNum)
    ? await prisma.figurinha.findUnique({ where: { slug } })
    : ((await prisma.figurinha.findUnique({ where: { slug } })) ??
      (await prisma.figurinha.findUnique({ where: { id: idNum } })));

  if (!figurinhaBase) {
    return (
      <main className="mx-auto max-w-lg px-6 py-8 text-center text-zinc-400">
        <IconRepeat className="mx-auto h-12 w-12" />
        <p className="mt-4 text-lg">Figurinha não encontrada</p>
      </main>
    );
  }

  const figurinha = await prisma.figurinha.findUnique({
    where: { id: figurinhaBase.id },
    select: {
      id: true,
      numero: true,
      slug: true,
      raridade: true,
      selecao: { select: { id: true, nome: true, codigoPais: true, corPrimaria: true } },
      jogador: {
        select: {
          nome: true,
          posicao: true,
          fotoUrl: true,
          numeroCamisa: true,
          dataNascimento: true,
          altura: true,
          peso: true,
          figurinha: { select: { raridade: true } },
        },
      },
    },
  });

  const itens = await prisma.albumFigurinha.findMany({
    where: { figurinhaId: figurinhaBase.id, quantidade: { gte: 2 } },
    select: {
      quantidade: true,
      usuario: { select: { id: true, nome: true, slug: true } },
    },
    orderBy: { usuario: { nome: "asc" } },
  });

  const usuarios = itens.map((item) => ({
    ...item.usuario,
    quantidade: item.quantidade,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/trocas"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <IconArrowLeft className="h-4 w-4" />
        Voltar para trocas
      </Link>

      <div className="mb-8 flex flex-col items-center">
        <h1 className="mb-6 text-2xl font-bold">Figurinhas disponíveis</h1>
        <div className="w-full max-w-[220px]">
          <StickerCard
            figurinha={{
              ...figurinha!,
              jogador: figurinha!.jogador
                ? {
                    ...figurinha!.jogador,
                    dataNascimento: figurinha!.jogador.dataNascimento?.toISOString() ?? null,
                  }
                : null,
            }}
          />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {usuarios.length} {usuarios.length === 1 ? "usuário tem" : "usuários têm"} esta figurinha
          repetida
        </h2>

        {usuarios.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 p-8 text-center text-zinc-400 dark:border-zinc-800">
            <IconUser className="mx-auto h-8 w-8" />
            <p className="mt-2 text-sm">Nenhum usuário disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {usuarios.map((usr) => (
              <div
                key={usr.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold dark:bg-zinc-700">
                    {usr.nome.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold">{usr.nome}</p>
                    <p className="text-xs text-zinc-400">
                      {usr.quantidade} disponíve{usr.quantidade !== 1 ? "is" : "l"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <TradeLink userId={usr.id} userSlug={usr.slug} figurinhaSlug={figurinha!.slug} />
                  <Link
                    href={`/perfil/${usr.slug || usr.id}`}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
