import Image from "next/image";
import { FlagIcon } from "@/components/FlagIcon";
import { IconStar } from "@/components/Icons";

export interface JogadorCard {
  nome: string;
  numeroCamisa: number | null;
  posicao: string;
  fotoUrl: string | null;
  dataNascimento: string | Date | null;
  altura: number | null;
  peso: number | null;
  figurinha: { raridade: string } | null;
}

function calcIdade(dataNasc: string | Date): number {
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
    <div className="group flex h-full w-full flex-col items-center justify-between rounded-2xl border border-zinc-200/50 bg-zinc-100/90 px-3 pb-4 pt-5 sm:px-5 sm:pb-5 sm:pt-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-700/50 dark:bg-zinc-800/90">
      <div className="flex flex-col items-center w-full">
        <div className="relative mb-3">
          {jogador.fotoUrl ? (
            <Image
              src={jogador.fotoUrl}
              alt={jogador.nome}
              width={128}
              height={160}
              className="h-28 w-20 sm:h-32 sm:w-24 md:h-40 md:w-32 rounded-lg object-cover transition-transform duration-200 hover:scale-105"
            />
          ) : (
            <div
              className="flex h-28 w-20 items-center justify-center rounded-lg text-sm font-bold text-zinc-50 transition-transform duration-200 hover:scale-105 sm:h-32 sm:w-24 sm:text-base md:h-40 md:w-32 md:text-xl"
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

        <span className="text-xs md:text-sm font-bold text-zinc-400">
          #{jogador.numeroCamisa ?? "—"}
        </span>
        <span className="mt-0.5 text-center text-sm sm:text-base md:text-lg font-semibold leading-tight text-zinc-900 dark:text-zinc-100 transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
          {jogador.nome}
        </span>
        <span className="mt-1 md:mt-2 rounded-full bg-zinc-100 px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-medium text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-300">
          {jogador.posicao}
        </span>
        {isRara && (
          <span className="mt-1 md:mt-2 flex items-center gap-0.5 text-[10px] md:text-xs font-bold text-amber-500">
            <IconStar className="h-3 w-3 md:h-4 md:w-4" /> RARA
          </span>
        )}
        {idade && (
          <span className="mt-1 md:mt-2 text-[10px] md:text-xs text-zinc-400">{idade} anos</span>
        )}
        {(jogador.altura || jogador.peso) && (
          <div className="mt-1 md:mt-2 flex items-center gap-2 text-[10px] md:text-xs text-zinc-400">
            {jogador.altura && <span>{jogador.altura}cm</span>}
            {jogador.peso && <span>{jogador.peso}kg</span>}
          </div>
        )}
      </div>
    </div>
  );
}
