import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compararSenha, gerarToken, setTokenCookie } from "@/lib/auth";
import { checkRateLimit, getRateLimitHeaders, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
  const rateHeaders = getRateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: rateHeaders },
    );
  }

  try {
    const { email, senha } = await request.json();

    if (!email || !senha) {
      return NextResponse.json({ erro: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ erro: "Email ou senha inválidos" }, { status: 401 });
    }

    if (!user.senha) {
      return NextResponse.json(
        { erro: "Esta conta usa login com Google. Faça login com Google." },
        { status: 401 },
      );
    }

    const senhaValida = await compararSenha(senha, user.senha);

    if (!senhaValida) {
      return NextResponse.json({ erro: "Email ou senha inválidos" }, { status: 401 });
    }

    const token = await gerarToken({ userId: user.id, email: user.email });

    const response = NextResponse.json(
      {
        token,
        user: { id: user.id, nome: user.nome, email: user.email, role: user.role ?? "TORCEDOR" },
      },
      { headers: rateHeaders },
    );

    response.headers.append("Set-Cookie", setTokenCookie(token));

    return response;
  } catch {
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
  }
}
