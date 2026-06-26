"use client";

import { useEffect, useState, useCallback } from "react";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";
import ModalLogin from "@/components/ModalLogin";

import { IconCalendar, IconClock, IconMapPin } from "@/components/Icons";

interface ClassificacaoSelecao {
  id: number;
  nome: string;
  slug: string;
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

interface Partida {
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

function formatarData(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatarHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });
}

export default function PlacarPage() {
  const [grupos, setGrupos] = useState<{ id: string; nome: string; selecoes: ClassificacaoSelecao[] }[]>([]);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [grupoAtivo, setGrupoAtivo] = useState("A");
  const [placares, setPlacares] = useState<Record<number, { golsMandante: string; golsVisitante: string }>>({});
  const [salvando, setSalvando] = useState<Record<number, boolean>>({});
  const [token, setToken] = useState<string | null>(null);
  const [showModalLogin, setShowModalLogin] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const carregar = useCallback(() => {
    fetch("/api/grupos")
      .then((r) => r.json())
      .then((d) => setGrupos(d.grupos));
    fetch("/api/partidas?fase=GRUPOS")
      .then((r) => r.json())
      .then((d) => {
        setPartidas(d.partidas);
        const p: Record<number, { golsMandante: string; golsVisitante: string }> = {};
        for (const partida of d.partidas) {
          p[partida.id] = {
            golsMandante: partida.golsMandante !== null ? String(partida.golsMandante) : "",
            golsVisitante: partida.golsVisitante !== null ? String(partida.golsVisitante) : "",
          };
        }
        setPlacares(p);
      });
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const partidasGrupo = partidas.filter((p) => p.grupoId === grupoAtivo);
  const grupo = grupos.find((g) => g.id === grupoAtivo);

  async function autoSalvar(partidaId: number) {
    if (!token) return;
    const p = placares[partidaId];
    if (!p) return;
    const golsMandante = parseInt(p.golsMandante);
    const golsVisitante = parseInt(p.golsVisitante);
    const isLimpar = isNaN(golsMandante) && isNaN(golsVisitante);

    if (!isLimpar && (isNaN(golsMandante) || isNaN(golsVisitante))) return;

    setSalvando((s) => ({ ...s, [partidaId]: true }));
    try {
      const res = await fetch(`/api/partidas/${partidaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(
          isLimpar
            ? { golsMandante: null, golsVisitante: null }
            : { golsMandante, golsVisitante }
        ),
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        setShowModalLogin(true);
        return;
      }
      if (!res.ok) return;
      carregar();
    } finally {
      setSalvando((s) => ({ ...s, [partidaId]: false }));
    }
  }

  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <a
          href="/tabela"
          className="inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Voltar
        </a>
        <h1 className="mt-2 text-3xl font-bold">Placar</h1>
        <p className="mt-1 text-zinc-500">Registre os resultados dos jogos da fase de grupos</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {grupos.map((g) => (
            <button
              key={g.id}
              onClick={() => setGrupoAtivo(g.id)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                grupoAtivo === g.id
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              Grupo {g.id}
            </button>
          ))}
        </div>

        {grupo && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold">{grupo.nome}</h2>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900">
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">Seleção</th>
                    <th className="px-3 py-2 text-center font-medium">P</th>
                    <th className="px-3 py-2 text-center font-medium">J</th>
                    <th className="px-3 py-2 text-center font-medium">V</th>
                    <th className="px-3 py-2 text-center font-medium">E</th>
                    <th className="px-3 py-2 text-center font-medium">D</th>
                    <th className="px-3 py-2 text-center font-medium">GM</th>
                    <th className="px-3 py-2 text-center font-medium">GC</th>
                    <th className="px-3 py-2 text-center font-medium">SG</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.selecoes.map((sel, idx) => (
                    <tr
                      key={sel.id}
                      className={`border-t border-zinc-100 dark:border-zinc-800 border-l-4 ${
                        idx < 2
                          ? "border-l-emerald-500"
                          : idx === 2
                            ? "border-l-amber-500"
                            : "border-l-red-500"
                      }`}
                    >
                      <td className="px-3 py-3 font-bold text-zinc-400">{idx + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <FlagIcon codigo={sel.codigoPais} className="h-5 w-auto rounded-sm" />
                          <span className="font-medium">{sel.nome}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold">{sel.p}</td>
                      <td className="px-3 py-3 text-center text-zinc-500">{sel.j}</td>
                      <td className="px-3 py-3 text-center text-zinc-500">{sel.v}</td>
                      <td className="px-3 py-3 text-center text-zinc-500">{sel.e}</td>
                      <td className="px-3 py-3 text-center text-zinc-500">{sel.d}</td>
                      <td className="px-3 py-3 text-center text-zinc-500">{sel.gp}</td>
                      <td className="px-3 py-3 text-center text-zinc-500">{sel.gc}</td>
                      <td className="px-3 py-3 text-center text-zinc-500">
                        {sel.sg > 0 ? `+${sel.sg}` : sel.sg}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 border-l-[3px] border-l-emerald-500" />
                Classificado
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 border-l-[3px] border-l-amber-500" />
                Repescagem
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 border-l-[3px] border-l-red-500" />
                Eliminado
              </span>
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">Jogos</h2>
          {partidasGrupo.length === 0 ? (
            <p className="text-zinc-500">Nenhum jogo encontrado para este grupo.</p>
          ) : (
            <div className="space-y-3">
              {partidasGrupo.map((p) => {
                const golsM = placares[p.id]?.golsMandante ?? "";
                const golsV = placares[p.id]?.golsVisitante ?? "";
                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <FlagIcon codigo={p.mandante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8 lg:h-10" />
                        <span className="truncate font-medium sm:text-base">{p.mandante.nome}</span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative">
                          {!token && (
                            <div
                              className="absolute inset-0 z-10 cursor-pointer"
                              onClick={() => setShowModalLogin(true)}
                            />
                          )}
                          <input
                            type="number"
                            min="0"
                            max="99"
                            disabled={!token}
                            value={golsM}
                            onChange={(e) =>
                              setPlacares((prev) => ({
                                ...prev,
                                [p.id]: { golsMandante: e.target.value, golsVisitante: prev[p.id]?.golsVisitante ?? "" },
                              }))
                            }
                            onBlur={() => autoSalvar(p.id)}
                            className="w-14 rounded-lg border border-zinc-300 px-2 py-1.5 text-center text-sm focus:border-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 sm:w-16 sm:text-lg"
                          />
                        </div>
                        <span className="text-sm text-zinc-400 sm:text-base">x</span>
                        <div className="relative">
                          {!token && (
                            <div
                              className="absolute inset-0 z-10 cursor-pointer"
                              onClick={() => setShowModalLogin(true)}
                            />
                          )}
                          <input
                            type="number"
                            min="0"
                            max="99"
                            disabled={!token}
                            value={golsV}
                            onChange={(e) =>
                              setPlacares((prev) => ({
                                ...prev,
                                [p.id]: { golsMandante: prev[p.id]?.golsMandante ?? "", golsVisitante: e.target.value },
                              }))
                            }
                            onBlur={() => autoSalvar(p.id)}
                            className="w-14 rounded-lg border border-zinc-300 px-2 py-1.5 text-center text-sm focus:border-zinc-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 sm:w-16 sm:text-lg"
                          />
                        </div>
                      </div>

                      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
                        <span className="truncate text-right font-medium sm:text-base">{p.visitante.nome}</span>
                        <FlagIcon codigo={p.visitante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8 lg:h-10" />
                      </div>

                    </div>

                    <div className="mt-3 border-t border-zinc-100 pt-3 sm:mt-4 sm:pt-4">
                      <div className="flex flex-col items-center justify-center gap-1 text-xs text-zinc-500 sm:flex-row sm:gap-3 sm:text-sm">
                        <span className="inline-flex items-center gap-1">
                          <IconCalendar className="h-3.5 w-3.5" />
                          {formatarData(p.dataHora)}
                          <IconClock className="ml-1 h-3.5 w-3.5" />
                          {formatarHora(p.dataHora)}
                        </span>
                        <span className="hidden sm:inline">—</span>
                        <span className="inline-flex items-center gap-1">
                          <IconMapPin className="h-3.5 w-3.5" />
                          {p.estadio.nome} ({p.estadio.cidade})
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {showModalLogin && (
        <ModalLogin onClose={() => setShowModalLogin(false)} />
      )}

    </div>
  );
}
