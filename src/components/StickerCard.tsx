"use client";

import { FlagIcon } from "@/components/FlagIcon";
import PlayerCard, { type JogadorCard } from "@/components/PlayerCard";

export interface StickerFigurinha {
  id: number;
  numero: number;
  slug?: string;
  raridade: string;
  selecao: { id: number; nome: string; codigoPais: string | null; corPrimaria: string | null };
  jogador: JogadorCard | null;
}

interface StickerCardProps {
  figurinha: StickerFigurinha;
  className?: string;
  children?: React.ReactNode;
}

export default function StickerCard({ figurinha, className = "", children }: StickerCardProps) {
  return (
    <div className={`relative ${className}`}>
      {figurinha.jogador ? (
        <PlayerCard
          jogador={figurinha.jogador}
          raridade={figurinha.raridade}
          corPrimaria={figurinha.selecao.corPrimaria}
          codigoPais={figurinha.selecao.codigoPais}
        />
      ) : (
        <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border border-zinc-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <FlagIcon codigo={figurinha.selecao.codigoPais} className="mb-2 h-10 w-auto rounded-sm" />
          <span className="text-center text-xs font-bold">{figurinha.selecao.nome}</span>
          <span className="text-[10px] text-zinc-400">#{figurinha.numero}</span>
        </div>
      )}
      {children}
    </div>
  );
}
