import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const usuarioId = parseInt(id, 10);

  if (isNaN(usuarioId)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  const usuario = await prisma.user.findUnique({
    where: { id: usuarioId },
    select: { id: true, nome: true },
  });

  if (!usuario) {
    return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  }

  const repetidas = await prisma.albumFigurinha.findMany({
    where: { usuarioId, quantidade: { gte: 2 } },
    select: {
      quantidade: true,
      figurinhaId: true,
      figurinha: {
        select: {
          id: true,
          numero: true,
          raridade: true,
          selecao: { select: { id: true, nome: true, codigoPais: true, corPrimaria: true } },
          jogador: { select: { nome: true, posicao: true, fotoUrl: true, numeroCamisa: true, dataNascimento: true, altura: true, peso: true, figurinha: { select: { raridade: true } } } },
        },
      },
    },
    orderBy: { figurinha: { selecao: { nome: "asc" } } },
  });

  return NextResponse.json({ usuario, repetidas });
}
