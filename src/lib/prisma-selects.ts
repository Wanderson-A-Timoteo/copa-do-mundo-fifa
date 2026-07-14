import type { Prisma } from "@/generated/prisma/client";

export const figurinhaInclude = {
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
} satisfies Prisma.FigurinhaInclude;
