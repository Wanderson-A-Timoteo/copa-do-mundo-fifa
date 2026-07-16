import { prisma } from "@/lib/prisma";
import { calcularClassificacaoGrupos, type MatchScore } from "./palpite.service";

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

  const data: Record<string, number | null> = { golsMandante, golsVisitante };
  if (penaltisMandante !== undefined) data.penaltisMandante = penaltisMandante;
  if (penaltisVisitante !== undefined) data.penaltisVisitante = penaltisVisitante;

  return prisma.simulacaoMataMata.upsert({
    where: { usuarioId_partidaId: { usuarioId, partidaId } },
    create: { usuarioId, partidaId, ...data },
    update: data,
  });
}

export async function calcularClassificacaoSimulacao(usuarioId: number) {
  const grupos = await prisma.grupo.findMany({
    include: { selecoes: true },
    orderBy: { id: "asc" },
  });

  const simulacoes = await prisma.simulacao.findMany({ where: { usuarioId } });
  const simulacoesPorPartida = new Map<number, MatchScore>();
  for (const p of simulacoes) {
    simulacoesPorPartida.set(p.partidaId, {
      golsMandante: p.golsMandante,
      golsVisitante: p.golsVisitante,
    });
  }

  const todasPartidas = await prisma.partida.findMany({
    where: { fase: "GRUPOS" },
    select: { id: true, grupoId: true, selecaoMandanteId: true, selecaoVisitanteId: true },
  });

  const partidasPorGrupo: Record<string, typeof todasPartidas> = {};
  for (const p of todasPartidas) {
    if (!partidasPorGrupo[p.grupoId!]) partidasPorGrupo[p.grupoId!] = [];
    partidasPorGrupo[p.grupoId!].push(p);
  }

  return grupos.map((grupo) => {
    const partidasComPalpites = (partidasPorGrupo[grupo.id] || []).map((p) => ({
      selecaoMandanteId: p.selecaoMandanteId,
      selecaoVisitanteId: p.selecaoVisitanteId,
      ...(simulacoesPorPartida.get(p.id) ?? { golsMandante: null, golsVisitante: null }),
    }));

    return {
      id: grupo.id,
      nome: grupo.nome,
      selecoes: calcularClassificacaoGrupos(grupo.selecoes, partidasComPalpites),
    };
  });
}
