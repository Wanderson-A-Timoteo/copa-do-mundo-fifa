"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconShield } from "@/components/Icons";
import { SkeletonMataMata } from "@/components/Skeleton";
import { formatarData } from "@/lib/format";
import { computeBracket, type GrupoStanding, type BracketResult } from "@/lib/compute-bracket";
import { formatoCopa } from "@/data/formato-copa";
import { GrupoPartidaDia, type GrupoPartida } from "@/components/admin/GrupoPartidaEditor";
import MataMataPartidaEditor from "@/components/admin/MataMataPartidaEditor";

export default function AdminOficialPage() {
  const router = useRouter();
  const [partidas, setPartidas] = useState<GrupoPartida[]>([]);
  const [placares, setPlacares] = useState<
    Record<number, { golsMandante: string; golsVisitante: string }>
  >({});
  const [role, setRole] = useState<string | null>(null);
  const [salvando, setSalvando] = useState<Set<number>>(new Set());
  const [resultadoMataMata, setResultadoMataMata] = useState<BracketResult | null>(null);
  const [loadingKnockout, setLoadingKnockout] = useState(true);
  const [knockoutPlacares, setKnockoutPlacares] = useState<
    Record<
      number,
      {
        golsMandante: string;
        golsVisitante: string;
        penaltisMandante: string;
        penaltisVisitante: string;
      }
    >
  >({});
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
      .then((r) => (r.ok ? r.json() : { user: null }))
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
        const ordenadas = d.partidas ?? [];
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

  const recalcularMataMata = useCallback((silent = false) => {
    if (!silent) setLoadingKnockout(true);

    Promise.all([fetch("/api/grupos"), fetch("/api/resultados-oficiais")])
      .then(([rGrupos, rResultados]) => Promise.all([rGrupos.json(), rResultados.json()]))
      .then(([dataGrupos, dataResultados]) => {
        const grupos: GrupoStanding[] = dataGrupos.grupos ?? [];
        const palpites = (dataResultados.resultados ?? []).map(
          (p: {
            partidaId: number;
            golsMandante: number | null;
            golsVisitante: number | null;
            penaltisMandante: number | null;
            penaltisVisitante: number | null;
          }) => ({
            partidaId: p.partidaId,
            golsMandante: p.golsMandante,
            golsVisitante: p.golsVisitante,
            penaltisMandante: p.penaltisMandante,
            penaltisVisitante: p.penaltisVisitante,
          }),
        );
        const r = computeBracket(formatoCopa, grupos, palpites);
        setResultadoMataMata(r);

        const ps: Record<
          number,
          {
            golsMandante: string;
            golsVisitante: string;
            penaltisMandante: string;
            penaltisVisitante: string;
          }
        > = {};
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

  useEffect(() => {
    recalcularMataMata();
  }, [recalcularMataMata]);

  const isAdmin = role === "ADMIN";

  const fasesVisiveis = useMemo(() => {
    if (!resultadoMataMata) return [];
    return resultadoMataMata.fases.filter((f) => f.partidas.some((p) => p.mandante || p.visitante));
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
          isLimpar ? { golsMandante: null, golsVisitante: null } : { golsMandante, golsVisitante },
        ),
      });
      if (!res.ok) return;
      const data = await res.json();
      const atualizada = data.partida;
      setPartidas((prev) =>
        prev.map((pa) =>
          pa.id === partidaId
            ? {
                ...pa,
                golsMandante: atualizada.golsMandante,
                golsVisitante: atualizada.golsVisitante,
                encerrada: atualizada.encerrada,
              }
            : pa,
        ),
      );
      recalcularMataMata(true);
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
      recalcularMataMata(true);
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

  const partidasPorDia = partidas.reduce<Record<string, GrupoPartida[]>>((acc, p, index) => {
    const chave = formatarData(p.dataHora);
    if (!acc[chave]) acc[chave] = [];
    p.numero = index + 1;
    acc[chave].push(p);
    return acc;
  }, {});

  if (!role) {
    return <div className="min-h-screen"></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
          <IconShield className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
          <h2 className="mt-4 text-2xl font-bold">Acesso restrito</h2>
          <p className="mt-2 text-zinc-500">Apenas administradores podem acessar esta página.</p>
        </main>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <a
        href="/admin"
        className="inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        ← Voltar
      </a>
      <div className="mb-8">
        <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">
          Resultados Oficiais
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Cadastre os resultados reais das partidas
        </p>
      </div>

      {fasesVisiveis.length > 0 && (
        <div className="mt-6 mb-10 flex flex-wrap gap-2">
          {fasesVisiveis.map((fase) => (
            <button
              key={fase.key}
              onClick={() => {
                document.getElementById(`fase-${fase.key}`)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-xl border border-zinc-300/50 bg-white/50 px-4 py-2 text-sm font-medium text-zinc-700 backdrop-blur-sm transition-all hover:bg-zinc-100 hover:shadow-sm dark:border-zinc-700/50 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {fase.label}
            </button>
          ))}
        </div>
      )}

      <div className="sticky top-[60px] md:top-[64px] z-30 mb-6 py-4">
        <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Fase de Grupos</h2>
      </div>
      
      <div className="mt-6 space-y-10">
        {Object.entries(partidasPorDia).map(([data, jogos]) => (
          <GrupoPartidaDia
            key={data}
            jogos={jogos}
            placares={placares}
            onChangePlacar={(id, campo, valor) =>
              setPlacares((prev) => ({
                ...prev,
                [id]: {
                  golsMandante: prev[id]?.golsMandante ?? "",
                  golsVisitante: prev[id]?.golsVisitante ?? "",
                  [campo]: valor,
                },
              }))
            }
            isAdmin={isAdmin}
            salvando={salvando}
            onSalvar={autoSalvar}
          />
        ))}
      </div>

      {/* Mata‑mata */}
      {loadingKnockout ? (
        <div className="mt-12">
          <SkeletonMataMata />
        </div>
      ) : resultadoMataMata ? (
        <div className="mt-16 space-y-12">
          <div className="sticky top-[60px] md:top-[64px] z-30 mb-6 py-4">
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Fase Eliminatória</h2>
          </div>
          {resultadoMataMata.fases.map((fase) => {
            const todasNulas = fase.partidas.every((p) => !p.mandante && !p.visitante);
            if (todasNulas) return null;
            return (
              <section key={fase.key} id={`fase-${fase.key}`} className="relative scroll-mt-36">
                <div className="sticky top-[125px] md:top-[132px] z-20 mb-6 py-2">
                  <h3 className="text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400">{fase.label}</h3>
                </div>
                <div className="space-y-4 border-l-2 border-zinc-200 pl-4 dark:border-zinc-800 ml-2 md:ml-4">
                  {fase.partidas.map((p) => {
                    if (!p.mandante && !p.visitante) return null;
                    return (
                      <MataMataPartidaEditor
                        key={p.numero}
                        partida={p}
                        placar={
                          knockoutPlacares[p.numero] ?? {
                            golsMandante: "",
                            golsVisitante: "",
                            penaltisMandante: "",
                            penaltisVisitante: "",
                          }
                        }
                        onChangePlacar={(numero, campo, valor) =>
                          setKnockoutPlacares((prev) => ({
                            ...prev,
                            [numero]: {
                              golsMandante: prev[numero]?.golsMandante ?? "",
                              golsVisitante: prev[numero]?.golsVisitante ?? "",
                              penaltisMandante: prev[numero]?.penaltisMandante ?? "",
                              penaltisVisitante: prev[numero]?.penaltisVisitante ?? "",
                              [campo]: valor,
                            },
                          }))
                        }
                        isAdmin={isAdmin}
                        salvando={salvandoKnockout.has(p.numero)}
                        onSalvar={salvarKnockout}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
