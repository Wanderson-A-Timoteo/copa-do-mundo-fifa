import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken, getTokenFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ erro: "Token não fornecido" }, { status: 401 });
    }

    const payload = await verificarToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, nome: true, slug: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }
}
