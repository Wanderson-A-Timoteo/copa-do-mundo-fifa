import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    const selecoes = grupo.selecoes
      .map((s: any) => ({
        ...s,
        ...pontos[s.id],
      }))
      .sort((a: any, b: any) => b.p - a.p || b.sg - a.sg || b.gp - a.gp);

    return { id: grupo.id, nome: grupo.nome, selecoes };
  });

  return NextResponse.json({ grupos: classificacao });
}
