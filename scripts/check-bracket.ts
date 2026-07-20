import { prisma } from "../prisma/lib";
import { computeBracket } from "../src/lib/compute-bracket";
import { formatoCopa } from "../src/data/formato-copa";
import { calcularClassificacao } from "../src/services/palpite.service";

async function main() {
  const grupos = await calcularClassificacao();
  const resultados = await prisma.resultadoOficial.findMany();
  const palpites = resultados.map(r => ({
    partidaId: r.partidaId,
    golsMandante: r.golsMandante,
    golsVisitante: r.golsVisitante,
    penaltisMandante: r.penaltisMandante,
    penaltisVisitante: r.penaltisVisitante
  }));

  const bracket = computeBracket(formatoCopa, grupos as any, palpites);

  const groupF = grupos.find(g => g.nome === "Grupo F");
  console.log("=== Grupo F Standings ===");
  if (groupF) {
    for (const s of groupF.selecoes) {
      console.log(`${s.nome} - Pts: ${s.p}, SG: ${s.sg}, GP: ${s.gp}`);
    }
  }

  const matches = await prisma.partida.findMany({
    where: { grupo: { nome: "Grupo F" } },
    include: { mandante: true, visitante: true }
  });
  console.log("=== Grupo F Matches ===");
  matches.forEach(m => {
    console.log(`${m.mandante?.nome} ${m.golsMandante} x ${m.golsVisitante} ${m.visitante?.nome} (Encerrada: ${m.encerrada})`);
  });

  
  for (const f of bracket.fases) {
    console.log(`\n=== ${f.label} ===`);
    for (const p of f.partidas) {
      const mand = p.mandante?.nome ?? "TBD";
      const vis = p.visitante?.nome ?? "TBD";
      console.log(`[Partida ${p.numero}] ${mand} x ${vis}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
