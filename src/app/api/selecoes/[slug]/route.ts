import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
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
    return NextResponse.json({ erro: "Seleção não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ selecao });
}
