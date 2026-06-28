import { BracketFormat } from "@/lib/bracket-format";

export const formatoCopa: BracketFormat = {
  grupos: 12,
  vagas: { primeiro: 12, segundo: 12, melhoresTerceiros: 8 },
  fases: [
    {
      key: "SEGUNDAS",
      label: "Segundas de final",
      partidas: [
        { numero: 73, dataHora: "2026-06-28T15:00:00-03:00", mandante: { tipo: "grupo", posicao: 2, grupo: "A" }, visitante: { tipo: "grupo", posicao: 2, grupo: "B" } },
        { numero: 74, dataHora: "2026-06-29T16:30:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "E" }, visitante: { tipo: "melhoresTerceiros" } },
        { numero: 75, dataHora: "2026-06-29T21:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "F" }, visitante: { tipo: "grupo", posicao: 2, grupo: "C" } },
        { numero: 76, dataHora: "2026-06-29T13:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "C" }, visitante: { tipo: "grupo", posicao: 2, grupo: "F" } },
        { numero: 77, dataHora: "2026-06-30T17:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "I" }, visitante: { tipo: "melhoresTerceiros" } },
        { numero: 78, dataHora: "2026-06-30T13:00:00-03:00", mandante: { tipo: "grupo", posicao: 2, grupo: "E" }, visitante: { tipo: "grupo", posicao: 2, grupo: "I" } },
        { numero: 79, dataHora: "2026-06-30T21:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "A" }, visitante: { tipo: "melhoresTerceiros" } },
        { numero: 80, dataHora: "2026-07-01T12:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "L" }, visitante: { tipo: "melhoresTerceiros" } },
        { numero: 81, dataHora: "2026-07-01T20:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "D" }, visitante: { tipo: "melhoresTerceiros" } },
        { numero: 82, dataHora: "2026-07-01T16:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "G" }, visitante: { tipo: "melhoresTerceiros" } },
        { numero: 83, dataHora: "2026-07-02T19:00:00-03:00", mandante: { tipo: "grupo", posicao: 2, grupo: "K" }, visitante: { tipo: "grupo", posicao: 2, grupo: "L" } },
        { numero: 84, dataHora: "2026-07-02T15:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "H" }, visitante: { tipo: "grupo", posicao: 2, grupo: "J" } },
        { numero: 85, dataHora: "2026-07-02T23:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "B" }, visitante: { tipo: "melhoresTerceiros" } },
        { numero: 86, dataHora: "2026-07-03T18:00:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "J" }, visitante: { tipo: "grupo", posicao: 2, grupo: "H" } },
        { numero: 87, dataHora: "2026-07-03T21:30:00-03:00", mandante: { tipo: "grupo", posicao: 1, grupo: "K" }, visitante: { tipo: "melhoresTerceiros" } },
        { numero: 88, dataHora: "2026-07-03T14:00:00-03:00", mandante: { tipo: "grupo", posicao: 2, grupo: "D" }, visitante: { tipo: "grupo", posicao: 2, grupo: "G" } },
      ],
    },
    {
      key: "OITAVAS",
      label: "Oitavas de final",
      partidas: [
        { numero: 89, dataHora: "2026-07-04T17:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 74 }, visitante: { tipo: "vencedor", partidaAnterior: 77 } },
        { numero: 90, dataHora: "2026-07-04T13:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 73 }, visitante: { tipo: "vencedor", partidaAnterior: 75 } },
        { numero: 91, dataHora: "2026-07-05T16:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 76 }, visitante: { tipo: "vencedor", partidaAnterior: 78 } },
        { numero: 92, dataHora: "2026-07-05T20:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 79 }, visitante: { tipo: "vencedor", partidaAnterior: 80 } },
        { numero: 93, dataHora: "2026-07-06T15:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 83 }, visitante: { tipo: "vencedor", partidaAnterior: 84 } },
        { numero: 94, dataHora: "2026-07-06T20:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 81 }, visitante: { tipo: "vencedor", partidaAnterior: 82 } },
        { numero: 95, dataHora: "2026-07-07T12:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 86 }, visitante: { tipo: "vencedor", partidaAnterior: 88 } },
        { numero: 96, dataHora: "2026-07-07T16:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 85 }, visitante: { tipo: "vencedor", partidaAnterior: 87 } },
      ],
    },
    {
      key: "QUARTAS",
      label: "Quartas de final",
      partidas: [
        { numero: 97, dataHora: "2026-07-09T16:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 90 }, visitante: { tipo: "vencedor", partidaAnterior: 89 } },
        { numero: 98, dataHora: "2026-07-10T15:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 92 }, visitante: { tipo: "vencedor", partidaAnterior: 93 } },
        { numero: 99, dataHora: "2026-07-11T17:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 95 }, visitante: { tipo: "vencedor", partidaAnterior: 94 } },
        { numero: 100, dataHora: "2026-07-11T21:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 96 }, visitante: { tipo: "vencedor", partidaAnterior: 91 } },
      ],
    },
    {
      key: "SEMI",
      label: "Semifinais",
      partidas: [
        { numero: 101, dataHora: "2026-07-14T16:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 97 }, visitante: { tipo: "vencedor", partidaAnterior: 98 } },
        { numero: 102, dataHora: "2026-07-15T15:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 99 }, visitante: { tipo: "vencedor", partidaAnterior: 100 } },
      ],
    },
    {
      key: "TERCEIRO",
      label: "Decisão do 3º lugar",
      partidas: [
        { numero: 103, dataHora: "2026-07-18T17:00:00-03:00", mandante: { tipo: "perdedor", partidaAnterior: 101 }, visitante: { tipo: "perdedor", partidaAnterior: 102 } },
      ],
    },
    {
      key: "FINAL",
      label: "Final",
      partidas: [
        { numero: 104, dataHora: "2026-07-19T15:00:00-03:00", mandante: { tipo: "vencedor", partidaAnterior: 101 }, visitante: { tipo: "vencedor", partidaAnterior: 102 } },
      ],
    },
  ],
};
