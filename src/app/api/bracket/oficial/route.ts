import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeBracket } from "@/lib/compute-bracket";
import { formatoCopa } from "@/data/formato-copa";

export async function GET() {
  const gruposDB = await prisma.grupo.findMany({
    include: {
      selecoes: {
        include: {
          partidasCasa: {
            where: { fase: "GRUPOS", encerrada: true },
          },
          partidasFora: {
            where: { fase: "GRUPOS", encerrada: true },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const gruposStandings = gruposDB.map((g: any) => {
    const selecoes = g.selecoes.map((s: any) => {
      let v = 0,
        e = 0,
        d = 0,
        gp = 0,
        gc = 0;

      for (const p of s.partidasCasa) {
        if (p.golsMandante !== null && p.golsVisitante !== null) {
          gp += p.golsMandante;
          gc += p.golsVisitante;
          if (p.golsMandante > p.golsVisitante) v++;
          else if (p.golsMandante === p.golsVisitante) e++;
          else d++;
        }
      }
      for (const p of s.partidasFora) {
        if (p.golsMandante !== null && p.golsVisitante !== null) {
          gp += p.golsVisitante;
          gc += p.golsMandante;
          if (p.golsVisitante > p.golsMandante) v++;
          else if (p.golsVisitante === p.golsMandante) e++;
          else d++;
        }
      }
      const sg = gp - gc;
      const pts = v * 3 + e;

      return {
        id: s.id,
        nome: s.nome,
        codigoPais: s.codigoPais,
        grupoId: s.grupoId,
        p: pts,
        j: v + e + d,
        v,
        e,
        d,
        gp,
        gc,
        sg,
      };
    });

    selecoes.sort((a: any, b: any) => {
      if (b.p !== a.p) return b.p - a.p;
      if (b.sg !== a.sg) return b.sg - a.sg;
      if (b.gp !== a.gp) return b.gp - a.gp;
      return a.nome.localeCompare(b.nome);
    });

    return {
      id: g.id,
      nome: g.nome,
      selecoes,
    };
  });

  const resultados = await prisma.resultadoOficial.findMany();
  const resultadosFormatados = resultados.map((r) => ({
    partidaId: r.partidaId,
    golsMandante: r.golsMandante,
    golsVisitante: r.golsVisitante,
    penaltisMandante: r.penaltisMandante,
    penaltisVisitante: r.penaltisVisitante,
  }));

  const bracket = computeBracket(formatoCopa, gruposStandings, resultadosFormatados);

  return NextResponse.json({ bracket });
}
