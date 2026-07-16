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
    <div className={`relative h-full w-full ${className}`}>
      {figurinha.jogador ? (
        <PlayerCard
          jogador={figurinha.jogador}
          raridade={figurinha.raridade}
          corPrimaria={figurinha.selecao.corPrimaria}
          codigoPais={figurinha.selecao.codigoPais}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-zinc-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <FlagIcon
            codigo={figurinha.selecao.codigoPais}
            className="mb-2 md:mb-4 h-10 w-auto md:h-14 rounded-sm shadow-sm"
          />
          <span className="text-center text-xs md:text-sm font-bold text-zinc-700 dark:text-zinc-200">
            {figurinha.selecao.nome}
          </span>
          <span className="text-[10px] md:text-xs text-zinc-400 mt-1 md:mt-2">
            #{figurinha.numero}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
