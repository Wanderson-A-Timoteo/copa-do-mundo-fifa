import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const figurinhaId = parseInt(id, 10);

  if (isNaN(figurinhaId)) {
    return NextResponse.json({ erro: "ID inválido" }, { status: 400 });
  }

  const figurinha = await prisma.figurinha.findUnique({
    where: { id: figurinhaId },
    select: {
      id: true,
      numero: true,
      raridade: true,
      selecao: { select: { id: true, nome: true, codigoPais: true, corPrimaria: true } },
      jogador: {
        select: {
          nome: true, posicao: true, fotoUrl: true, numeroCamisa: true,
          dataNascimento: true, altura: true, peso: true,
          figurinha: { select: { raridade: true } },
        },
      },
    },
  });

  if (!figurinha) {
    return NextResponse.json({ erro: "Figurinha não encontrada" }, { status: 404 });
  }

  const itens = await prisma.albumFigurinha.findMany({
    where: { figurinhaId, quantidade: { gte: 2 } },
    select: {
      quantidade: true,
      usuario: { select: { id: true, nome: true, slug: true } },
    },
    orderBy: { usuario: { nome: "asc" } },
  });

  const usuarios = itens.map(item => ({
    ...item.usuario,
    quantidade: item.quantidade,
  }));

  return NextResponse.json({ figurinha, usuarios });
}
