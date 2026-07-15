/**
 * src/services/apurador.service.ts
 * Motor matemático de cálculo de pontos do Bolão.
 * Função pura: não possui dependências de banco de dados, ideal para testes unitários.
 */

import { prisma } from "@/lib/prisma";

export interface Placar {
  golsMandante: number;
  golsVisitante: number;
  penaltisMandante?: number | null;
  penaltisVisitante?: number | null;
}

export function calcularPontuacaoDaPartida(palpite: Placar, real: Placar): number {
  let pontos = 0;

  // --- 1. AVALIAÇÃO DO TEMPO NORMAL ---
  const difReal = real.golsMandante - real.golsVisitante;
  const difPalpite = palpite.golsMandante - palpite.golsVisitante;

  const empateReal = difReal === 0;
  const mesmoVencedor = Math.sign(difReal) === Math.sign(difPalpite);

  if (palpite.golsMandante === real.golsMandante && palpite.golsVisitante === real.golsVisitante) {
    // Acerto Exato Exato
    pontos += 5;
  } else if (mesmoVencedor && difReal === difPalpite) {
    // Acerto de Vencedor + Saldo Exato (ou Empate Inexato)
    pontos += 3;
  } else if (mesmoVencedor) {
    // Acerto Simples de Vencedor
    pontos += 1;
  }

  // --- 2. AVALIAÇÃO DE PÊNALTIS (MATA-MATA) ---
  // Só avalia pênaltis se o jogo real empatou e foi para os pênaltis
  if (empateReal && real.penaltisMandante != null && real.penaltisVisitante != null) {
    
    // O usuário também precisa ter palpitado pênaltis para ganhar pontos bônus
    if (palpite.penaltisMandante != null && palpite.penaltisVisitante != null) {
      const venceuMandanteReal = real.penaltisMandante > real.penaltisVisitante;
      const venceuMandantePalpite = palpite.penaltisMandante > palpite.penaltisVisitante;

      if (venceuMandanteReal === venceuMandantePalpite) {
        pontos += 2; // Acertou a Seleção Classificada
        
        if (palpite.penaltisMandante === real.penaltisMandante && palpite.penaltisVisitante === real.penaltisVisitante) {
          pontos += 1; // Acertou o placar exato dos pênaltis
        }
      }
    }
  }

  return pontos;
}

export async function apurarPartida(partidaId: number) {
  const partida = await prisma.partida.findUnique({
    where: { id: partidaId },
    include: { resultadoOficial: true }
  });

  if (!partida) {
    throw new Error("Partida não encontrada");
  }

  const isMataMata = partida.fase !== "GRUPOS";

  // Regra de bloqueio
  if (!isMataMata) {
    if (!partida.encerrada) {
      throw new Error("A partida ainda não possui resultado oficial consolidado");
    }
  } else {
    if (!partida.resultadoOficial) {
      throw new Error("A partida ainda não possui resultado oficial consolidado");
    }
  }

  const realPlacar: Placar = {
    golsMandante: partida.golsMandante ?? 0,
    golsVisitante: partida.golsVisitante ?? 0,
    penaltisMandante: partida.resultadoOficial?.penaltisMandante,
    penaltisVisitante: partida.resultadoOficial?.penaltisVisitante
  };

  const operacoes: any[] = [];

  if (!isMataMata) {
    const palpites = await prisma.palpite.findMany({
      where: { partidaId }
    });

    for (const p of palpites) {
      if (p.golsMandante == null || p.golsVisitante == null) continue;
      
      const palpitePlacar: Placar = {
        golsMandante: p.golsMandante,
        golsVisitante: p.golsVisitante
      };

      const pontos = calcularPontuacaoDaPartida(palpitePlacar, realPlacar);

      operacoes.push(
        prisma.palpite.update({
          where: { id: p.id },
          data: { pontos }
        })
      );
    }
  } else {
    const palpites = await prisma.palpiteMataMata.findMany({
      where: { partidaId }
    });

    for (const p of palpites) {
      if (p.golsMandante == null || p.golsVisitante == null) continue;

      const palpitePlacar: Placar = {
        golsMandante: p.golsMandante,
        golsVisitante: p.golsVisitante,
        penaltisMandante: p.penaltisMandante,
        penaltisVisitante: p.penaltisVisitante
      };

      const pontos = calcularPontuacaoDaPartida(palpitePlacar, realPlacar);

      operacoes.push(
        prisma.palpiteMataMata.update({
          where: { id: p.id },
          data: { pontos }
        })
      );
    }
  }

  await prisma.$transaction(operacoes);

  return { palpitesApurados: operacoes.length };
}
