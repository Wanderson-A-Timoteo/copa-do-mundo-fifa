"use client";

import { useEffect, useState, useCallback } from "react";
import NavHeader from "@/components/NavHeader";
import PaginaAnimada from "@/components/PaginaAnimada";
import PlayerCard from "@/components/PlayerCard";
import { FlagIcon } from "@/components/FlagIcon";
import { IconRepeat, IconBook, IconShield, IconUser } from "@/components/Icons";
import { Skeleton } from "@/components/Skeleton";

interface FigurinhaResumo {
  id: number;
  numero: number;
  selecao: { id: number; nome: string; codigoPais: string | null; corPrimaria: string | null };
  jogador: { nome: string; posicao: string; fotoUrl: string | null; numeroCamisa: number | null } | null;
}

interface TrocaItem {
  id: number;
  status: string;
  createdAt: string;
  remetente: { id: number; nome: string };
  destinatario: { id: number; nome: string };
  figurinhaOferecida: FigurinhaResumo;
  figurinhaDesejada: FigurinhaResumo;
}

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

function MiniCard({ figurinha }: { figurinha: FigurinhaResumo }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex shrink-0 items-center justify-center">
        {figurinha.jogador ? (
          figurinha.jogador.fotoUrl ? (
            <img src={figurinha.jogador.fotoUrl} alt="" className="h-12 w-9 rounded object-cover" />
          ) : (
            <div className="flex h-12 w-9 items-center justify-center rounded bg-zinc-300 text-[10px] font-bold text-white dark:bg-zinc-600">
              {figurinha.jogador.nome.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
          )
        ) : (
          <div className="flex h-12 w-9 items-center justify-center rounded bg-zinc-200 dark:bg-zinc-700">
            <FlagIcon codigo={figurinha.selecao.codigoPais} className="h-6 w-auto rounded-sm" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {figurinha.jogador?.nome || figurinha.selecao.nome}
        </p>
        <p className="text-xs text-zinc-400">
          {figurinha.jogador ? `#${figurinha.jogador.numeroCamisa ?? "—"} · ${figurinha.jogador.posicao}` : `#${figurinha.numero}`}
        </p>
      </div>
    </div>
  );
}

export default function TrocasPage() {
  const [trocas, setTrocas] = useState<TrocaItem[]>([]);
  const [tipo, setTipo] = useState<"recebidas" | "enviadas">("recebidas");
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState<{ id: number; nome: string } | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const cached = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
    if (cached) setUser(cached);
  }, []);

  const carregarTrocas = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch(`/api/trocas?tipo=${tipo}`, { headers: { ...getAuthHeaders() } });
      if (res.ok) {
        const data = await res.json();
        setTrocas(data.trocas);
      }
    } catch {
      // silent
    } finally {
      setCarregando(false);
    }
  }, [tipo]);

  useEffect(() => {
    carregarTrocas();
  }, [carregarTrocas]);

  const aceitarTroca = async (id: number) => {
    const res = await fetch(`/api/trocas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ acao: "aceitar" }),
    });
    if (res.ok) {
      carregarTrocas();
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
    }
  };

  return (
    <PaginaAnimada>
      <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Minhas Trocas</h1>
            <p className="mt-1 text-zinc-500">Gerencie suas ofertas de troca de figurinhas</p>
          </div>

          <div className="mb-6 flex gap-2">
            {(["recebidas", "enviadas"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  tipo === t
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                }`}
              >
                {t === "recebidas" ? "Recebidas" : "Enviadas"}
              </button>
            ))}
          </div>

          {carregando ? (
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
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : trocas.length === 0 ? (
            <div className="mt-16 text-center text-zinc-400">
              <IconRepeat className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-medium">Nenhuma troca {tipo === "recebidas" ? "recebida" : "enviada"}</p>
              <p className="mt-1 text-sm">
                {tipo === "recebidas"
                  ? "Quando alguém oferecer uma troca, ela aparecerá aqui."
                  : "Vá até o álbum e ofereça suas figurinhas repetidas em troca."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trocas.map((troca) => {
                const isRecebida = tipo === "recebidas";
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
                        <MiniCard figurinha={troca.figurinhaOferecida} />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-zinc-400">
                          {isRecebida ? "Quer receber" : "Quer receber"}
                        </p>
                        <MiniCard figurinha={troca.figurinhaDesejada} />
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

          {!user && !carregando && (
            <div className="mt-16 text-center text-zinc-400">
              <IconBook className="mx-auto h-12 w-12" />
              <p className="mt-4 text-lg font-medium">Faça login para ver suas trocas</p>
              <p className="mt-1 text-sm">
                <a href="/login" className="text-zinc-700 underline dark:text-zinc-300">Entre com sua conta</a> para gerenciar trocas de figurinhas.
              </p>
            </div>
          )}
        </main>
      </div>
    </PaginaAnimada>
  );
}
