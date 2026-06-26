import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const selecaoId = searchParams.get("selecaoId");

  const where = selecaoId ? { selecaoId: Number(selecaoId) } : {};

  const figurinhas = await prisma.figurinha.findMany({
    where,
    include: {
      selecao: true,
      jogador: true,
    },
    orderBy: { numero: "asc" },
  });

  return NextResponse.json({ figurinhas });
}
