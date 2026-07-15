/**
 * src/services/apurador.service.ts
 * Motor matemático de cálculo de pontos do Bolão.
 * Função pura: não possui dependências de banco de dados, ideal para testes unitários.
 */

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
