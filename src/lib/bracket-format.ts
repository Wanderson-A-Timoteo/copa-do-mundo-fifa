export type FonteTime =
  | { tipo: "grupo"; posicao: 1 | 2 | 3; grupo: string }
  | { tipo: "melhoresTerceiros" }
  | { tipo: "vencedor"; partidaAnterior: number }
  | { tipo: "perdedor"; partidaAnterior: number };

export interface PartidaBracket {
  numero: number;
  dataHora: string;
  estadio: { nome: string; cidade: string };
  mandante: FonteTime;
  visitante: FonteTime;
}

export interface FaseBracket {
  key: string;
  label: string;
  partidas: PartidaBracket[];
}

export interface BracketFormat {
  grupos: number;
  vagas: {
    primeiro: number;
    segundo: number;
    melhoresTerceiros: number;
  };
  fases: FaseBracket[];
}
