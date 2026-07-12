import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken, getTokenFromRequest } from "@/lib/auth";

function getUsuarioId(request: Request): number | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    return verificarToken(token).userId;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!admin || admin.role !== "ADMIN") {
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
