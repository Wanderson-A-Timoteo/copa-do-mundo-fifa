"use client";

import { FlagIcon } from "@/components/FlagIcon";
import { IconClock, IconMapPin } from "@/components/Icons";
import { formatarData, formatarHora } from "@/lib/format";
import type { PartidaResolvida } from "@/lib/compute-bracket";
import ScoreInput from "@/components/ScoreInput";
import { useState } from "react";

interface Props {
  partida: PartidaResolvida;
  placar: {
    golsMandante: string;
    golsVisitante: string;
    penaltisMandante: string;
    penaltisVisitante: string;
  };
  onChangePlacar: (numero: number, campo: string, valor: string) => void;
  isAdmin: boolean;
  salvando: boolean;
  onSalvar: (numero: number) => void;
}

export default function MataMataPartidaEditor({
  partida: p,
  placar,
  onChangePlacar,
  isAdmin,
  salvando,
  onSalvar,
}: Props) {
  const golsM = placar.golsMandante;
  const golsV = placar.golsVisitante;
  const penM = placar.penaltisMandante;
  const penV = placar.penaltisVisitante;

  const [isApurando, setIsApurando] = useState(false);

  const handleApurar = async () => {
    setIsApurando(true);
    try {
      const res = await fetch("/api/admin/apurar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partidaId: p.numero }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao apurar");
      alert(`${data.palpitesApurados} palpites apurados com sucesso!`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsApurando(false);
    }
  };

  const empate = golsM !== "" && golsV !== "" && Number(golsM) === Number(golsV);

  const estadioLabel = p.estadio?.nome ?? "A definir";

  const penInputClass = `w-12 rounded-lg border border-zinc-300 px-2 py-1 text-center text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:w-14 sm:text-sm`;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 transition-shadow dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {p.mandante ? (
              <>
                <FlagIcon codigo={p.mandante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
                <span className="truncate font-medium sm:text-base">{p.mandante.nome}</span>
              </>
            ) : (
              <span className="truncate text-sm text-zinc-400">A definir</span>
            )}
          </div>

          {isAdmin && p.mandante && p.visitante ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <ScoreInput
                value={golsM}
                onChange={(v) => onChangePlacar(p.numero, "golsMandante", v)}
                onBlur={() => onSalvar(p.numero)}
                salvando={salvando}
              />
              <span className="text-sm text-zinc-400 sm:text-base">x</span>
              <ScoreInput
                value={golsV}
                onChange={(v) => onChangePlacar(p.numero, "golsVisitante", v)}
                onBlur={() => onSalvar(p.numero)}
                salvando={salvando}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="min-w-[3.5rem] text-center text-lg font-bold sm:min-w-[4rem] sm:text-xl">
                {p.golsMandante !== null ? p.golsMandante : "-"}
              </span>
              <span className="text-sm text-zinc-400 sm:text-base">x</span>
              <span className="min-w-[3.5rem] text-center text-lg font-bold sm:min-w-[4rem] sm:text-xl">
                {p.golsVisitante !== null ? p.golsVisitante : "-"}
              </span>
            </div>
          )}

          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
            {p.visitante ? (
              <>
                <span className="truncate text-right font-medium sm:text-base">
                  {p.visitante.nome}
                </span>
                <FlagIcon
                  codigo={p.visitante.codigoPais}
                  className="h-6 w-auto rounded-sm sm:h-8"
                />
              </>
            ) : (
              <span className="truncate text-right text-sm text-zinc-400">A definir</span>
            )}
          </div>
        </div>

        {isAdmin && empate && p.mandante && p.visitante && (
          <div className="mt-4 flex flex-col items-center justify-center border-t border-dashed border-zinc-200 pt-4 dark:border-zinc-800">
            <span className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Pênaltis
            </span>
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <FlagIcon
                  codigo={p.mandante.codigoPais}
                  className="h-5 w-auto rounded-sm shadow-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={penM}
                  onChange={(e) => onChangePlacar(p.numero, "penaltisMandante", e.target.value)}
                  onBlur={() => onSalvar(p.numero)}
                  className={penInputClass}
                />
              </div>
              <span className="text-xs font-bold text-zinc-300">X</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={penV}
                  onChange={(e) => onChangePlacar(p.numero, "penaltisVisitante", e.target.value)}
                  onBlur={() => onSalvar(p.numero)}
                  className={penInputClass}
                />
                <FlagIcon
                  codigo={p.visitante.codigoPais}
                  className="h-5 w-auto rounded-sm shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {!isAdmin && empate && p.penaltisMandante !== null && p.penaltisVisitante !== null && (
          <div className="mt-4 flex flex-col items-center justify-center border-t border-dashed border-zinc-200 pt-4 dark:border-zinc-800">
            <span className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Pênaltis
            </span>
            <div className="flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <FlagIcon
                  codigo={p.mandante?.codigoPais}
                  className="h-5 w-auto rounded-sm shadow-sm"
                />
                <span className="w-12 text-center text-lg font-bold">{p.penaltisMandante}</span>
              </div>
              <span className="text-xs font-bold text-zinc-300">X</span>
              <div className="flex items-center gap-2">
                <span className="w-12 text-center text-lg font-bold">{p.penaltisVisitante}</span>
                <FlagIcon
                  codigo={p.visitante?.codigoPais}
                  className="h-5 w-auto rounded-sm shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-zinc-300/30 dark:border-zinc-700/30" />
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 sm:gap-4 sm:text-sm">
          <span className="font-mono">J{p.numero}</span>
          <span className="text-zinc-300">|</span>
          <span>{formatarData(p.dataHora)}</span>
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3.5 w-3.5" />
            {formatarHora(p.dataHora)}
          </span>
          <span className="text-zinc-300">|</span>
          <span className="inline-flex items-center gap-1">
            <IconMapPin className="h-3.5 w-3.5" />
            {estadioLabel}
          </span>
          {p.resolvida && (
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              Encerrada
            </span>
          )}
          {isAdmin && p.resolvida && (
            <button
              onClick={handleApurar}
              disabled={isApurando}
              className="ml-auto flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {isApurando ? "Apurando..." : "Apurar Pontos"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {p.mandante ? (
              <>
                <FlagIcon
                  codigo={p.mandante.codigoPais}
                  className="h-5 w-auto shrink-0 rounded-sm"
                />
                <span className="truncate text-sm font-medium">{p.mandante.nome}</span>
              </>
            ) : (
              <span className="truncate text-xs text-zinc-400">A definir</span>
            )}
          </div>
          {isAdmin && p.mandante && p.visitante ? (
            <ScoreInput
              value={golsM}
              onChange={(v) => onChangePlacar(p.numero, "golsMandante", v)}
              onBlur={() => onSalvar(p.numero)}
              salvando={salvando}
              isMobile
            />
          ) : (
            <span className="text-sm font-bold">{p.golsMandante ?? "-"}</span>
          )}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {p.visitante ? (
              <>
                <FlagIcon
                  codigo={p.visitante.codigoPais}
                  className="h-5 w-auto shrink-0 rounded-sm"
                />
                <span className="truncate text-sm font-medium">{p.visitante.nome}</span>
              </>
            ) : (
              <span className="truncate text-xs text-zinc-400">A definir</span>
            )}
          </div>
          {isAdmin && p.mandante && p.visitante ? (
            <ScoreInput
              value={golsV}
              onChange={(v) => onChangePlacar(p.numero, "golsVisitante", v)}
              onBlur={() => onSalvar(p.numero)}
              salvando={salvando}
              isMobile
            />
          ) : (
            <span className="text-sm font-bold">{p.golsVisitante ?? "-"}</span>
          )}
        </div>

        {isAdmin && empate && p.mandante && p.visitante && (
          <div className="mt-4 flex flex-col items-center justify-center border-t border-dashed border-zinc-200 pt-3 dark:border-zinc-800">
            <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Pênaltis
            </span>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5">
                <FlagIcon
                  codigo={p.mandante.codigoPais}
                  className="h-4 w-auto rounded-sm shadow-sm"
                />
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={penM}
                  onChange={(e) => onChangePlacar(p.numero, "penaltisMandante", e.target.value)}
                  onBlur={() => onSalvar(p.numero)}
                  className={`w-12 rounded-lg border border-zinc-300 px-1 py-1 text-center text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800`}
                />
              </div>
              <span className="text-[10px] font-bold text-zinc-300">X</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={penV}
                  onChange={(e) => onChangePlacar(p.numero, "penaltisVisitante", e.target.value)}
                  onBlur={() => onSalvar(p.numero)}
                  className={`w-12 rounded-lg border border-zinc-300 px-1 py-1 text-center text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800`}
                />
                <FlagIcon
                  codigo={p.visitante.codigoPais}
                  className="h-4 w-auto rounded-sm shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        {!isAdmin && empate && p.penaltisMandante !== null && p.penaltisVisitante !== null && (
          <div className="mt-4 flex flex-col items-center justify-center border-t border-dashed border-zinc-200 pt-3 dark:border-zinc-800">
            <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Pênaltis
            </span>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5">
                <FlagIcon
                  codigo={p.mandante?.codigoPais}
                  className="h-4 w-auto rounded-sm shadow-sm"
                />
                <span className="w-10 text-center text-base font-bold">{p.penaltisMandante}</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-300">X</span>
              <div className="flex items-center gap-1.5">
                <span className="w-10 text-center text-base font-bold">{p.penaltisVisitante}</span>
                <FlagIcon
                  codigo={p.visitante?.codigoPais}
                  className="h-4 w-auto rounded-sm shadow-sm"
                />
              </div>
            </div>
          </div>
        )}

        <div className="my-2 border-t border-zinc-300/30 dark:border-zinc-700/30" />
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          <span className="font-mono">J{p.numero}</span>
          <span className="text-zinc-300">|</span>
          <span>{formatarData(p.dataHora)}</span>
          <span className="inline-flex items-center gap-1">
            <IconClock className="h-3 w-3" />
            {formatarHora(p.dataHora)}
          </span>
          <span className="text-zinc-300">|</span>
          <span className="inline-flex items-center gap-1">
            <IconMapPin className="h-3 w-3" />
            {estadioLabel}
          </span>
          {p.resolvida && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              Encerrada
            </span>
          )}
          {isAdmin && p.resolvida && (
            <button
              onClick={handleApurar}
              disabled={isApurando}
              className="ml-auto flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {isApurando ? "Apurando..." : "Apurar Pontos"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
