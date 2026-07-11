"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import NavHeader from "@/components/NavHeader";
import { FlagIcon } from "@/components/FlagIcon";

import { IconShield, IconClock, IconMapPin } from "@/components/Icons";
import PaginaAnimada from "@/components/PaginaAnimada";
import { SkeletonMataMata } from "@/components/Skeleton";
import { computeBracket, type GrupoStanding, type BracketResult } from "@/lib/compute-bracket";
import { formatoCopa } from "@/data/formato-copa";

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

function formatarDataAgrupamento(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC", weekday: "long", day: "2-digit", month: "long" });
}

export default function AdminOficialPage() {
  const router = useRouter();
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [placares, setPlacares] = useState<Record<number, { golsMandante: string; golsVisitante: string }>>({});
  const [role, setRole] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<Set<number>>(new Set());
  const [resultadoMataMata, setResultadoMataMata] = useState<BracketResult | null>(null);
  const [loadingKnockout, setLoadingKnockout] = useState(true);
  const [knockoutPlacares, setKnockoutPlacares] = useState<Record<number, { golsMandante: string; golsVisitante: string; penaltisMandante: string; penaltisVisitante: string }>>({});
  const [salvandoKnockout, setSalvandoKnockout] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : { user: null })
      .then((d) => {
        const r = d.user?.role ?? null;
        setRole(r);
        if (r !== "ADMIN") router.replace("/login");
      })
      .catch(() => {
        setRole(null);
        router.replace("/login");
      });
  }, [router]);

  useEffect(() => {
    fetch("/api/partidas?fase=GRUPOS")
      .then((r) => r.json())
      .then((d) => {
        const ordenadas = (d.partidas ?? []).sort(
          (a: Partida, b: Partida) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime()
        );
        setPartidas(ordenadas);
        const p: Record<number, { golsMandante: string; golsVisitante: string }> = {};
        for (const partida of ordenadas) {
          p[partida.id] = {
            golsMandante: partida.golsMandante !== null ? String(partida.golsMandante) : "",
            golsVisitante: partida.golsVisitante !== null ? String(partida.golsVisitante) : "",
          };
        }
        setPlacares(p);
      });
  }, []);

  const recalcularMataMata = useCallback(() => {
    setLoadingKnockout(true);

    Promise.all([
      fetch("/api/grupos"),
      fetch("/api/resultados-oficiais"),
    ])
      .then(([rGrupos, rResultados]) => Promise.all([rGrupos.json(), rResultados.json()]))
      .then(([dataGrupos, dataResultados]) => {
        const grupos: GrupoStanding[] = dataGrupos.grupos ?? [];
        const palpites = (dataResultados.resultados ?? []).map(
          (p: { partidaId: number; golsMandante: number | null; golsVisitante: number | null; penaltisMandante: number | null; penaltisVisitante: number | null }) => ({
            partidaId: p.partidaId,
            golsMandante: p.golsMandante,
            golsVisitante: p.golsVisitante,
            penaltisMandante: p.penaltisMandante,
            penaltisVisitante: p.penaltisVisitante,
          })
        );
        const r = computeBracket(formatoCopa, grupos, palpites);
        setResultadoMataMata(r);

        const ps: Record<number, { golsMandante: string; golsVisitante: string; penaltisMandante: string; penaltisVisitante: string }> = {};
        for (const fase of r.fases) {
          for (const p of fase.partidas) {
            ps[p.numero] = {
              golsMandante: p.golsMandante !== null ? String(p.golsMandante) : "",
              golsVisitante: p.golsVisitante !== null ? String(p.golsVisitante) : "",
              penaltisMandante: p.penaltisMandante !== null ? String(p.penaltisMandante) : "",
              penaltisVisitante: p.penaltisVisitante !== null ? String(p.penaltisVisitante) : "",
            };
          }
        }
        setKnockoutPlacares(ps);
      })
      .finally(() => setLoadingKnockout(false));
  }, []);

  useEffect(() => { recalcularMataMata(); }, [recalcularMataMata]);

  const isAdmin = role === "ADMIN";

  const fasesVisiveis = useMemo(() => {
    if (!resultadoMataMata) return [];
    return resultadoMataMata.fases.filter((f) =>
      f.partidas.some((p) => p.mandante || p.visitante)
    );
  }, [resultadoMataMata]);

  async function autoSalvar(partidaId: number) {
    setSalvando((prev) => new Set(prev).add(partidaId));
    try {
      const p = placares[partidaId];
      if (!p) return;
      const golsMandante = parseInt(p.golsMandante);
      const golsVisitante = parseInt(p.golsVisitante);
      const isLimpar = isNaN(golsMandante) && isNaN(golsVisitante);

      if (!isLimpar && (isNaN(golsMandante) || isNaN(golsVisitante))) return;

      const token = localStorage.getItem("token");
      const res = await fetch(`/api/partidas/${partidaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(
          isLimpar
            ? { golsMandante: null, golsVisitante: null }
            : { golsMandante, golsVisitante }
        ),
      });
      if (!res.ok) return;
      const data = await res.json();
      const atualizada = data.partida;
      setPartidas((prev) =>
        prev.map((pa) =>
          pa.id === partidaId
            ? { ...pa, golsMandante: atualizada.golsMandante, golsVisitante: atualizada.golsVisitante, encerrada: atualizada.encerrada }
            : pa
        )
      );
      recalcularMataMata();
    } catch {
      // ignore
    } finally {
      setSalvando((prev) => {
        const next = new Set(prev);
        next.delete(partidaId);
        return next;
      });
    }
  }

  async function salvarKnockout(partidaId: number) {
    setSalvandoKnockout((prev) => new Set(prev).add(partidaId));
    try {
      const p = knockoutPlacares[partidaId];
      if (!p) return;
      const golsMandante = parseInt(p.golsMandante);
      const golsVisitante = parseInt(p.golsVisitante);
      const isLimpar = isNaN(golsMandante) && isNaN(golsVisitante);
      if (!isLimpar && (isNaN(golsMandante) || isNaN(golsVisitante))) return;

      const penaltisMandante = p.penaltisMandante !== "" ? parseInt(p.penaltisMandante) : null;
      const penaltisVisitante = p.penaltisVisitante !== "" ? parseInt(p.penaltisVisitante) : null;

      const body: Record<string, unknown> = {
        partidaId,
        golsMandante: isLimpar ? null : golsMandante,
        golsVisitante: isLimpar ? null : golsVisitante,
      };
      if (penaltisMandante !== null) body.penaltisMandante = penaltisMandante;
      if (penaltisVisitante !== null) body.penaltisVisitante = penaltisVisitante;

      const token = localStorage.getItem("token");
      await fetch("/api/resultados-oficiais", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      recalcularMataMata();
    } catch {
      // ignore
    } finally {
      setSalvandoKnockout((prev) => {
        const next = new Set(prev);
        next.delete(partidaId);
        return next;
      });
    }
  }

  const partidasPorDia = partidas.reduce<Record<string, Partida[]>>((acc, p) => {
    const chave = formatarData(p.dataHora);
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(p);
    return acc;
  }, {});

  if (!role) {
    return (
      <div className="min-h-screen">
        <NavHeader />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
          <IconShield className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <h2 className="mt-4 text-2xl font-bold">Acesso restrito</h2>
          <p className="mt-2 text-zinc-500">
            Apenas administradores podem acessar esta página.
          </p>
        </main>
      </div>
    );
  }

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <a
          href="/admin"
          className="inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Voltar
        </a>
        <h1 className="mt-2 text-3xl font-bold">Resultados Oficiais</h1>
        <p className="mt-1 text-zinc-500">
          Cadastre os resultados reais das partidas
        </p>

        {fasesVisiveis.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {fasesVisiveis.map((fase) => (
              <button
                key={fase.key}
                onClick={() => {
                  document.getElementById(`fase-${fase.key}`)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                {fase.label}
              </button>
            ))}
          </div>
        )}

        <h2 className="mt-10 text-2xl font-bold">Fases de Grupos</h2>
        <div className="mt-6 space-y-8">
          {Object.entries(partidasPorDia).map(([data, jogos]) => (
            <section key={data}>
              <h2 className="mb-4 text-lg font-bold capitalize">{formatarDataAgrupamento(jogos[0].dataHora)}</h2>
              <div className="space-y-3">
                {jogos.map((p) => {
                  const golsM = placares[p.id]?.golsMandante ?? "";
                  const golsV = placares[p.id]?.golsVisitante ?? "";
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-zinc-200 bg-white p-4 transition-shadow dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
                    >
                      <div className="hidden md:block">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                            <FlagIcon codigo={p.mandante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
                            <span className="truncate font-medium sm:text-base">{p.mandante.nome}</span>
                          </div>

                          {isAdmin ? (
                            <div className="flex items-center gap-2 sm:gap-3">
                              <input
                                type="number"
                                min="0"
                                max="99"
                                value={golsM}
                                onChange={(e) =>
                                  setPlacares((prev) => ({
                                    ...prev,
                                    [p.id]: { golsMandante: e.target.value, golsVisitante: prev[p.id]?.golsVisitante ?? "" },
                                  }))
                                }
                                onBlur={() => autoSalvar(p.id)}
                                className={`w-14 rounded-lg border border-zinc-300 px-2 py-1.5 text-center text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:w-16 sm:text-lg ${salvando.has(p.id) ? "opacity-50" : ""}`}
                              />
                              <span className="text-sm text-zinc-400 sm:text-base">x</span>
                              <input
                                type="number"
                                min="0"
                                max="99"
                                value={golsV}
                                onChange={(e) =>
                                  setPlacares((prev) => ({
                                    ...prev,
                                    [p.id]: { golsMandante: prev[p.id]?.golsMandante ?? "", golsVisitante: e.target.value },
                                  }))
                                }
                                onBlur={() => autoSalvar(p.id)}
                                className={`w-14 rounded-lg border border-zinc-300 px-2 py-1.5 text-center text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:w-16 sm:text-lg ${salvando.has(p.id) ? "opacity-50" : ""}`}
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
                            <span className="truncate text-right font-medium sm:text-base">{p.visitante.nome}</span>
                            <FlagIcon codigo={p.visitante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
                          </div>
                        </div>

                        <div className="mt-4 border-t border-zinc-300/30 dark:border-zinc-700/30" />
                        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 sm:gap-4 sm:text-sm">
                          <span className="font-mono">J{p.id}</span>
                          <span className="text-zinc-300">|</span>
                          <span>{formatarData(p.dataHora)}</span>
                          <span className="inline-flex items-center gap-1">
                            <IconClock className="h-3.5 w-3.5" />
                            {formatarHora(p.dataHora)}
                          </span>
                          <span className="text-zinc-300">|</span>
                          <span className="inline-flex items-center gap-1">
                            <IconMapPin className="h-3.5 w-3.5" />
                            {p.estadio.nome}
                          </span>
                          <span className="text-zinc-400">Grupo {p.grupoId}</span>
                          {p.encerrada && (
                            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                              Encerrada
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="md:hidden">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <FlagIcon codigo={p.mandante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />
                            <span className="truncate text-sm font-medium">{p.mandante.nome}</span>
                          </div>
                          {isAdmin ? (
                            <input type="number" min="0" max="99"
                              value={golsM}
                              onChange={(e) =>
                                setPlacares((prev) => ({
                                  ...prev,
                                  [p.id]: { golsMandante: e.target.value, golsVisitante: prev[p.id]?.golsVisitante ?? "" },
                                }))
                              }
                              onBlur={() => autoSalvar(p.id)}
                              className={`w-12 rounded-lg border border-zinc-300 px-2 py-1 text-center text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 ${salvando.has(p.id) ? "opacity-50" : ""}`}
                            />
                          ) : (
                            <span className="text-sm font-bold">{p.golsMandante ?? "-"}</span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <FlagIcon codigo={p.visitante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />
                            <span className="truncate text-sm font-medium">{p.visitante.nome}</span>
                          </div>
                          {isAdmin ? (
                            <input type="number" min="0" max="99"
                              value={golsV}
                              onChange={(e) =>
                                setPlacares((prev) => ({
                                  ...prev,
                                  [p.id]: { golsMandante: prev[p.id]?.golsMandante ?? "", golsVisitante: e.target.value },
                                }))
                              }
                              onBlur={() => autoSalvar(p.id)}
                              className={`w-12 rounded-lg border border-zinc-300 px-2 py-1 text-center text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 ${salvando.has(p.id) ? "opacity-50" : ""}`}
                            />
                          ) : (
                            <span className="text-sm font-bold">{p.golsVisitante ?? "-"}</span>
                          )}
                        </div>
                        <div className="my-2 border-t border-zinc-300/30 dark:border-zinc-700/30" />
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                          <span className="font-mono">J{p.id}</span>
                          <span className="text-zinc-300">|</span>
                          <span>{formatarData(p.dataHora)}</span>
                          <span className="inline-flex items-center gap-1">
                            <IconClock className="h-3 w-3" />
                            {formatarHora(p.dataHora)}
                          </span>
                          <span className="text-zinc-300">|</span>
                          <span className="inline-flex items-center gap-1">
                            <IconMapPin className="h-3 w-3" />
                            {p.estadio.nome}
                          </span>
                          <span className="text-zinc-400">Grupo {p.grupoId}</span>
                          {p.encerrada && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                              Encerrada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Mata‑mata */}
        {loadingKnockout ? (
          <div className="mt-12">
            <SkeletonMataMata />
          </div>
        ) : resultadoMataMata ? (
          <div className="mt-12 space-y-10">
            <h2 className="text-2xl font-bold">Fase Eliminatória</h2>
            {resultadoMataMata.fases.map((fase) => {
              const todasNulas = fase.partidas.every((p) => !p.mandante && !p.visitante);
              if (todasNulas) return null;
              return (
                <section key={fase.key} id={`fase-${fase.key}`}>
                  <h3 className="mb-4 text-lg font-bold">{fase.label}</h3>
                  <div className="space-y-3">
                    {fase.partidas.map((p) => {
                      if (!p.mandante && !p.visitante) return null;
                      const golsM = knockoutPlacares[p.numero]?.golsMandante;
                      const golsV = knockoutPlacares[p.numero]?.golsVisitante;
                      const placarEmpatado = isAdmin && p.mandante && p.visitante && golsM !== "" && golsV !== "" && !isNaN(Number(golsM)) && !isNaN(Number(golsV)) && Number(golsM) === Number(golsV);
                      return (
                        <div
                          key={p.numero}
                          className="rounded-xl border border-zinc-200 bg-white p-4 transition-shadow dark:border-zinc-800 dark:bg-zinc-900 sm:p-6"
                        >
                          <div className="hidden md:block">
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                              <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                                {p.mandante ? (
                                  <>
                                    <FlagIcon codigo={p.mandante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
                                    <span className="truncate font-medium sm:text-base">{p.mandante.nome}</span>
                                  </>
                                ) : (
                                  <span className="text-sm italic text-zinc-400">A definir</span>
                                )}
                              </div>

                              {isAdmin && p.mandante && p.visitante ? (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <input
                                      type="number"
                                      min="0"
                                      max="99"
                                      value={knockoutPlacares[p.numero]?.golsMandante ?? ""}
                                      onChange={(e) =>
                                        setKnockoutPlacares((prev) => ({
                                          ...prev,
                                          [p.numero]: { golsMandante: e.target.value, golsVisitante: prev[p.numero]?.golsVisitante ?? "", penaltisMandante: prev[p.numero]?.penaltisMandante ?? "", penaltisVisitante: prev[p.numero]?.penaltisVisitante ?? "" },
                                        }))
                                      }
                                      onBlur={() => salvarKnockout(p.numero)}
                                      className={`w-14 rounded-lg border border-zinc-300 px-2 py-1.5 text-center text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:w-16 sm:text-lg ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                    />
                                    <span className="text-sm text-zinc-400 sm:text-base">x</span>
                                    <input
                                      type="number"
                                      min="0"
                                      max="99"
                                      value={knockoutPlacares[p.numero]?.golsVisitante ?? ""}
                                      onChange={(e) =>
                                        setKnockoutPlacares((prev) => ({
                                          ...prev,
                                          [p.numero]: { golsMandante: prev[p.numero]?.golsMandante ?? "", golsVisitante: e.target.value, penaltisMandante: prev[p.numero]?.penaltisMandante ?? "", penaltisVisitante: prev[p.numero]?.penaltisVisitante ?? "" },
                                        }))
                                      }
                                      onBlur={() => salvarKnockout(p.numero)}
                                      className={`w-14 rounded-lg border border-zinc-300 px-2 py-1.5 text-center text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:w-16 sm:text-lg ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                    />
                                  </div>
                                  {placarEmpatado && (
                                    <div className="mt-1 flex flex-col items-center gap-0.5">
                                      <span className="text-xs text-zinc-400">Penáltis</span>
                                      <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
                                        {p.mandante && <FlagIcon codigo={p.mandante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />}
                                        <input
                                        type="number"
                                        min="0"
                                        max="99"
                                        value={knockoutPlacares[p.numero]?.penaltisMandante ?? ""}
                                        onChange={(e) =>
                                          setKnockoutPlacares((prev) => ({
                                            ...prev,
                                            [p.numero]: { golsMandante: prev[p.numero]?.golsMandante ?? "", golsVisitante: prev[p.numero]?.golsVisitante ?? "", penaltisMandante: e.target.value, penaltisVisitante: prev[p.numero]?.penaltisVisitante ?? "" },
                                          }))
                                        }
                                        onBlur={() => salvarKnockout(p.numero)}
                                        className={`w-10 rounded border border-zinc-300 px-1.5 py-1 text-center text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:w-12 ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                      />
                                      <span className="text-zinc-400">x</span>
                                      <input
                                        type="number"
                                        min="0"
                                        max="99"
                                        value={knockoutPlacares[p.numero]?.penaltisVisitante ?? ""}
                                        onChange={(e) =>
                                          setKnockoutPlacares((prev) => ({
                                            ...prev,
                                            [p.numero]: { golsMandante: prev[p.numero]?.golsMandante ?? "", golsVisitante: prev[p.numero]?.golsVisitante ?? "", penaltisMandante: prev[p.numero]?.penaltisMandante ?? "", penaltisVisitante: e.target.value },
                                          }))
                                        }
                                        onBlur={() => salvarKnockout(p.numero)}
                                        className={`w-10 rounded border border-zinc-300 px-1.5 py-1 text-center text-xs focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 sm:w-12 ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                      />
                                      {p.visitante && <FlagIcon codigo={p.visitante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />}
                                      </div>
                                      <div className="flex md:hidden items-center gap-2">
                                        {p.mandante && <FlagIcon codigo={p.mandante.codigoPais} className="h-4 w-auto shrink-0 rounded-sm" />}
                                        <input
                                        type="number"
                                        min="0"
                                        max="99"
                                        value={knockoutPlacares[p.numero]?.penaltisMandante ?? ""}
                                        onChange={(e) =>
                                          setKnockoutPlacares((prev) => ({
                                            ...prev,
                                            [p.numero]: { golsMandante: prev[p.numero]?.golsMandante ?? "", golsVisitante: prev[p.numero]?.golsVisitante ?? "", penaltisMandante: e.target.value, penaltisVisitante: prev[p.numero]?.penaltisVisitante ?? "" },
                                          }))
                                        }
                                        onBlur={() => salvarKnockout(p.numero)}
                                        className={`w-8 rounded border border-zinc-300 px-1 py-0.5 text-center text-xs dark:border-zinc-700 dark:bg-zinc-800 ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                      />
                                      <span className="text-zinc-400">x</span>
                                      <input
                                        type="number"
                                        min="0"
                                        max="99"
                                        value={knockoutPlacares[p.numero]?.penaltisVisitante ?? ""}
                                        onChange={(e) =>
                                          setKnockoutPlacares((prev) => ({
                                            ...prev,
                                            [p.numero]: { golsMandante: prev[p.numero]?.golsMandante ?? "", golsVisitante: prev[p.numero]?.golsVisitante ?? "", penaltisMandante: prev[p.numero]?.penaltisMandante ?? "", penaltisVisitante: e.target.value },
                                          }))
                                        }
                                        onBlur={() => salvarKnockout(p.numero)}
                                        className={`w-8 rounded border border-zinc-300 px-1 py-0.5 text-center text-xs dark:border-zinc-700 dark:bg-zinc-800 ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                      />
                                      {p.visitante && <FlagIcon codigo={p.visitante.codigoPais} className="h-4 w-auto shrink-0 rounded-sm" />}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <span className="min-w-[3.5rem] text-center text-lg font-bold sm:min-w-[4rem] sm:text-xl">
                                      {p.golsMandante !== null ? p.golsMandante : "-"}
                                    </span>
                                    <span className="text-sm text-zinc-400 sm:text-base">x</span>
                                    <span className="min-w-[3.5rem] text-center text-lg font-bold sm:min-w-[4rem] sm:text-xl">
                                      {p.golsVisitante !== null ? p.golsVisitante : "-"}
                                    </span>
                                  </div>
                                  {p.penaltisMandante !== null && p.penaltisVisitante !== null && (
                                    <span className="text-xs text-zinc-400">
                                      Penáltis: {p.penaltisMandante} x {p.penaltisVisitante}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3">
                                {p.visitante ? (
                                  <>
                                    <span className="truncate text-right font-medium sm:text-base">{p.visitante.nome}</span>
                                    <FlagIcon codigo={p.visitante.codigoPais} className="h-6 w-auto rounded-sm sm:h-8" />
                                  </>
                                ) : (
                                  <span className="text-sm italic text-zinc-400">A definir</span>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 border-t border-zinc-300/30 dark:border-zinc-700/30" />
                            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500 sm:gap-4 sm:text-sm">
                              <span className="font-mono">J{p.numero}</span>
                              <span className="text-zinc-300">|</span>
                              <span>{formatarData(p.dataHora)}</span>
                              <span className="inline-flex items-center gap-1">
                                <IconClock className="h-3.5 w-3.5" />
                                {formatarHora(p.dataHora)}
                              </span>
                              {p.estadio && (
                                <>
                                  <span className="text-zinc-300">|</span>
                                  <span className="inline-flex items-center gap-1">
                                    <IconMapPin className="h-3.5 w-3.5" />
                                    {p.estadio.nome}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="md:hidden">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                {p.mandante ? (
                                  <>
                                    <FlagIcon codigo={p.mandante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />
                                    <span className="truncate text-sm font-medium">{p.mandante.nome}</span>
                                  </>
                                ) : (
                                  <span className="text-sm italic text-zinc-400">A definir</span>
                                )}
                              </div>
                              {isAdmin && p.mandante && p.visitante ? (
                                <input type="number" min="0" max="99"
                                  value={knockoutPlacares[p.numero]?.golsMandante ?? ""}
                                  onChange={(e) =>
                                    setKnockoutPlacares((prev) => ({
                                      ...prev,
                                      [p.numero]: { golsMandante: e.target.value, golsVisitante: prev[p.numero]?.golsVisitante ?? "", penaltisMandante: prev[p.numero]?.penaltisMandante ?? "", penaltisVisitante: prev[p.numero]?.penaltisVisitante ?? "" },
                                    }))
                                  }
                                  onBlur={() => salvarKnockout(p.numero)}
                                  className={`w-12 rounded-lg border border-zinc-300 px-2 py-1 text-center text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                />
                              ) : (
                                <span className="text-sm font-bold">{p.golsMandante !== null ? p.golsMandante : "-"}</span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                {p.visitante ? (
                                  <>
                                    <FlagIcon codigo={p.visitante.codigoPais} className="h-5 w-auto shrink-0 rounded-sm" />
                                    <span className="truncate text-sm font-medium">{p.visitante.nome}</span>
                                  </>
                                ) : (
                                  <span className="text-sm italic text-zinc-400">A definir</span>
                                )}
                              </div>
                              {isAdmin && p.mandante && p.visitante ? (
                                <input type="number" min="0" max="99"
                                  value={knockoutPlacares[p.numero]?.golsVisitante ?? ""}
                                  onChange={(e) =>
                                    setKnockoutPlacares((prev) => ({
                                      ...prev,
                                      [p.numero]: { golsMandante: prev[p.numero]?.golsMandante ?? "", golsVisitante: e.target.value, penaltisMandante: prev[p.numero]?.penaltisMandante ?? "", penaltisVisitante: prev[p.numero]?.penaltisVisitante ?? "" },
                                    }))
                                  }
                                  onBlur={() => salvarKnockout(p.numero)}
                                  className={`w-12 rounded-lg border border-zinc-300 px-2 py-1 text-center text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                />
                              ) : (
                                <span className="text-sm font-bold">{p.golsVisitante !== null ? p.golsVisitante : "-"}</span>
                              )}
                            </div>
                            {isAdmin && p.mandante && p.visitante && placarEmpatado && (
                              <div className="mt-2 flex flex-col items-center gap-1">
                                <span className="text-xs text-zinc-400">Penáltis</span>
                                <div className="flex items-center gap-2">
                                  <FlagIcon codigo={p.mandante.codigoPais} className="h-4 w-auto shrink-0 rounded-sm" />
                                  <input type="number" min="0" max="99"
                                    value={knockoutPlacares[p.numero]?.penaltisMandante ?? ""}
                                    onChange={(e) =>
                                      setKnockoutPlacares((prev) => ({
                                        ...prev,
                                        [p.numero]: { golsMandante: prev[p.numero]?.golsMandante ?? "", golsVisitante: prev[p.numero]?.golsVisitante ?? "", penaltisMandante: e.target.value, penaltisVisitante: prev[p.numero]?.penaltisVisitante ?? "" },
                                      }))
                                    }
                                    onBlur={() => salvarKnockout(p.numero)}
                                    className={`w-8 rounded border border-zinc-300 px-1 py-0.5 text-center text-xs dark:border-zinc-700 dark:bg-zinc-800 ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                  />
                                  <span className="text-zinc-400">x</span>
                                  <input type="number" min="0" max="99"
                                    value={knockoutPlacares[p.numero]?.penaltisVisitante ?? ""}
                                    onChange={(e) =>
                                      setKnockoutPlacares((prev) => ({
                                        ...prev,
                                        [p.numero]: { golsMandante: prev[p.numero]?.golsMandante ?? "", golsVisitante: prev[p.numero]?.golsVisitante ?? "", penaltisMandante: prev[p.numero]?.penaltisMandante ?? "", penaltisVisitante: e.target.value },
                                      }))
                                    }
                                    onBlur={() => salvarKnockout(p.numero)}
                                    className={`w-8 rounded border border-zinc-300 px-1 py-0.5 text-center text-xs dark:border-zinc-700 dark:bg-zinc-800 ${salvandoKnockout.has(p.numero) ? "opacity-50" : ""}`}
                                  />
                                  <FlagIcon codigo={p.visitante.codigoPais} className="h-4 w-auto shrink-0 rounded-sm" />
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
                              {p.estadio && (
                                <>
                                  <span className="text-zinc-300">|</span>
                                  <span className="inline-flex items-center gap-1">
                                    <IconMapPin className="h-3 w-3" />
                                    {p.estadio.nome}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        ) : null}
      </main>
      </div>
    </PaginaAnimada>
  );
}
