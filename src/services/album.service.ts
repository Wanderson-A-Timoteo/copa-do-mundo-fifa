import { prisma } from "@/lib/prisma";

const LIMITE_DIARIO = 10;
const QTD_PACOTE = 7;

export interface AlbumResult {
  album: Awaited<ReturnType<typeof getAlbum>>["album"];
  pacotesRestantesHoje: number;
  limiteDiario: number;
}

export async function getAlbum(usuarioId: number) {
  const [album, usuario] = await Promise.all([
    prisma.albumFigurinha.findMany({
      where: { usuarioId },
      include: { figurinha: { include: { selecao: true, jogador: true } } },
    }),
    prisma.user.findUnique({
      where: { id: usuarioId },
      select: { ultimoDiaAbertura: true, pacotesAbertosHoje: true },
    }),
  ]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let pacotesRestantesHoje = LIMITE_DIARIO;
  if (usuario?.ultimoDiaAbertura && new Date(usuario.ultimoDiaAbertura) >= hoje) {
    pacotesRestantesHoje = Math.max(0, LIMITE_DIARIO - usuario.pacotesAbertosHoje);
  }

  return { album, pacotesRestantesHoje, limiteDiario: LIMITE_DIARIO };
}

export async function adicionarFigurinha(usuarioId: number, figurinhaId: number) {
  const existente = await prisma.albumFigurinha.findUnique({
    where: { usuarioId_figurinhaId: { usuarioId, figurinhaId } },
  });

  if (existente) {
    await prisma.albumFigurinha.update({
      where: { id: existente.id },
      data: { quantidade: existente.quantidade + 1 },
    });
  } else {
    await prisma.albumFigurinha.create({ data: { usuarioId, figurinhaId } });
  }
}

export async function removerFigurinha(
  usuarioId: number,
  figurinhaId: number,
  removerTudo = false,
) {
  if (removerTudo) {
    await prisma.albumFigurinha.deleteMany({ where: { usuarioId, figurinhaId } });
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
}

export async function abrirPacote(usuarioId: number) {
  const usuario = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!usuario) throw new Error("USER_NOT_FOUND");

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let pacotesHoje = usuario.pacotesAbertosHoje;
  if (!usuario.ultimoDiaAbertura || new Date(usuario.ultimoDiaAbertura) < hoje) {
    pacotesHoje = 0;
  }

  if (pacotesHoje >= LIMITE_DIARIO) {
    throw new Error("DAILY_LIMIT_REACHED");
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
      data: { ultimoDiaAbertura: new Date(), pacotesAbertosHoje: pacotesHoje + 1 },
    });

    return figurinhas;
  });

  return {
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
  };
}
