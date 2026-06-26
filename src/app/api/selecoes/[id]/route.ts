import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const selecao = await prisma.selecao.findUnique({
    where: { id: Number(id) },
    include: {
      grupo: true,
      jogadores: { orderBy: { posicao: "asc" } },
      partidasCasa: { include: { estadio: true, visitante: true } },
      partidasFora: { include: { estadio: true, mandante: true } },
    },
  });

  if (!selecao) {
    return NextResponse.json({ erro: "Seleção não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ selecao });
}
