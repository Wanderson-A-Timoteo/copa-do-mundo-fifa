import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get("usuarioId");

  if (usuarioId) {
    const grupos = await prisma.grupo.findMany({
      include: { selecoes: true },
      orderBy: { id: "asc" },
    });

    const palpites = await prisma.palpite.findMany({
      where: { usuarioId: Number(usuarioId) },
    });

    const palpitesPorPartida = new Map<number, { golsMandante: number; golsVisitante: number }>();
    for (const p of palpites) {
      palpitesPorPartida.set(p.partidaId, { golsMandante: p.golsMandante, golsVisitante: p.golsVisitante });
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

    const classificacao = grupos.map((grupo) => {
      const pontos: Record<number, { p: number; j: number; v: number; e: number; d: number; gp: number; gc: number; sg: number }> = {};

      for (const sel of grupo.selecoes) {
        pontos[sel.id] = { p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 };
      }

      const partidas = partidasPorGrupo[grupo.id] || [];
      for (const partida of partidas) {
        const placar = palpitesPorPartida.get(partida.id);
        if (!placar) continue;

        const m = pontos[partida.selecaoMandanteId];
        const v = pontos[partida.selecaoVisitanteId];
        if (!m || !v) continue;

        m.j++; v.j++;
        m.gp += placar.golsMandante; m.gc += placar.golsVisitante;
        v.gp += placar.golsVisitante; v.gc += placar.golsMandante;

        if (placar.golsMandante > placar.golsVisitante) { m.p += 3; m.v++; v.d++; }
        else if (placar.golsMandante < placar.golsVisitante) { v.p += 3; v.v++; m.d++; }
        else { m.p += 1; v.p += 1; m.e++; v.e++; }
      }

      for (const sel of grupo.selecoes) {
        pontos[sel.id].sg = pontos[sel.id].gp - pontos[sel.id].gc;
      }

      const selecoes = grupo.selecoes
        .map((s) => ({ ...s, ...pontos[s.id] }))
        .sort((a, b) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);

      return { id: grupo.id, nome: grupo.nome, selecoes };
    });

    return NextResponse.json({ grupos: classificacao });
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
          encerrada: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const classificacao = grupos.map((grupo: any) => {
    const pontos: Record<number, { p: number; j: number; v: number; e: number; d: number; gp: number; gc: number; sg: number }> = {};

    for (const sel of grupo.selecoes) {
      pontos[sel.id] = { p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 };
    }

    for (const partida of grupo.partidas) {
      const m = pontos[partida.selecaoMandanteId];
      const v = pontos[partida.selecaoVisitanteId];
      if (!m || !v || partida.golsMandante === null || partida.golsVisitante === null) continue;

      m.j++; v.j++;
      m.gp += partida.golsMandante; m.gc += partida.golsVisitante;
      v.gp += partida.golsVisitante; v.gc += partida.golsMandante;

      if (partida.golsMandante > partida.golsVisitante) { m.p += 3; m.v++; v.d++; }
      else if (partida.golsMandante < partida.golsVisitante) { v.p += 3; v.v++; m.d++; }
      else { m.p += 1; v.p += 1; m.e++; v.e++; }
    }

    for (const sel of grupo.selecoes) {
      pontos[sel.id].sg = pontos[sel.id].gp - pontos[sel.id].gc;
    }

    const selecoes = grupo.selecoes
      .map((s: any) => ({ ...s, ...pontos[s.id] }))
      .sort((a: any, b: any) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);

    return { id: grupo.id, nome: grupo.nome, selecoes };
  });

  return NextResponse.json({ grupos: classificacao });
}
