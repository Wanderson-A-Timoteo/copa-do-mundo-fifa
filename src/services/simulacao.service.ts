import { prisma } from "@/lib/prisma";

export async function getSimulacoes(usuarioId: number, partidaId?: number) {
  const where: Record<string, unknown> = { usuarioId };
  if (partidaId) where.partidaId = partidaId;

  return prisma.simulacao.findMany({
    where,
    include: {
      partida: { include: { mandante: true, visitante: true, estadio: true, grupo: true } },
    },
  });
}

export async function getSimulacoesMataMata(usuarioId: number, partidaId?: number) {
  const where: Record<string, unknown> = { usuarioId };
  if (partidaId) where.partidaId = partidaId;

  return prisma.simulacaoMataMata.findMany({ where });
}

export async function salvarSimulacao(
  usuarioId: number,
  partidaId: number,
  golsMandante: number | null,
  golsVisitante: number | null,
) {
  const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
  if (!partida) throw new Error("MATCH_NOT_FOUND");

  if (golsMandante === null && golsVisitante === null) {
    await prisma.simulacao.deleteMany({ where: { usuarioId, partidaId } });
    return { limpo: true };
  }

  if (typeof golsMandante !== "number" || typeof golsVisitante !== "number") {
    throw new Error("INVALID_GOALS");
  }

  return prisma.simulacao.upsert({
    where: { usuarioId_partidaId: { usuarioId, partidaId } },
    create: { usuarioId, partidaId, golsMandante, golsVisitante },
    update: { golsMandante, golsVisitante },
  });
}

export async function salvarSimulacaoMataMata(
  usuarioId: number,
  partidaId: number,
  golsMandante: number | null,
  golsVisitante: number | null,
  penaltisMandante?: number,
  penaltisVisitante?: number,
) {
  const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
  if (!partida) throw new Error("MATCH_NOT_FOUND");

  if (golsMandante === null && golsVisitante === null) {
    await prisma.simulacaoMataMata.deleteMany({ where: { usuarioId, partidaId } });
    return { limpo: true };
  }

  if (typeof golsMandante !== "number" || typeof golsVisitante !== "number") {
    throw new Error("INVALID_GOALS");
  }

  const data: any = { golsMandante, golsVisitante };
  if (penaltisMandante !== undefined) data.penaltisMandante = penaltisMandante;
  if (penaltisVisitante !== undefined) data.penaltisVisitante = penaltisVisitante;

  return prisma.simulacaoMataMata.upsert({
    where: { usuarioId_partidaId: { usuarioId, partidaId } },
    create: { usuarioId, partidaId, ...data },
    update: data,
  });
}
