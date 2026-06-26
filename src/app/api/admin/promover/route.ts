import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let payload;
  try {
    payload = verificarToken(auth.slice(7));
  } catch {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso restrito" }, { status: 403 });
  }

  const { usuarioId } = await request.json();
  if (!usuarioId) {
    return NextResponse.json({ erro: "usuarioId é obrigatório" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: usuarioId },
    data: { role: "ADMIN" },
  });

  return NextResponse.json({ ok: true });
}
