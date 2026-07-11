import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { gerarToken } from "@/lib/auth";

function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    + "-" + Math.random().toString(36).substring(2, 6);
}

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json({ erro: "Credencial ausente" }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          nome: payload.name || payload.email.split("@")[0],
          email: payload.email,
          senha: null,
          slug: gerarSlug(payload.name || payload.email.split("@")[0]),
        },
      });
    }

    const token = gerarToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      token,
      user: { id: user.id, nome: user.nome, email: user.email, role: user.role ?? "TORCEDOR" },
    });
  } catch {
    return NextResponse.json(
      { erro: "Erro ao autenticar com Google" },
      { status: 500 }
    );
  }
}
