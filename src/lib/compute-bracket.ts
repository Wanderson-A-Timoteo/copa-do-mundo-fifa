import { BracketFormat, FonteTime, PartidaBracket } from "@/lib/bracket-format";

export interface SelecaoStanding {
  id: number;
  nome: string;
  codigoPais: string | null;
  grupoId: string;
  p: number;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
}

export interface GrupoStanding {
  id: string;
  nome: string;
  selecoes: SelecaoStanding[];
}

export interface PalpiteMataMataInput {
  partidaId: number;
  golsMandante: number | null;
  golsVisitante: number | null;
}

export interface PartidaResolvida {
  numero: number;
  dataHora: string;
  fase: string;
  faseLabel: string;
  mandante: SelecaoStanding | null;
  visitante: SelecaoStanding | null;
  golsMandante: number | null;
  golsVisitante: number | null;
  vencedor: SelecaoStanding | null;
  perdedor: SelecaoStanding | null;
  resolvida: boolean;
}

export interface BracketResult {
  fases: {
    key: string;
    label: string;
    partidas: PartidaResolvida[];
  }[];
  classificadosTerceiros: SelecaoStanding[];
}

function resolverFonte(
  fonte: FonteTime,
  primeiro: Map<string, SelecaoStanding>,
  segundo: Map<string, SelecaoStanding>,
  terceiro: Map<string, SelecaoStanding>,
  melhoresTerceiros: SelecaoStanding[],
  vencedores: Map<number, SelecaoStanding>,
  perdedores: Map<number, SelecaoStanding>
): SelecaoStanding | null {
  switch (fonte.tipo) {
    case "grupo":
      if (fonte.posicao === 1) return primeiro.get(fonte.grupo) ?? null;
      if (fonte.posicao === 2) return segundo.get(fonte.grupo) ?? null;
      return terceiro.get(fonte.grupo) ?? null;
    case "melhoresTerceiros": {
      const idx = fonte.rank - 1;
      return melhoresTerceiros[idx] ?? null;
    }
    case "vencedor":
      return vencedores.get(fonte.partidaAnterior) ?? null;
    case "perdedor":
      return perdedores.get(fonte.partidaAnterior) ?? null;
  }
}

export function computeBracket(
  format: BracketFormat,
  grupos: GrupoStanding[],
  palpites: PalpiteMataMataInput[]
): BracketResult {
  const primeiro = new Map<string, SelecaoStanding>();
  const segundo = new Map<string, SelecaoStanding>();
  const terceiro = new Map<string, SelecaoStanding>();

  for (const grupo of grupos) {
    const [p1, p2, p3] = grupo.selecoes;
    if (p1) primeiro.set(grupo.id, p1);
    if (p2) segundo.set(grupo.id, p2);
    if (p3) terceiro.set(grupo.id, p3);
  }

  const todosTerceiros = [...terceiro.values()].sort((a, b) => {
    if (b.p !== a.p) return b.p - a.p;
    if (b.sg !== a.sg) return b.sg - a.sg;
    return b.gp - a.gp;
  });

  const melhoresTerceiros = todosTerceiros.slice(0, format.vagas.melhoresTerceiros);

  const palpitesPorPartida = new Map<number, { golsMandante: number; golsVisitante: number }>();
  for (const p of palpites) {
    if (p.golsMandante !== null && p.golsVisitante !== null) {
      palpitesPorPartida.set(p.partidaId, { golsMandante: p.golsMandante, golsVisitante: p.golsVisitante });
    }
  }

  const vencedores = new Map<number, SelecaoStanding>();
  const perdedores = new Map<number, SelecaoStanding>();

  const todasPartidas = format.fases.flatMap((f) =>
    f.partidas.map((p) => ({ ...p, fase: f.key, faseLabel: f.label }))
  );

  for (const partida of todasPartidas) {
    const mandante = resolverFonte(partida.mandante, primeiro, segundo, terceiro, melhoresTerceiros, vencedores, perdedores);
    const visitante = resolverFonte(partida.visitante, primeiro, segundo, terceiro, melhoresTerceiros, vencedores, perdedores);

    const palpite = palpitesPorPartida.get(partida.numero);

    if (palpite && mandante && visitante) {
      if (palpite.golsMandante > palpite.golsVisitante) {
        vencedores.set(partida.numero, mandante);
        perdedores.set(partida.numero, visitante);
      } else if (palpite.golsMandante < palpite.golsVisitante) {
        vencedores.set(partida.numero, visitante);
        perdedores.set(partida.numero, mandante);
      }
    }
  }

  const fases = format.fases.map((fase) => ({
    key: fase.key,
    label: fase.label,
    partidas: fase.partidas.map((p) => {
      const mandante = resolverFonte(p.mandante, primeiro, segundo, terceiro, melhoresTerceiros, vencedores, perdedores);
      const visitante = resolverFonte(p.visitante, primeiro, segundo, terceiro, melhoresTerceiros, vencedores, perdedores);
      const palpite = palpitesPorPartida.get(p.numero);

      return {
        numero: p.numero,
        dataHora: p.dataHora,
        fase: fase.key,
        faseLabel: fase.label,
        mandante,
        visitante,
        golsMandante: palpite?.golsMandante ?? null,
        golsVisitante: palpite?.golsVisitante ?? null,
        vencedor: vencedores.get(p.numero) ?? null,
        perdedor: perdedores.get(p.numero) ?? null,
        resolvida: !!palpite && !!mandante && !!visitante,
      };
    }),
  }));

  return { fases, classificadosTerceiros: melhoresTerceiros };
}
