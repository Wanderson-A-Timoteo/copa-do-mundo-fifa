import { prisma } from "@/lib/prisma";
import { figurinhaInclude } from "@/lib/prisma-selects";

export interface CriarTrocaInput {
  figurinhasOferecidasIds: number[];
  figurinhaDesejadaId: number;
  destinatarioId: number;
}

export async function listarTrocas(usuarioId: number, tipo = "recebidas") {
  const where = tipo === "enviadas" ? { remetenteId: usuarioId } : { destinatarioId: usuarioId };

  return prisma.troca.findMany({
    where,
    include: {
      remetente: { select: { id: true, nome: true, slug: true } },
      destinatario: { select: { id: true, nome: true, slug: true } },
      figurinhaDesejada: { include: figurinhaInclude },
      figurinhasOferecidas: { include: { figurinha: { include: figurinhaInclude } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function criarTroca(usuarioId: number, input: CriarTrocaInput) {
  const { figurinhasOferecidasIds, figurinhaDesejadaId, destinatarioId } = input;

  if (!figurinhasOferecidasIds?.length || !figurinhaDesejadaId || !destinatarioId) {
    throw new Error("MISSING_FIELDS");
  }

  if (destinatarioId === usuarioId) {
    throw new Error("SELF_TRADE");
  }

  const [itensAlbum, desejadaAlbum, destinatario] = await Promise.all([
    prisma.albumFigurinha.findMany({
      where: { usuarioId, figurinhaId: { in: figurinhasOferecidasIds } },
    }),
    prisma.albumFigurinha.findUnique({
      where: { usuarioId_figurinhaId: { usuarioId, figurinhaId: figurinhaDesejadaId } },
    }),
    prisma.user.findUnique({ where: { id: destinatarioId } }),
  ]);

  for (const id of figurinhasOferecidasIds) {
    const item = itensAlbum.find((i) => i.figurinhaId === id);
    if (!item || item.quantidade < 2) {
      throw new Error(`NO_DUPLICATE_${id}`);
    }
  }

  if (desejadaAlbum) {
    throw new Error("ALREADY_HAVE_DESIRED");
  }

  if (!destinatario) {
    throw new Error("RECIPIENT_NOT_FOUND");
  }

  return prisma.troca.create({
    data: {
      remetenteId: usuarioId,
      destinatarioId,
      figurinhaDesejadaId,
      figurinhasOferecidas: {
        create: figurinhasOferecidasIds.map((id) => ({ figurinhaId: id })),
      },
    },
    include: {
      remetente: { select: { id: true, nome: true } },
      destinatario: { select: { id: true, nome: true } },
      figurinhaDesejada: { include: figurinhaInclude },
      figurinhasOferecidas: { include: { figurinha: { include: figurinhaInclude } } },
    },
  });
}

export async function responderTroca(
  usuarioId: number,
  trocaId: number,
  acao: "aceitar" | "recusar",
) {
  const troca = await prisma.troca.findUnique({
    where: { id: trocaId },
    include: { figurinhasOferecidas: true },
  });

  if (!troca) throw new Error("TRADE_NOT_FOUND");
  if (troca.destinatarioId !== usuarioId) throw new Error("NOT_RECIPIENT");
  if (troca.status !== "pendente") throw new Error("TRADE_NOT_PENDING");

  if (acao === "recusar") {
    await prisma.troca.update({ where: { id: trocaId }, data: { status: "recusada" } });
    return;
  }

  const oferecidasIds = troca.figurinhasOferecidas.map((o) => o.figurinhaId);

  const [oferecidasRemetente, desejadaDestinatario] = await Promise.all([
    prisma.albumFigurinha.findMany({
      where: { usuarioId: troca.remetenteId, figurinhaId: { in: oferecidasIds } },
    }),
    prisma.albumFigurinha.findUnique({
      where: {
        usuarioId_figurinhaId: {
          usuarioId: troca.destinatarioId,
          figurinhaId: troca.figurinhaDesejadaId,
        },
      },
    }),
  ]);

  for (const id of oferecidasIds) {
    const item = oferecidasRemetente.find((i) => i.figurinhaId === id);
    if (!item || item.quantidade < 2) {
      await prisma.troca.update({ where: { id: trocaId }, data: { status: "recusada" } });
      throw new Error("SENDER_NO_DUPLICATES");
    }
  }

  if (!desejadaDestinatario || desejadaDestinatario.quantidade < 1) {
    await prisma.troca.update({ where: { id: trocaId }, data: { status: "recusada" } });
    throw new Error("RECIPIENT_NO_DESIRED");
  }

  const operacoes: Parameters<typeof prisma.$transaction>[0] = [
    prisma.troca.update({ where: { id: trocaId }, data: { status: "aceita" } }),
  ];

  for (const id of oferecidasIds) {
    operacoes.push(
      prisma.albumFigurinha.update({
        where: { usuarioId_figurinhaId: { usuarioId: troca.remetenteId, figurinhaId: id } },
        data: { quantidade: { decrement: 1 } },
      }),
      prisma.albumFigurinha.upsert({
        where: { usuarioId_figurinhaId: { usuarioId: troca.destinatarioId, figurinhaId: id } },
        create: { usuarioId: troca.destinatarioId, figurinhaId: id, quantidade: 1 },
        update: { quantidade: { increment: 1 } },
      }),
    );
  }

  operacoes.push(
    prisma.albumFigurinha.update({
      where: {
        usuarioId_figurinhaId: {
          usuarioId: troca.destinatarioId,
          figurinhaId: troca.figurinhaDesejadaId,
        },
      },
      data: { quantidade: { decrement: 1 } },
    }),
    prisma.albumFigurinha.upsert({
      where: {
        usuarioId_figurinhaId: {
          usuarioId: troca.remetenteId,
          figurinhaId: troca.figurinhaDesejadaId,
        },
      },
      create: {
        usuarioId: troca.remetenteId,
        figurinhaId: troca.figurinhaDesejadaId,
        quantidade: 1,
      },
      update: { quantidade: { increment: 1 } },
    }),
  );

  await prisma.$transaction(operacoes);
}
