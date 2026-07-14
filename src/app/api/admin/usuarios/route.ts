import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  
  try {
    await requireAdmin(request);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ erro: "Acesso restrito" }, { status: 403 });
  }

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, nome: true, email: true, role: true },
  });

  return NextResponse.json({ usuarios });
}
