import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const estadios = await prisma.estadio.findMany({
    orderBy: { nome: "asc" },
  });

  return NextResponse.json({ estadios });
}
