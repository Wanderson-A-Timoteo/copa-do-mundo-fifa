import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashSenha, gerarToken, setTokenCookie } from "@/lib/auth";
import { checkRateLimit, getRateLimitHeaders, getClientIp } from "@/lib/rate-limit";

function gerarSlug(texto: string): string {
  return (
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 6)
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`cadastro:${ip}`, 5, 60 * 60 * 1000);
  const rateHeaders = getRateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { erro: "Muitas tentativas de cadastro. Tente novamente mais tarde." },
      { status: 429, headers: rateHeaders },
    );
  }

  try {
    const { nome, email, senha } = await request.json();

    if (!nome || !email || !senha) {
      return NextResponse.json({ erro: "Nome, email e senha são obrigatórios" }, { status: 400 });
    }

    if (senha.length < 6) {
      return NextResponse.json({ erro: "Senha deve ter no mínimo 6 caracteres" }, { status: 400 });
    }

    const existente = await prisma.user.findUnique({ where: { email } });

    if (existente) {
      return NextResponse.json({ erro: "Email já cadastrado" }, { status: 409 });
    }

    const senhaHash = await hashSenha(senha);

    const user = await prisma.user.create({
      data: { nome, email, senha: senhaHash, slug: gerarSlug(nome) },
    });

    const token = await gerarToken({ userId: user.id, email: user.email });

    const response = NextResponse.json(
      {
        token,
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role ?? "TORCEDOR" },
      },
      { status: 201, headers: rateHeaders },
    );

    response.headers.append("Set-Cookie", setTokenCookie(token));

    return response;
  } catch {
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
  }
}
