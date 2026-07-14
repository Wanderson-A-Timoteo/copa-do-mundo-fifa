import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fase = searchParams.get("fase");
  const grupoId = searchParams.get("grupo");

  const where: Record<string, unknown> = {};
  if (fase) where.fase = fase.toUpperCase();
  if (grupoId) where.grupoId = grupoId.toUpperCase();

  const partidas = await prisma.partida.findMany({
    where,
    include: {
      mandante: true,
      visitante: true,
      estadio: true,
      grupo: true,
    },
    orderBy: [{ dataHora: "asc" }, { id: "asc" }],
  });

  return NextResponse.json({ partidas });
}
