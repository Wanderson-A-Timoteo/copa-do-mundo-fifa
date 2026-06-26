import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";

export async function GET(request: Request) {
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

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ erro: "Acesso restrito" }, { status: 403 });
  }

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, nome: true, email: true, role: true },
  });

  return NextResponse.json({ usuarios });
}
