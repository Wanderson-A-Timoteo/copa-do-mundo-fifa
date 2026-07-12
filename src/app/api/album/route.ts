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

const LIMITE_DIARIO = 10;

export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const [album, usuario] = await Promise.all([
    prisma.albumFigurinha.findMany({
      where: { usuarioId },
      include: {
        figurinha: {
          include: { selecao: true, jogador: true },
        },
      },
    }),
    prisma.user.findUnique({ where: { id: usuarioId }, select: { ultimoDiaAbertura: true, pacotesAbertosHoje: true } }),
  ]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let pacotesRestantesHoje = LIMITE_DIARIO;
  if (usuario?.ultimoDiaAbertura && new Date(usuario.ultimoDiaAbertura) >= hoje) {
    pacotesRestantesHoje = Math.max(0, LIMITE_DIARIO - usuario.pacotesAbertosHoje);
  }

  return NextResponse.json({ album, pacotesRestantesHoje, limiteDiario: LIMITE_DIARIO });
}

export async function POST(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const { figurinhaId } = await request.json();

  const existente = await prisma.albumFigurinha.findUnique({
    where: { usuarioId_figurinhaId: { usuarioId, figurinhaId } },
  });

  if (existente) {
    await prisma.albumFigurinha.update({
      where: { id: existente.id },
      data: { quantidade: existente.quantidade + 1 },
    });
  } else {
    await prisma.albumFigurinha.create({
      data: { usuarioId, figurinhaId },
    });
  }

  return NextResponse.json({ sucesso: true });
}

export async function DELETE(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const { figurinhaId, removerTudo } = await request.json();

  if (removerTudo) {
    await prisma.albumFigurinha.deleteMany({
      where: { usuarioId, figurinhaId },
    });
  } else {
    const existente = await prisma.albumFigurinha.findUnique({
      where: { usuarioId_figurinhaId: { usuarioId, figurinhaId } },
    });
    if (existente) {
      if (existente.quantidade <= 1) {
        await prisma.albumFigurinha.delete({ where: { id: existente.id } });
      } else {
        await prisma.albumFigurinha.update({
          where: { id: existente.id },
          data: { quantidade: existente.quantidade - 1 },
        });
      }
    }
  }

  return NextResponse.json({ sucesso: true });
}
