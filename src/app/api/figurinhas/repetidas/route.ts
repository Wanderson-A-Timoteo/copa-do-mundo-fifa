import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const repetidas = await prisma.albumFigurinha.findMany({
    where: { quantidade: { gte: 2 } },
    select: {
      quantidade: true,
      figurinhaId: true,
      usuarioId: true,
      figurinha: {
        select: {
          id: true,
          slug: true,
          numero: true,
          raridade: true,
          selecao: { select: { id: true, nome: true, codigoPais: true, corPrimaria: true } },
          jogador: {
            select: {
              nome: true,
              posicao: true,
              fotoUrl: true,
              numeroCamisa: true,
              dataNascimento: true,
              altura: true,
              peso: true,
              figurinha: { select: { raridade: true } },
            },
          },
        },
      },
      usuario: { select: { id: true, nome: true, slug: true } },
    },
    orderBy: { figurinha: { selecao: { nome: "asc" } } },
  });

  const agrupadas = new Map<
    number,
    {
      figurinha: (typeof repetidas)[0]["figurinha"];
      totalUsuarios: number;
      usuarios: { id: number; nome: string }[];
    }
  >();

  for (const item of repetidas) {
    const grupo = agrupadas.get(item.figurinhaId);
    if (grupo) {
      grupo.totalUsuarios++;
      grupo.usuarios.push(item.usuario);
    } else {
      agrupadas.set(item.figurinhaId, {
        figurinha: item.figurinha,
        totalUsuarios: 1,
        usuarios: [item.usuario],
      });
    }
  }

  return NextResponse.json({ repetidas: Array.from(agrupadas.values()) });
}
