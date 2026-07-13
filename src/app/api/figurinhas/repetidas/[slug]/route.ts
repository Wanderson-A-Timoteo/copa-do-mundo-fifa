import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const idNum = parseInt(slug, 10);
  const figurinha = isNaN(idNum)
    ? await prisma.figurinha.findUnique({ where: { slug } })
    : ((await prisma.figurinha.findUnique({ where: { slug } })) ??
      (await prisma.figurinha.findUnique({ where: { id: idNum } })));

  if (!figurinha) {
    return NextResponse.json({ erro: "Figurinha não encontrada" }, { status: 404 });
  }

  const detalhe = await prisma.figurinha.findUnique({
    where: { id: figurinha.id },
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
    where: { figurinhaId: figurinha.id, quantidade: { gte: 2 } },
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

  return NextResponse.json({ figurinha: detalhe, usuarios });
}
