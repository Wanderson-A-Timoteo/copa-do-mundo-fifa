"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { IconRepeat, IconBook, IconUser, IconShield } from "@/components/Icons";
import StickerCard from "@/components/StickerCard";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Pagination from "@/components/Pagination";
import type { TrocaItem, RepetidaGrupo, Aba } from "@/types";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pendente: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    aceita: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    recusada: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  const labels: Record<string, string> = {
    pendente: "Pendente",
    aceita: "Aceita",
    recusada: "Recusada",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${colors[status] || ""}`}>
      {labels[status] || status}
    </span>
  );
}

export default function TrocasPage() {
  const { user, getAuthHeaders } = useAuth();
  const { success, error } = useToast();
  const [aba, setAba] = useState<Aba>("disponiveis");
  const [trocas, setTrocas] = useState<TrocaItem[]>([]);
  const [repetidas, setRepetidas] = useState<RepetidaGrupo[]>([]);
  const [meuAlbumIds, setMeuAlbumIds] = useState<Set<number>>(new Set());
  const [carregando, setCarregando] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [countPendentes, setCountPendentes] = useState(0);
  const [countRecusadas, setCountRecusadas] = useState(0);

  const [paginaDisponiveis, setPaginaDisponiveis] = useState(0);
  const [paginaTrocas, setPaginaTrocas] = useState(0);

  const ITENS_POR_PAGINA_DISP = 20;
  const ITENS_POR_PAGINA_TROCAS = 10;

  const carregarTrocas = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      const [res, albumRes] = await Promise.all([
        fetch(`/api/trocas?tipo=${aba}`, { headers: getAuthHeaders() }),
        fetch("/api/album", { headers: getAuthHeaders() }),
      ]);
      if (res.ok) {
        const data = await res.json();
        setTrocas(data.trocas);
      }
      if (albumRes.ok) {
        const albumData = await albumRes.json();
        const ids = (albumData.album || []).map((a: { figurinhaId: number }) => a.figurinhaId);
        setMeuAlbumIds(new Set(ids));
      }
    } catch {
      // silent
    } finally {
      setCarregando(false);
    }
  }, [aba, user, getAuthHeaders]);

  const carregarRepetidas = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/figurinhas/repetidas");
      if (res.ok) {
        const data = await res.json();
        setRepetidas(data.repetidas);
      }
    } catch {
      // silent
    } finally {
      setCarregando(false);
    }
  }, []);

  const refreshCounts = useCallback(async () => {
    if (!user) return;
    const [pend, rec] = await Promise.all([
      fetch("/api/trocas?tipo=pendentes", { headers: getAuthHeaders() }).then((r) => r.json()),
      fetch("/api/trocas?tipo=recusadas", { headers: getAuthHeaders() }).then((r) => r.json()),
    ]);

    // Mostra bolinha amarela APENAS para trocas que exigem sua ação (você é o destinatário)
    setCountPendentes(
      (pend.trocas || []).filter(
        (t: { status: string; destinatario: { id: number } }) => t.destinatario.id === user.id,
      ).length,
    );

    const totalRecusadas = (rec.trocas || []).length;
    setCountRecusadas(totalRecusadas);
  }, [user, getAuthHeaders]);

  useEffect(() => {
    if (user) refreshCounts();
  }, [user, refreshCounts]);

  useEffect(() => {
    if (aba === "disponiveis") {
      carregarRepetidas();
    } else if (user) {
      carregarTrocas();
    } else {
      setCarregando(false);
    }
  }, [aba, user, carregarRepetidas, carregarTrocas]);

  // Limpa o badge se acessar a aba recusadas
  useEffect(() => {
    if (aba === "recusadas" && countRecusadas > 0) {
      localStorage.setItem("vistasRecusadas", countRecusadas.toString());
    }
  }, [aba, countRecusadas]);

  const aceitarTroca = async (id: number) => {
    const res = await fetch(`/api/trocas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ acao: "aceitar" }),
    });
    if (res.ok) {
      success("Troca aceita com sucesso!");
      carregarTrocas();
      refreshCounts();
    } else {
      error("Erro ao aceitar a troca.");
    }
  };

  const recusarTroca = async (id: number) => {
    const res = await fetch(`/api/trocas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ acao: "recusar" }),
    });
    if (res.ok) {
      error("Proposta recusada."); // Usa o toast vermelho (error) para dar feedback visual de recusa
      carregarTrocas();
      refreshCounts();
    } else {
      error("Erro ao recusar a troca.");
    }
  };

  const apagarTroca = async (id: number) => {
    const res = await fetch(`/api/trocas/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      success("Troca apagada do histórico.");

      // Ajusta o contador de vistas no localStorage para não quebrar a lógica de novas recusas
      const lastSeen = parseInt(localStorage.getItem("vistasRecusadas") || "0", 10);
      if (lastSeen > 0) {
        localStorage.setItem("vistasRecusadas", (lastSeen - 1).toString());
      }

      carregarTrocas();
      refreshCounts();
    } else {
      error("Erro ao apagar a troca.");
    }
  };

  const repetidasFiltradas = filtroBusca
    ? repetidas.filter(
        (r) =>
          r.figurinha.jogador?.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
          r.figurinha.selecao.nome.toLowerCase().includes(filtroBusca.toLowerCase()),
      )
    : repetidas;

  const totalPagDisp = Math.max(1, Math.ceil(repetidasFiltradas.length / ITENS_POR_PAGINA_DISP));
  const pagDispSegura = Math.min(paginaDisponiveis, totalPagDisp - 1);
  const pagDispItens = repetidasFiltradas.slice(
    pagDispSegura * ITENS_POR_PAGINA_DISP,
    (pagDispSegura + 1) * ITENS_POR_PAGINA_DISP,
  );

  const totalPagTrocas = Math.max(1, Math.ceil(trocas.length / ITENS_POR_PAGINA_TROCAS));
  const pagTrocasSegura = Math.min(paginaTrocas, totalPagTrocas - 1);
  const pagTrocasItens = trocas.slice(
    pagTrocasSegura * ITENS_POR_PAGINA_TROCAS,
    (pagTrocasSegura + 1) * ITENS_POR_PAGINA_TROCAS,
  );

  useEffect(() => {
    setPaginaDisponiveis(0);
  }, [filtroBusca]);

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Trocas</h1>
        <p className="mt-1 text-zinc-500">Encontre figurinhas para completar seu álbum</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(["disponiveis", "pendentes", "aceitas", "recusadas"] as const).map((t) => {
          const label =
            t === "disponiveis"
              ? "Disponíveis"
              : t === "pendentes"
                ? "Pendentes"
                : t === "aceitas"
                  ? "Aceitas"
                  : "Recusadas";

          let count = 0;
          if (t === "pendentes") {
            count = countPendentes;
          } else if (t === "recusadas") {
            const lastSeen =
              typeof window !== "undefined"
                ? parseInt(localStorage.getItem("vistasRecusadas") || "0", 10)
                : 0;
            count = Math.max(0, countRecusadas - lastSeen);
          }
          return (
            <button
              key={t}
              onClick={() => setAba(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                aba === t
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              {label}
              {count > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-zinc-50">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {aba === "disponiveis" && (
        <>
          <div className="mb-4">
            <div className="relative">
              <IconBook className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                placeholder="Buscar figurinha ou seleção..."
                className="w-full rounded-lg border border-zinc-300 bg-transparent py-2 pl-10 pr-4 text-sm outline-none transition-colors focus:border-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400"
              />
            </div>
          </div>

          {carregando ? (
            <div className="grid grid-cols-2 gap-2 min-[400px]:gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="mt-2 h-4 w-3/4" />
                  <Skeleton className="mt-1 h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : repetidasFiltradas.length === 0 ? (
            <div className="mt-16 text-center text-zinc-400">
              <IconRepeat className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-medium">
                {filtroBusca
                  ? "Nenhuma figurinha encontrada"
                  : "Nenhuma figurinha repetida disponível"}
              </p>
              <p className="mt-1 text-sm">
                {filtroBusca
                  ? "Tente outro termo de busca."
                  : "Volte mais tarde para ver novas ofertas."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 min-[400px]:gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {pagDispItens.map((grupo) => (
                <Link
                  key={grupo.figurinha.id}
                  href={`/trocas/repetidas/${grupo.figurinha.slug}`}
                  className="group"
                >
                  <StickerCard figurinha={grupo.figurinha} />
                </Link>
              ))}
            </div>
          )}
          <Pagination
            paginaAtual={paginaDisponiveis}
            totalItens={repetidasFiltradas.length}
            itensPorPagina={ITENS_POR_PAGINA_DISP}
            onPageChange={setPaginaDisponiveis}
          />
        </>
      )}

      {aba !== "disponiveis" && !user && (
        <div className="mt-16 text-center text-zinc-400">
          <IconBook className="mx-auto h-12 w-12" />
          <p className="mt-4 text-lg font-medium">Faça login para ver suas trocas</p>
          <Link
            href="/login"
            className="mt-2 inline-block text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Entrar
          </Link>
        </div>
      )}

      {aba !== "disponiveis" && user && carregando && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {aba !== "disponiveis" && user && !carregando && trocas.length === 0 && (
        <div className="mt-16 text-center text-zinc-400">
          <IconRepeat className="mx-auto h-12 w-12" />
          <p className="mt-4 text-lg font-medium">
            Nenhuma troca{" "}
            {aba === "pendentes" ? "pendente" : aba === "aceitas" ? "aceita" : "recusada"}
          </p>
          <p className="mt-1 text-sm">
            {aba === "pendentes"
              ? "Você não possui nenhuma troca aguardando ação."
              : aba === "aceitas"
                ? "Seu histórico de trocas aceitas está vazio."
                : "Seu histórico de trocas recusadas está vazio."}
          </p>
        </div>
      )}

      {aba !== "disponiveis" && user && !carregando && trocas.length > 0 && (
        <>
          <div className="space-y-4">
            {pagTrocasItens.map((troca) => {
              const isRecebida = troca.destinatario.id === user.id;
              const outroUsuario = isRecebida ? troca.remetente : troca.destinatario;

              return (
                <div
                  key={troca.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-100 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <IconUser className="h-4 w-4" />
                      <span>
                        {isRecebida ? "Oferta de" : "Enviada para"}{" "}
                        <strong className="text-zinc-700 dark:text-zinc-300">
                          {outroUsuario.nome}
                        </strong>
                      </span>
                    </div>
                    <StatusBadge status={troca.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="flex flex-col items-center sm:items-start">
                      <p className="mb-3 text-xs font-medium text-zinc-400">
                        {isRecebida ? "Oferecendo" : "Ofereceu"}
                      </p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4 w-full">
                        {troca.figurinhasOferecidas.map((of) => {
                          const jaPossui = isRecebida && meuAlbumIds.has(of.figurinha.id);
                          const isNova = isRecebida && !meuAlbumIds.has(of.figurinha.id);

                          return (
                            <div
                              key={of.figurinha.id}
                              className="relative w-[220px] sm:w-[200px] md:w-[240px]"
                            >
                              <div
                                className={`transition-all duration-300 ${isNova ? "ring-2 ring-emerald-500 ring-offset-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]" : jaPossui ? "opacity-75 grayscale-[30%]" : ""}`}
                              >
                                <StickerCard figurinha={of.figurinha} />
                              </div>

                              {isNova && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-bold text-zinc-50 shadow-md">
                                  ✨ Nova!
                                </div>
                              )}

                              {jaPossui && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap rounded-full bg-zinc-600 px-3 py-0.5 text-[10px] font-bold text-zinc-50 shadow-md">
                                  Já possui
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex flex-col items-center sm:items-start">
                      <p className="mb-3 text-xs font-medium text-zinc-400">Quer receber</p>
                      <div className="flex justify-center sm:justify-start w-full">
                        <div className="w-[220px] sm:w-[200px] md:w-[240px]">
                          <StickerCard figurinha={troca.figurinhaDesejada} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {troca.status === "pendente" && isRecebida && (
                    <div className="mt-4 flex flex-wrap sm:flex-nowrap gap-2">
                      <button
                        onClick={() => aceitarTroca(troca.id)}
                        className="w-full sm:w-auto rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      >
                        Aceitar Troca
                      </button>
                      <button
                        onClick={() => recusarTroca(troca.id)}
                        className="w-full sm:w-auto rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        Recusar
                      </button>
                    </div>
                  )}

                  {troca.status === "pendente" && !isRecebida && (
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                      <p className="text-xs text-zinc-400">
                        Aguardando resposta de {outroUsuario.nome}
                      </p>
                      <button
                        onClick={() => apagarTroca(troca.id)}
                        className="w-full sm:w-auto rounded-lg border border-red-200 text-red-600 px-4 py-2 text-xs font-bold transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/30"
                      >
                        Cancelar Solicitação
                      </button>
                    </div>
                  )}

                  {troca.status === "recusada" && (
                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                      <p className="text-xs font-medium text-red-600 dark:text-red-400">
                        {isRecebida
                          ? "Você recusou esta oferta."
                          : "Esta solicitação foi recusada."}
                      </p>
                      <button
                        onClick={() => apagarTroca(troca.id)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Apagar do Histórico
                      </button>
                    </div>
                  )}

                  {troca.status === "aceita" && (
                    <p className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <IconShield className="h-3 w-3" />
                      Troca concluída
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <Pagination
            paginaAtual={paginaTrocas}
            totalItens={trocas.length}
            itensPorPagina={ITENS_POR_PAGINA_TROCAS}
            onPageChange={setPaginaTrocas}
          />
        </>
      )}
    </main>
  );
}
