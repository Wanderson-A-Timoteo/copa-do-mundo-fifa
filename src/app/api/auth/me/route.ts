import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ erro: "Token não fornecido" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verificarToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, nome: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }
}
