import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const estadios = await prisma.estadio.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, slug: true, nome: true, cidade: true, pais: true, capacidade: true, fotoUrl: true },
  });

  return NextResponse.json({ estadios });
}
