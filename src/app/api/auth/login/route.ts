import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compararSenha, gerarToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json(
        { erro: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { erro: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    if (!user.senha) {
      return NextResponse.json(
        { erro: "Esta conta usa login com Google. Faça login com Google." },
        { status: 401 }
      );
    }

    const senhaValida = await compararSenha(senha, user.senha);

    if (!senhaValida) {
      return NextResponse.json(
        { erro: "Email ou senha inválidos" },
        { status: 401 }
      );
    }

    const token = gerarToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role ?? "TORCEDOR" },
    });
  } catch {
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
