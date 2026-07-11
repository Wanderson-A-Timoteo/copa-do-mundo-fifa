import { FlagIcon } from "@/components/FlagIcon";
import { IconStar } from "@/components/Icons";

export interface JogadorCard {
  nome: string;
  numeroCamisa: number | null;
  posicao: string;
  fotoUrl: string | null;
  dataNascimento: string | null;
  altura: number | null;
  peso: number | null;
  figurinha: { raridade: string } | null;
}

function calcIdade(dataNasc: string): number {
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export default function PlayerCard({
  jogador,
  corPrimaria,
  codigoPais,
  raridade,
}: {
  jogador: JogadorCard;
  corPrimaria: string | null;
  codigoPais: string | null;
  raridade?: string;
}) {
  const iniciais = jogador.nome
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const idade = jogador.dataNascimento ? calcIdade(jogador.dataNascimento) : null;
  const isRara = raridade ? raridade === "rara" : jogador.figurinha?.raridade === "rara";

  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-stone-50 px-5 pb-5 pt-6 shadow-sm transition-all hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      <div className="relative mb-3">
        {jogador.fotoUrl ? (
          <img
            src={jogador.fotoUrl}
            alt={jogador.nome}
            className="h-28 w-20 rounded-lg object-cover transition-transform duration-200 hover:scale-105 sm:h-32 sm:w-24"
          />
        ) : (
          <div
            className="flex h-28 w-20 items-center justify-center rounded-lg text-sm font-bold text-white transition-transform duration-200 hover:scale-105 sm:h-32 sm:w-24 sm:text-base"
            style={{ backgroundColor: corPrimaria || "#52525b" }}
          >
            {iniciais}
          </div>
        )}
        {codigoPais && (
          <div className="absolute -right-1 -top-1 overflow-hidden rounded-sm shadow-md">
            <FlagIcon codigo={codigoPais} className="h-4 w-auto sm:h-5" />
          </div>
        )}
      </div>

      <span className="text-xs font-bold text-zinc-400">#{jogador.numeroCamisa ?? "—"}</span>
      <span className="mt-0.5 text-center text-sm font-semibold leading-tight">{jogador.nome}</span>
      <span className="mt-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        {jogador.posicao}
      </span>
      {isRara && (
        <span className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
          <IconStar className="h-3 w-3" /> RARA
        </span>
      )}
      {idade && (
        <span className="mt-1 text-[10px] text-zinc-400">
          {idade} anos
        </span>
      )}
      {(jogador.altura || jogador.peso) && (
        <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400">
          {jogador.altura && <span>{jogador.altura}cm</span>}
          {jogador.peso && <span>{jogador.peso}kg</span>}
        </div>
      )}
    </div>
  );
}
