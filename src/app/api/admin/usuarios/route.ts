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

export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso restrito" }, { status: 403 });
  }

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, nome: true, email: true, role: true },
  });

  return NextResponse.json({ usuarios });
}
