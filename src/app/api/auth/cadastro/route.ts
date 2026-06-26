import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSenha, gerarToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { nome, email, senha } = await request.json();

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { erro: "Nome, email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { erro: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 }
      );
    }

    const existente = await prisma.user.findUnique({ where: { email } });

    if (existente) {
      return NextResponse.json(
        { erro: "Email já cadastrado" },
        { status: 409 }
      );
    }

    const senhaHash = await hashSenha(senha);

    const user = await prisma.user.create({
      data: { nome, email, senha: senhaHash },
    });

    const token = gerarToken({ userId: user.id, email: user.email });

    return NextResponse.json(
      {
        token,
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role ?? "TORCEDOR" },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { erro: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
