import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUsuarioId(request: Request): number | null {
  const header = request.headers.get("x-usuario-id");
  return header ? Number(header) : null;
}

export async function GET(request: Request) {
  const usuarioId = getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const album = await prisma.albumFigurinha.findMany({
    where: { usuarioId },
    include: {
      figurinha: {
        include: { selecao: true, jogador: true },
      },
    },
  });

  return NextResponse.json({ album });
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
