"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import NavHeader from "@/components/NavHeader";
import PaginaAnimada from "@/components/PaginaAnimada";
import { FlagIcon } from "@/components/FlagIcon";
import { IconRepeat, IconBook, IconUser, IconShield } from "@/components/Icons";
import PlayerCard from "@/components/PlayerCard";
import { Skeleton } from "@/components/Skeleton";

interface FigurinhaResumo {
  id: number;
  slug: string;
  numero: number;
  raridade: string;
  selecao: { id: number; nome: string; codigoPais: string | null; corPrimaria: string | null };
  jogador: { nome: string; posicao: string; fotoUrl: string | null; numeroCamisa: number | null; dataNascimento: string | null; altura: number | null; peso: number | null; figurinha: { raridade: string } | null } | null;
}

interface TrocaItem {
  id: number;
  status: string;
  createdAt: string;
  remetente: { id: number; nome: string };
  destinatario: { id: number; nome: string };
  figurinhaDesejada: FigurinhaResumo;
  figurinhasOferecidas: { figurinha: FigurinhaResumo }[];
}

interface RepetidaGrupo {
  figurinha: FigurinhaResumo;
  totalUsuarios: number;
  usuarios: { id: number; nome: string }[];
}

type Aba = "disponiveis" | "recebidas" | "enviadas";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

function MiniCard({ figurinha, small }: { figurinha: FigurinhaResumo; small?: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex shrink-0 items-center justify-center">
        {figurinha.jogador ? (
          figurinha.jogador.fotoUrl ? (
            <img src={figurinha.jogador.fotoUrl} alt="" className="h-10 w-8 rounded object-cover" />
          ) : (
            <div className="flex h-10 w-8 items-center justify-center rounded bg-zinc-300 text-[8px] font-bold text-white dark:bg-zinc-600">
              {figurinha.jogador.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )
        ) : (
          <div className="flex h-10 w-8 items-center justify-center rounded bg-zinc-200 dark:bg-zinc-700">
            <FlagIcon codigo={figurinha.selecao.codigoPais} className="h-5 w-auto rounded-sm" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${small ? "text-xs" : "text-sm"}`}>
          {figurinha.jogador?.nome || figurinha.selecao.nome}
        </p>
        <p className="text-[10px] text-zinc-400">
          {figurinha.jogador ? `#${figurinha.jogador.numeroCamisa ?? "—"}` : `#${figurinha.numero}`}
        </p>
      </div>
    </div>
  );
}

export default function TrocasPage() {
  const [aba, setAba] = useState<Aba>("disponiveis");
  const [trocas, setTrocas] = useState<TrocaItem[]>([]);
  const [repetidas, setRepetidas] = useState<RepetidaGrupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState<{ id: number; nome: string } | null>(null);
  const [filtroBusca, setFiltroBusca] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const cached = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
    if (cached) setUser(cached);
  }, []);

  const carregarTrocas = useCallback(async () => {
    if (!user) return;
    setCarregando(true);
    try {
      const res = await fetch(`/api/trocas?tipo=${aba}`, { headers: { ...getAuthHeaders() } });
      if (res.ok) {
        const data = await res.json();
        setTrocas(data.trocas);
      }
    } catch {
      // silent
    } finally {
      setCarregando(false);
    }
  }, [aba, user]);

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
    if (res.ok) carregarTrocas();
  };

  const recusarTroca = async (id: number) => {
    const res = await fetch(`/api/trocas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ acao: "recusar" }),
    });
    if (res.ok) carregarTrocas();
  };

  const repetidasFiltradas = filtroBusca
    ? repetidas.filter(r =>
        r.figurinha.jogador?.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
        r.figurinha.selecao.nome.toLowerCase().includes(filtroBusca.toLowerCase())
      )
    : repetidas;

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto max-w-4xl px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Trocas</h1>
            <p className="mt-1 text-zinc-500">Encontre figurinhas para completar seu álbum</p>
          </div>

          <div className="mb-6 flex gap-2">
            {(["disponiveis", "recebidas", "enviadas"] as const).map((t) => {
              const label = t === "disponiveis" ? "Disponíveis" : t === "recebidas" ? "Recebidas" : "Enviadas";
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
                  {[1,2,3,4,5,6,7,8].map(i => (
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
                    {filtroBusca ? "Nenhuma figurinha encontrada" : "Nenhuma figurinha repetida disponível"}
                  </p>
                  <p className="mt-1 text-sm">
                    {filtroBusca ? "Tente outro termo de busca." : "Volte mais tarde para ver novas ofertas."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {repetidasFiltradas.map((grupo) => (
                    <Link
                      key={grupo.figurinha.id}
                      href={`/trocas/repetidas/${grupo.figurinha.slug}`}
                      className="group relative"
                    >
                      {grupo.figurinha.jogador ? (
                        <PlayerCard
                          jogador={grupo.figurinha.jogador}
                          raridade={grupo.figurinha.raridade}
                          corPrimaria={grupo.figurinha.selecao.corPrimaria}
                          codigoPais={grupo.figurinha.selecao.codigoPais}
                        />
                      ) : (
                        <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border border-zinc-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
                          <FlagIcon codigo={grupo.figurinha.selecao.codigoPais} className="mb-2 h-10 w-auto rounded-sm" />
                          <span className="text-center text-xs font-bold">{grupo.figurinha.selecao.nome}</span>
                          <span className="text-[10px] text-zinc-400">#{grupo.figurinha.numero}</span>
                        </div>
                      )}
                      <span className="mt-1 block text-center text-[10px] text-zinc-400">
                        {grupo.totalUsuarios} {grupo.totalUsuarios === 1 ? "pessoa tem" : "pessoas têm"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {(aba === "recebidas" || aba === "enviadas") && !user && (
            <div className="mt-16 text-center text-zinc-400">
              <IconBook className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-medium">Faça login para ver suas trocas</p>
              <Link href="/login" className="mt-2 inline-block text-sm text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300">
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
                    <Skeleton className="h-14 rounded-lg" />
                    <Skeleton className="h-14 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {(aba === "recebidas" || aba === "enviadas") && user && !carregando && trocas.length === 0 && (
            <div className="mt-16 text-center text-zinc-400">
              <IconRepeat className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-medium">Nenhuma troca {aba === "recebidas" ? "recebida" : "enviada"}</p>
              <p className="mt-1 text-sm">
                {aba === "recebidas"
                  ? "Quando alguém oferecer uma troca, ela aparecerá aqui."
                  : "Vá até a aba Disponíveis e escolha uma figurinha para trocar."}
              </p>
            </div>
          )}

          {(aba === "recebidas" || aba === "enviadas") && user && !carregando && trocas.length > 0 && (
            <div className="space-y-4">
              {trocas.map((troca) => {
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
                          {isRecebida ? "Oferta de" : "Enviada para"} <strong className="text-zinc-700 dark:text-zinc-300">{outroUsuario.nome}</strong>
                        </span>
                      </div>
                      <StatusBadge status={troca.status} />
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-medium text-zinc-400">
                          {isRecebida ? "Oferecendo" : "Ofereceu"}
                        </p>
                        <div className="space-y-1.5">
                          {troca.figurinhasOferecidas.map((of) => (
                            <MiniCard key={of.figurinha.id} figurinha={of.figurinha} small />
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-zinc-400">Quer receber</p>
                        <MiniCard figurinha={troca.figurinhaDesejada} small />
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
                      <p className="mt-3 text-xs text-zinc-400">Aguardando resposta de {outroUsuario.nome}</p>
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
          )}
        </main>
      </div>
    </PaginaAnimada>
  );
}
