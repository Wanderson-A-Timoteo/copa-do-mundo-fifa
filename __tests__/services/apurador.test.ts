import { describe, it, expect } from 'vitest';
import { calcularPontuacaoDaPartida, Placar } from '../../src/services/apurador.service';

describe('Engine de Apuração de Pontos (Bolão)', () => {
  
  describe('Fase de Grupos (Tempo Normal)', () => {
    it('deve retornar 5 pontos para Acerto Exato', () => {
      const palpite: Placar = { golsMandante: 2, golsVisitante: 1 };
      const real: Placar = { golsMandante: 2, golsVisitante: 1 };
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(5);
    });

    it('deve retornar 3 pontos para Acerto de Vencedor + Saldo Exato', () => {
      const palpite: Placar = { golsMandante: 3, golsVisitante: 1 };
      const real: Placar = { golsMandante: 2, golsVisitante: 0 }; // Venceu Mandante, saldo +2
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(3);
    });

    it('deve retornar 3 pontos para Empate Inexato (acertou empate, errou gols)', () => {
      const palpite: Placar = { golsMandante: 0, golsVisitante: 0 };
      const real: Placar = { golsMandante: 1, golsVisitante: 1 }; // Saldo 0, mas gols diferentes
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(3);
    });

    it('deve retornar 1 ponto para Acerto Simples de Vencedor', () => {
      const palpite: Placar = { golsMandante: 1, golsVisitante: 0 };
      const real: Placar = { golsMandante: 3, golsVisitante: 0 }; // Venceu Mandante, saldos diferentes
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(1);
    });

    it('deve retornar 0 pontos para Erro de Vencedor', () => {
      const palpite: Placar = { golsMandante: 0, golsVisitante: 1 };
      const real: Placar = { golsMandante: 2, golsVisitante: 0 };
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(0);
    });
  });

  describe('Fase Mata-Mata (Bônus de Pênaltis)', () => {
    it('deve retornar 8 pontos (Pontuação Máxima Épica)', () => {
      // Acerto exato do empate (5), acertou quem passa (2), acertou placar dos pênaltis (1)
      const palpite: Placar = { golsMandante: 1, golsVisitante: 1, penaltisMandante: 4, penaltisVisitante: 3 };
      const real: Placar = { golsMandante: 1, golsVisitante: 1, penaltisMandante: 4, penaltisVisitante: 3 };
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(8);
    });

    it('deve retornar 7 pontos (Exato no tempo normal + Vencedor dos Pênaltis, mas errou placar dos pênaltis)', () => {
      // Exato (5) + Vencedor pênalti (2) + Erro placar pênalti (0)
      const palpite: Placar = { golsMandante: 1, golsVisitante: 1, penaltisMandante: 5, penaltisVisitante: 4 };
      const real: Placar = { golsMandante: 1, golsVisitante: 1, penaltisMandante: 4, penaltisVisitante: 3 };
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(7);
    });

    it('deve retornar 6 pontos (Empate inexato + Pontuação Máxima nos Pênaltis)', () => {
      // Empate inexato (3) + Vencedor pênalti (2) + Placar pênalti exato (1)
      const palpite: Placar = { golsMandante: 0, golsVisitante: 0, penaltisMandante: 4, penaltisVisitante: 3 };
      const real: Placar = { golsMandante: 1, golsVisitante: 1, penaltisMandante: 4, penaltisVisitante: 3 };
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(6);
    });

    it('deve retornar 5 pontos (Acertou empate exato, mas apostou na seleção errada nos pênaltis)', () => {
      // Exato tempo normal (5) + Errou pênaltis (0)
      const palpite: Placar = { golsMandante: 1, golsVisitante: 1, penaltisMandante: 3, penaltisVisitante: 4 };
      const real: Placar = { golsMandante: 1, golsVisitante: 1, penaltisMandante: 4, penaltisVisitante: 3 };
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(5);
    });

    it('deve retornar 0 pontos se não apostou em empate, mas o jogo real foi para os pênaltis', () => {
      // Apostou vitória seca, mas jogo empatou (errou a essência do tempo regulamentar)
      const palpite: Placar = { golsMandante: 2, golsVisitante: 1, penaltisMandante: null, penaltisVisitante: null };
      const real: Placar = { golsMandante: 1, golsVisitante: 1, penaltisMandante: 4, penaltisVisitante: 3 };
      expect(calcularPontuacaoDaPartida(palpite, real)).toBe(0);
    });
  });

});
