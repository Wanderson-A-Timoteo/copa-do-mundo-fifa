import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarToken, getTokenFromRequest } from "@/lib/auth";

async function getUsuarioId(request: Request): Promise<number | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    return (await verificarToken(token)).userId;
  } catch {
    return null;
  }
}

const LIMITE_DIARIO = 10;
const QTD_PACOTE = 7;

export async function POST(request: Request) {
  const usuarioId = await getUsuarioId(request);
  if (!usuarioId) {
    return NextResponse.json({ erro: "Usuário não identificado" }, { status: 401 });
  }

  const usuario = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let pacotesHoje = usuario.pacotesAbertosHoje;
  if (!usuario.ultimoDiaAbertura || new Date(usuario.ultimoDiaAbertura) < hoje) {
    pacotesHoje = 0;
  }

  if (pacotesHoje >= LIMITE_DIARIO) {
    return NextResponse.json(
      {
        erro: "Limite diário de pacotes atingido",
        pacotesRestantesHoje: 0,
        limiteDiario: LIMITE_DIARIO,
      },
      { status: 429 },
    );
  }

  const pacote = await prisma.$transaction(async (tx) => {
    const randomFigs = await tx.$queryRawUnsafe<{ id: number }[]>(
      `SELECT id FROM figurinhas ORDER BY RANDOM() LIMIT $1`,
      QTD_PACOTE,
    );

    const ids = randomFigs.map((f) => f.id);

    const figurinhas = await tx.figurinha.findMany({
      where: { id: { in: ids } },
      include: { selecao: true, jogador: true },
    });

    for (const fig of figurinhas) {
      await tx.albumFigurinha.upsert({
        where: { usuarioId_figurinhaId: { usuarioId, figurinhaId: fig.id } },
        create: { usuarioId, figurinhaId: fig.id },
        update: { quantidade: { increment: 1 } },
      });
    }

    await tx.user.update({
      where: { id: usuarioId },
      data: {
        ultimoDiaAbertura: new Date(),
        pacotesAbertosHoje: pacotesHoje + 1,
      },
    });

    return figurinhas;
  });

  return NextResponse.json({
    figurinhas: pacote.map((f) => ({
      id: f.id,
      numero: f.numero,
      tipo: f.tipo,
      raridade: f.raridade,
      selecao: {
        id: f.selecao.id,
        nome: f.selecao.nome,
        codigoPais: f.selecao.codigoPais,
        corPrimaria: f.selecao.corPrimaria,
      },
      jogador: f.jogador ? { nome: f.jogador.nome, posicao: f.jogador.posicao } : null,
    })),
    pacotesRestantesHoje: LIMITE_DIARIO - pacotesHoje - 1,
    limiteDiario: LIMITE_DIARIO,
  });
}
