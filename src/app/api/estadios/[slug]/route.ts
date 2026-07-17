import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // Force reload

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const estadio = await prisma.estadio.findUnique({
    where: { slug },
    include: {
      partidas: {
        include: {
          mandante: { select: { id: true, nome: true, codigoPais: true } },
          visitante: { select: { id: true, nome: true, codigoPais: true } },
        },
        orderBy: [{ dataHora: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!estadio) {
    return NextResponse.json({ erro: "Estádio não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ estadio });
}
