import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const grupoId = searchParams.get("grupo");

  const where = grupoId ? { grupoId: grupoId.toUpperCase() } : {};

  const selecoes = await prisma.selecao.findMany({
    where,
    include: { _count: { select: { jogadores: true } } },
    orderBy: [{ grupoId: "asc" }, { nome: "asc" }],
  });

  return NextResponse.json({ selecoes });
}
