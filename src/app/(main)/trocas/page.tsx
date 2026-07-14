"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { IconRepeat, IconBook, IconUser, IconShield } from "@/components/Icons";
import StickerCard from "@/components/StickerCard";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
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
  const [aba, setAba] = useState<Aba>("disponiveis");
  const [trocas, setTrocas] = useState<TrocaItem[]>([]);
  const [repetidas, setRepetidas] = useState<RepetidaGrupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [pendentesRec, setPendentesRec] = useState(0);
  const [pendentesEnv, setPendentesEnv] = useState(0);
  const [bannerFechado, setBannerFechado] = useState(false);
  const [paginaDisponiveis, setPaginaDisponiveis] = useState(0);
  const [paginaTrocas, setPaginaTrocas] = useState(0);

  const ITENS_POR_PAGINA_DISP = 20;
  const ITENS_POR_PAGINA_TROCAS = 10;

  const carregarTrocas = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      const res = await fetch(`/api/trocas?tipo=${aba}`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setTrocas(data.trocas);
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
    const [rec, env] = await Promise.all([
      fetch("/api/trocas?tipo=recebidas", { headers: getAuthHeaders() }).then((r) => r.json()),
      fetch("/api/trocas?tipo=enviadas", { headers: getAuthHeaders() }).then((r) => r.json()),
    ]);
    setPendentesRec(
      (rec.trocas || []).filter((t: { status: string }) => t.status === "pendente").length,
    );
    setPendentesEnv(
      (env.trocas || []).filter((t: { status: string }) => t.status === "pendente").length,
    );
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

  const aceitarTroca = async (id: number) => {
    const res = await fetch(`/api/trocas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ acao: "aceitar" }),
    });
    if (res.ok) {
      carregarTrocas();
      refreshCounts();
    }
  };

  const recusarTroca = async (id: number) => {
    const res = await fetch(`/api/trocas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ acao: "recusar" }),
    });
    if (res.ok) {
      carregarTrocas();
      refreshCounts();
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

      {user && (pendentesRec > 0 || pendentesEnv > 0) && !bannerFechado && (
        <div className="relative mb-6 rounded-lg bg-emerald-50 px-4 py-3 pr-10 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <span className="font-medium">
            Você tem {pendentesRec + pendentesEnv} troca
            {pendentesRec + pendentesEnv !== 1 ? "s" : ""} pendente
            {pendentesRec + pendentesEnv !== 1 ? "s" : ""}
            {pendentesRec > 0 && ` (${pendentesRec} recebida${pendentesRec !== 1 ? "s" : ""})`}
            {pendentesEnv > 0 && ` (${pendentesEnv} enviada${pendentesEnv !== 1 ? "s" : ""})`}.
          </span>
          <button
            onClick={() => setBannerFechado(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-200"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-6 flex gap-2">
        {(["disponiveis", "recebidas", "enviadas"] as const).map((t) => {
          const label =
            t === "disponiveis" ? "Disponíveis" : t === "recebidas" ? "Recebidas" : "Enviadas";
          const pendentes = t === "recebidas" ? pendentesRec : t === "enviadas" ? pendentesEnv : 0;
          return (
            <button
              key={t}
              onClick={() => setAba(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                aba === t
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              {label}
              {pendentes > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {pendentes}
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
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

      {(aba === "recebidas" || aba === "enviadas") && !user && (
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

      {(aba === "recebidas" || aba === "enviadas") && user && carregando && (
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

      {(aba === "recebidas" || aba === "enviadas") &&
        user &&
        !carregando &&
        trocas.length === 0 && (
          <div className="mt-16 text-center text-zinc-400">
            <IconRepeat className="mx-auto h-12 w-12" />
            <p className="mt-4 text-lg font-medium">
              Nenhuma troca {aba === "recebidas" ? "recebida" : "enviada"}
            </p>
            <p className="mt-1 text-sm">
              {aba === "recebidas"
                ? "Quando alguém oferecer uma troca, ela aparecerá aqui."
                : "Vá até a aba Disponíveis e escolha uma figurinha para trocar."}
            </p>
          </div>
        )}

      {(aba === "recebidas" || aba === "enviadas") && user && !carregando && trocas.length > 0 && (
        <>
          <div className="space-y-4">
            {pagTrocasItens.map((troca) => {
              const isRecebida = aba === "recebidas";
              const outroUsuario = isRecebida ? troca.remetente : troca.destinatario;

              return (
                <div
                  key={troca.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center justify-between gap-4">
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

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-medium text-zinc-400">
                        {isRecebida ? "Oferecendo" : "Ofereceu"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {troca.figurinhasOferecidas.map((of) => (
                          <div key={of.figurinha.id} className="w-[140px]">
                            <StickerCard figurinha={of.figurinha} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-medium text-zinc-400">Quer receber</p>
                      <div className="w-[140px]">
                        <StickerCard figurinha={troca.figurinhaDesejada} />
                      </div>
                    </div>
                  </div>

                  {troca.status === "pendente" && isRecebida && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => aceitarTroca(troca.id)}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      >
                        Aceitar Troca
                      </button>
                      <button
                        onClick={() => recusarTroca(troca.id)}
                        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        Recusar
                      </button>
                    </div>
                  )}

                  {troca.status === "pendente" && !isRecebida && (
                    <p className="mt-3 text-xs text-zinc-400">
                      Aguardando resposta de {outroUsuario.nome}
                    </p>
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
