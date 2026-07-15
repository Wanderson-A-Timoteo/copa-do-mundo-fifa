"use client";

import { useEffect, useState, useCallback } from "react";
import { FlagIcon } from "@/components/FlagIcon";
import ModalLogin from "@/components/ModalLogin";
import ModalAlert from "@/components/ModalAlert";

import { IconClock, IconMapPin, IconLock } from "@/components/Icons";
import { formatarData, formatarHora } from "@/lib/format";
import type { ClassificacaoSelecao, PartidaResumo } from "@/types";
import type { BracketResult } from "@/lib/compute-bracket";
import PlacarCard from "@/components/PlacarCard";

export default function BolaoPage() {
  const [partidas, setPartidas] = useState<PartidaResumo[]>([]);
  const [bracket, setBracket] = useState<BracketResult | null>(null);
  const [placares, setPlacares] = useState<
    Record<
      number,
      {
        golsMandante: string;
        golsVisitante: string;
        penaltisMandante?: string;
        penaltisVisitante?: string;
      }
    >
  >({});
  const [token, setToken] = useState<string | null>(null);
  const [showModalLogin, setShowModalLogin] = useState(false);
  const [showModalClosed, setShowModalClosed] = useState(false);
  const [salvandoPartida, setSalvandoPartida] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const carregar = useCallback((silent = false) => {
    const t = localStorage.getItem("token");
    setToken(t);

    if (!silent) setLoading(true);
    if (!t) {
      setPartidas([]);
      setPlacares({});
      setLoading(false);
      return;
    }

    const headers: Record<string, string> = {};
    if (t) headers["Authorization"] = `Bearer ${t}`;

    const usuarioSalvo = localStorage.getItem("user");
    if (!usuarioSalvo) {
      setPartidas([]);
      setPlacares({});
      setLoading(false);
      return;
    }

    const user = JSON.parse(usuarioSalvo);
    if (!user?.id) {
      setPartidas([]);
      setPlacares({});
      setLoading(false);
      return;
    }

    fetch("/api/partidas?fase=GRUPOS")
      .then((r) => r.json())
      .then((d) => {
        setPartidas(d.partidas);

        // Also fetch Mata-Mata bracket
        fetch("/api/bracket/oficial")
          .then((rb) => rb.json())
          .then((db) => {
            if (db.bracket) setBracket(db.bracket);
          })
          .catch(() => {});

        Promise.all([
          fetch("/api/palpite", { headers }).then((r) => r.json()),
          fetch("/api/palpites/mata-mata", { headers }).then((r) => r.json()),
        ]).then(([palpiteData, palpiteMataData]) => {
          const p: Record<
            number,
            {
              golsMandante: string;
              golsVisitante: string;
              penaltisMandante?: string;
              penaltisVisitante?: string;
            }
          > = {};
          for (const partida of d.partidas) {
            const palpite = palpiteData.palpites?.find(
              (pp: { partidaId: number; golsMandante: number; golsVisitante: number }) =>
                pp.partidaId === partida.id,
            );
            if (palpite) {
              p[partida.id] = {
                golsMandante: String(palpite.golsMandante),
                golsVisitante: String(palpite.golsVisitante),
              };
            } else {
              p[partida.id] = { golsMandante: "", golsVisitante: "" };
            }
          }

          if (palpiteData.palpites) {
            for (const palpite of palpiteData.palpites) {
              if (!p[palpite.partidaId]) {
                p[palpite.partidaId] = {
                  golsMandante: String(palpite.golsMandante),
                  golsVisitante: String(palpite.golsVisitante),
                };
              }
            }
          }

          if (palpiteMataData.palpites) {
            for (const palpite of palpiteMataData.palpites) {
              p[palpite.partidaId] = {
                golsMandante: palpite.golsMandante !== null ? String(palpite.golsMandante) : "",
                golsVisitante: palpite.golsVisitante !== null ? String(palpite.golsVisitante) : "",
                penaltisMandante:
                  palpite.penaltisMandante !== null && palpite.penaltisMandante !== undefined
                    ? String(palpite.penaltisMandante)
                    : undefined,
                penaltisVisitante:
                  palpite.penaltisVisitante !== null && palpite.penaltisVisitante !== undefined
                    ? String(palpite.penaltisVisitante)
                    : undefined,
              };
            }
          }

          setPlacares(p);
          setLoading(false);
        });
      });
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atualizarPlacares = useCallback(
    (silent = false) => {
      carregar(silent);
    },
    [carregar],
  );

  const partidasPorDia = partidas.reduce<Record<string, PartidaResumo[]>>((acc, p) => {
    const chave = formatarData(p.dataHora);
    if (!acc[chave]) acc[chave] = [];
    acc[chave].push(p);
    return acc;
  }, {});

  async function autoSalvar(partidaId: number) {
    const t = localStorage.getItem("token");
    if (!t) return;
    const p = placares[partidaId];
    if (!p) return;
    const golsMandante = parseInt(p.golsMandante);
    const golsVisitante = parseInt(p.golsVisitante);
    const penaltisMandante = p.penaltisMandante ? parseInt(p.penaltisMandante) : undefined;
    const penaltisVisitante = p.penaltisVisitante ? parseInt(p.penaltisVisitante) : undefined;

    const isLimpar = isNaN(golsMandante) && isNaN(golsVisitante);

    if (!isLimpar && (isNaN(golsMandante) || isNaN(golsVisitante))) return;

    setSalvandoPartida(partidaId);
    try {
      const isMataMata = !partidas.some((p) => p.id === partidaId);
      const url = isMataMata ? "/api/palpites/mata-mata" : "/api/palpite";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify(
          isLimpar
            ? { partidaId, golsMandante: null, golsVisitante: null }
            : { partidaId, golsMandante, golsVisitante, penaltisMandante, penaltisVisitante },
        ),
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
        setShowModalLogin(true);
        return;
      }
      if (!res.ok) return;
      // Optionally update visual state here instead of full refetch, but a simple refetch ensures consistency.
    } catch {
      // ignore
    } finally {
      setSalvandoPartida(null);
    }
  }

  return (
    <>
      <main className="mx-auto w-full max-w-[100vw] overflow-x-hidden px-4 py-8 sm:max-w-5xl sm:px-6">
        <a
          href="/tabela"
          className="inline-block text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
        >
          ← Voltar
        </a>
        <h1 className="mt-2 text-3xl font-bold">Bolão Oficial</h1>
        <p className="mt-1 text-zinc-500">Faça seus palpites oficiais e concorra no ranking</p>

        {!token ? (
          <div className="py-16 text-center">
            <p className="text-lg text-zinc-500">Faça login para palpitar nos jogos</p>
            <button
              onClick={() => setShowModalLogin(true)}
              className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Fazer Login
            </button>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {Object.keys(partidasPorDia).length === 0 ? (
              <p className="text-zinc-500">Nenhum jogo encontrado.</p>
            ) : (
              Object.entries(partidasPorDia).map(([data, jogos]) => (
                <section key={data}>
                  <h2 className="mb-4 text-lg font-bold text-zinc-800 dark:text-zinc-200">
                    {data}
                  </h2>
                  <div className="space-y-3">
                    {jogos.map((p) => {
                      const golsM = placares[p.id]?.golsMandante ?? "";
                      const golsV = placares[p.id]?.golsVisitante ?? "";
                      const isBloqueado = new Date(p.dataHora) <= new Date();

                      const numeroJogo = partidas.findIndex((x) => x.id === p.id) + 1;

                      return (
                        <div key={p.id} className="relative">
                          {isBloqueado && (
                            <div className="absolute -top-3 right-2 z-10 flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-1 text-[10px] text-zinc-200">
                              <IconLock className="h-3 w-3" />
                              <span>Encerrado</span>
                            </div>
                          )}
                          <PlacarCard
                            partida={p}
                            numero={numeroJogo}
                            golsMandante={golsM}
                            golsVisitante={golsV}
                            disabled={!token || isBloqueado}
                            onChangeMandante={(v) =>
                              setPlacares((prev) => ({
                                ...prev,
                                [p.id]: {
                                  golsMandante: v,
                                  golsVisitante: prev[p.id]?.golsVisitante ?? "",
                                },
                              }))
                            }
                            onChangeVisitante={(v) =>
                              setPlacares((prev) => ({
                                ...prev,
                                [p.id]: {
                                  golsMandante: prev[p.id]?.golsMandante ?? "",
                                  golsVisitante: v,
                                },
                              }))
                            }
                            onBlur={() => autoSalvar(p.id)}
                            onOverlayClick={() => {
                              if (isBloqueado) {
                                setShowModalClosed(true);
                              } else if (!token) {
                                setShowModalLogin(true);
                              }
                            }}
                            salvando={salvandoPartida === p.id}
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {bracket && (
          <div className="mt-16 border-t border-zinc-200 pt-10 dark:border-zinc-800">
            <h2 className="mb-4 mt-10 text-xl font-bold">Fase Eliminatória</h2>
            <div className="space-y-10">
              {bracket.fases.map((fase) => {
                const temPartidas = fase.partidas.some((p) => true);
                if (!temPartidas) return null;

                return (
                  <section key={fase.key}>
                    <h3 className="mb-4 text-lg font-bold text-zinc-800 dark:text-zinc-200">
                      {fase.label}
                    </h3>
                    <div className="space-y-3">
                      {fase.partidas.map((p) => {
                        // Parse into PartidaResumo shape for PlacarCard
                        const partidaFake = {
                          id: p.numero, // Assuming ID is same as numero for saving
                          fase: p.fase,
                          dataHora: p.dataHora,
                          estadio: {
                            nome: p.estadio?.nome || "",
                            cidade: p.estadio?.cidade || "",
                            pais: "",
                          },
                          mandante: p.mandante ? {
                            id: p.mandante.id,
                            nome: p.mandante.nome,
                            codigoPais: p.mandante.codigoPais,
                          } : undefined,
                          visitante: p.visitante ? {
                            id: p.visitante.id,
                            nome: p.visitante.nome,
                            codigoPais: p.visitante.codigoPais,
                          } : undefined,
                          grupoId: null,
                          encerrada: p.resolvida,
                        } as unknown as PartidaResumo;

                        const golsM = placares[p.numero]?.golsMandante ?? "";
                        const golsV = placares[p.numero]?.golsVisitante ?? "";
                        const penM = placares[p.numero]?.penaltisMandante ?? "";
                        const penV = placares[p.numero]?.penaltisVisitante ?? "";
                        const isBloqueado = new Date(p.dataHora) <= new Date();
                        const isEmpate =
                          golsM !== "" && golsV !== "" && Number(golsM) === Number(golsV);

                        return (
                          <div key={p.numero} className="relative">
                            {isBloqueado && (
                              <div className="absolute -top-3 right-2 z-10 flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-1 text-[10px] text-zinc-200">
                                <IconLock className="h-3 w-3" />
                                <span>Encerrado</span>
                              </div>
                            )}
                            <PlacarCard
                              partida={partidaFake}
                              numero={p.numero}
                              golsMandante={golsM}
                              golsVisitante={golsV}
                              disabled={!token || isBloqueado}
                              onChangeMandante={(v) =>
                                setPlacares((prev) => ({
                                  ...prev,
                                  [p.numero]: {
                                    ...prev[p.numero],
                                    golsMandante: v,
                                    golsVisitante: prev[p.numero]?.golsVisitante ?? "",
                                  },
                                }))
                              }
                              onChangeVisitante={(v) =>
                                setPlacares((prev) => ({
                                  ...prev,
                                  [p.numero]: {
                                    ...prev[p.numero],
                                    golsMandante: prev[p.numero]?.golsMandante ?? "",
                                    golsVisitante: v,
                                  },
                                }))
                              }
                              empate={isEmpate}
                              penaltisMandante={penM}
                              penaltisVisitante={penV}
                              onChangePenaltisMandante={(v) =>
                                setPlacares((prev) => ({
                                  ...prev,
                                  [p.numero]: {
                                    ...prev[p.numero],
                                    golsMandante: prev[p.numero]?.golsMandante ?? "",
                                    golsVisitante: prev[p.numero]?.golsVisitante ?? "",
                                    penaltisMandante: v,
                                  },
                                }))
                              }
                              onChangePenaltisVisitante={(v) =>
                                setPlacares((prev) => ({
                                  ...prev,
                                  [p.numero]: {
                                    ...prev[p.numero],
                                    golsMandante: prev[p.numero]?.golsMandante ?? "",
                                    golsVisitante: prev[p.numero]?.golsVisitante ?? "",
                                    penaltisVisitante: v,
                                  },
                                }))
                              }
                              onBlur={() => autoSalvar(p.numero)}
                              onOverlayClick={() => {
                                if (isBloqueado) {
                                  setShowModalClosed(true);
                                } else if (!token) {
                                  setShowModalLogin(true);
                                }
                              }}
                              salvando={salvandoPartida === p.numero}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {showModalLogin && <ModalLogin onClose={() => setShowModalLogin(false)} />}
      {showModalClosed && (
        <ModalAlert
          title="Acesso negado"
          message="Os palpites para este jogo já foram encerrados."
          onClose={() => setShowModalClosed(false)}
        />
      )}
    </>
  );
}
