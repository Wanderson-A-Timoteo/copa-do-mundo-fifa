import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  
  try {
    await requireAdmin(request);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
    }
    return NextResponse.json({ erro: "Acesso restrito" }, { status: 403 });
  }

  const { usuarioId: targetUserId } = await request.json();
  if (!targetUserId) {
    return NextResponse.json({ erro: "usuarioId é obrigatório" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: "ADMIN" },
  });

  return NextResponse.json({ ok: true });
}
