import { prisma } from "@/lib/prisma";


interface MatchScore {
  golsMandante: number;
  golsVisitante: number;
}

export async function listarPalpites(usuarioId: number, partidaId?: number) {
  const where: Record<string, unknown> = { usuarioId };
  if (partidaId) where.partidaId = partidaId;

  return prisma.palpite.findMany({
    where,
    include: {
      partida: { include: { mandante: true, visitante: true, estadio: true, grupo: true } },
    },
  });
}

export async function listarPalpitesMataMata(usuarioId: number, partidaId?: number) {
  const where: Record<string, unknown> = { usuarioId };
  if (partidaId) where.partidaId = partidaId;

  return prisma.palpiteMataMata.findMany({ where });
}

export async function salvarPalpite(
  usuarioId: number,
  partidaId: number,
  golsMandante: number | null,
  golsVisitante: number | null,
) {
  const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
  if (!partida) throw new Error("MATCH_NOT_FOUND");

  if (new Date() >= partida.dataHora) {
    throw new Error("O jogo já começou! Palpites encerrados.");
  }

  if (golsMandante === null && golsVisitante === null) {
    await prisma.palpite.deleteMany({ where: { usuarioId, partidaId } });
    return { limpo: true };
  }

  if (typeof golsMandante !== "number" || typeof golsVisitante !== "number") {
    throw new Error("INVALID_GOALS");
  }

  return prisma.palpite.upsert({
    where: { usuarioId_partidaId: { usuarioId, partidaId } },
    create: { usuarioId, partidaId, golsMandante, golsVisitante },
    update: { golsMandante, golsVisitante },
  });
}

export async function salvarPalpiteMataMata(
  usuarioId: number,
  partidaId: number,
  golsMandante: number | null,
  golsVisitante: number | null,
  penaltisMandante?: number,
  penaltisVisitante?: number,
) {
  const partida = await prisma.partida.findUnique({ where: { id: partidaId } });
  if (!partida) throw new Error("MATCH_NOT_FOUND");

  if (new Date() >= partida.dataHora) {
    throw new Error("O jogo já começou! Palpites encerrados.");
  }

  if (golsMandante === null && golsVisitante === null) {
    await prisma.palpiteMataMata.deleteMany({ where: { usuarioId, partidaId } });
    return { limpo: true };
  }

  if (typeof golsMandante !== "number" || typeof golsVisitante !== "number") {
    throw new Error("INVALID_GOALS");
  }

  const data: Record<string, unknown> = { golsMandante, golsVisitante };
  if (penaltisMandante !== undefined) data.penaltisMandante = penaltisMandante;
  if (penaltisVisitante !== undefined) data.penaltisVisitante = penaltisVisitante;

  return prisma.palpiteMataMata.upsert({
    where: { usuarioId_partidaId: { usuarioId, partidaId } },
    create: { usuarioId, partidaId, ...data } as never,
    update: data,
  });
}

export async function salvarResultadoOficial(
  partidaId: number,
  golsMandante: number | null,
  golsVisitante: number | null,
  penaltisMandante?: number,
  penaltisVisitante?: number,
) {
  if (golsMandante === null && golsVisitante === null) {
    await prisma.resultadoOficial.deleteMany({ where: { partidaId } });
    return { limpo: true };
  }

  if (typeof golsMandante !== "number" || typeof golsVisitante !== "number") {
    throw new Error("INVALID_GOALS");
  }

  const data: Record<string, unknown> = { golsMandante, golsVisitante };
  if (penaltisMandante !== undefined) data.penaltisMandante = penaltisMandante;
  if (penaltisVisitante !== undefined) data.penaltisVisitante = penaltisVisitante;

  return prisma.resultadoOficial.upsert({
    where: { partidaId },
    create: { partidaId, ...data } as never,
    update: data,
  });
}

interface MatchRow {
  selecaoMandanteId: number;
  selecaoVisitanteId: number;
  golsMandante: number | null;
  golsVisitante: number | null;
}

interface SelecaoGrupo {
  id: number;
  nome: string;
}

function calcularClassificacaoGrupos(selecoes: SelecaoGrupo[], partidas: MatchRow[]) {
  const pontos: Record<
    number,
    { p: number; j: number; v: number; e: number; d: number; gp: number; gc: number; sg: number }
  > = {};

  for (const sel of selecoes) {
    pontos[sel.id] = { p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 };
  }

  for (const partida of partidas) {
    const m = pontos[partida.selecaoMandanteId];
    const v = pontos[partida.selecaoVisitanteId];
    if (!m || !v || partida.golsMandante === null || partida.golsVisitante === null) continue;

    m.j++;
    v.j++;
    m.gp += partida.golsMandante;
    m.gc += partida.golsVisitante;
    v.gp += partida.golsVisitante;
    v.gc += partida.golsMandante;

    if (partida.golsMandante > partida.golsVisitante) {
      m.p += 3;
      m.v++;
      v.d++;
    } else if (partida.golsMandante < partida.golsVisitante) {
      v.p += 3;
      v.v++;
      m.d++;
    } else {
      m.p += 1;
      v.p += 1;
      m.e++;
      v.e++;
    }
  }

  for (const sel of selecoes) {
    pontos[sel.id].sg = pontos[sel.id].gp - pontos[sel.id].gc;
  }

  return selecoes
    .map((s) => ({ ...s, ...pontos[s.id] }))
    .sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);
}

export async function calcularClassificacao(usuarioId?: number) {
  if (usuarioId) {
    const grupos = await prisma.grupo.findMany({
      include: { selecoes: true },
      orderBy: { id: "asc" },
    });

    const palpites = await prisma.palpite.findMany({ where: { usuarioId } });
    const palpitesPorPartida = new Map<number, MatchScore>();
    for (const p of palpites) {
      palpitesPorPartida.set(p.partidaId, {
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
        ...(palpitesPorPartida.get(p.id) ?? { golsMandante: null, golsVisitante: null }),
      }));

      return {
        id: grupo.id,
        nome: grupo.nome,
        selecoes: calcularClassificacaoGrupos(grupo.selecoes, partidasComPalpites),
      };
    });
  }

  const grupos = await prisma.grupo.findMany({
    include: {
      selecoes: true,
      partidas: {
        where: { encerrada: true },
        select: {
          selecaoMandanteId: true,
          selecaoVisitanteId: true,
          golsMandante: true,
          golsVisitante: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return grupos.map((grupo) => ({
    id: grupo.id,
    nome: grupo.nome,
    selecoes: calcularClassificacaoGrupos(grupo.selecoes, grupo.partidas),
  }));
}
