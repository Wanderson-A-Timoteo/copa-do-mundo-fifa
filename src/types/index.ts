import type { JogadorCard } from "@/components/PlayerCard";

export type { JogadorCard } from "@/components/PlayerCard";

export type { PartidaResumida } from "@/components/estadios/PartidaResumidaCard";

export interface UserProfile {
  id: number;
  nome: string;
  slug: string;
  email: string;
  role: string;
}

export interface UserProfileAdmin {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export interface FigurinhaResumo {
  id: number;
  slug: string;
  numero: number;
  raridade: string;
  selecao: { id: number; nome: string; codigoPais: string | null; corPrimaria: string | null };
  jogador: JogadorCard | null;
}

export interface FigurinhaAlbum {
  figurinhaId: number;
  quantidade: number;
  figurinha: FigurinhaResumo;
}

export interface ClassificacaoSelecao {
  id: number;
  nome: string;
  slug?: string;
  codigoPais: string | null;
  p: number;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
}

export interface GrupoComClassificacao {
  id: string;
  nome: string;
  selecoes: ClassificacaoSelecao[];
}

export interface PartidaResumo {
  id: number;
  fase: string;
  grupoId: string;
  dataHora: string;
  golsMandante: number | null;
  golsVisitante: number | null;
  encerrada: boolean;
  mandante: { id: number; nome: string; codigoPais: string | null };
  visitante: { id: number; nome: string; codigoPais: string | null };
  estadio: { nome: string; cidade: string; pais: string };
}

export interface SelecaoResumo {
  id: number;
  nome: string;
  slug: string | null;
  codigoPais: string | null;
  grupoId: string;
  continente: string;
  rankingFifa: number | null;
  corPrimaria: string | null;
  titulos: number;
  _count: { jogadores: number };
}

export interface TrocaItem {
  id: number;
  status: string;
  createdAt: string;
  remetente: { id: number; nome: string };
  destinatario: { id: number; nome: string };
  figurinhaDesejada: FigurinhaResumo;
  figurinhasOferecidas: { figurinha: FigurinhaResumo }[];
}

export interface RepetidaGrupo {
  figurinha: FigurinhaResumo;
  totalUsuarios: number;
  usuarios: { id: number; nome: string }[];
}

export interface RepetidaItem {
  quantidade: number;
  figurinha: FigurinhaResumo;
}

export type Aba = "disponiveis" | "recebidas" | "enviadas";
