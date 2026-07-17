"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal, Share2, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RankingItem {
  posicao: number;
  usuarioId: number;
  pontos: number;
  usuario: {
    id: number;
    nome: string;
    slug: string;
  };
}

export default function RankingPage() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userRankPos, setUserRankPos] = useState<RankingItem | null>(null);

  const fetchRanking = async (pageNum: number, isInitial = false) => {
    try {
      if (!isInitial) setLoadingMore(true);
      const res = await fetch(`/api/palpite/ranking?page=${pageNum}&limit=20`);
      const data = await res.json();

      if (data.ranking) {
        if (isInitial) {
          setRanking(data.ranking);
        } else {
          setRanking((prev) => [...prev, ...data.ranking]);
        }
        setHasMore(pageNum < data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRanking(1, true);
  }, []);

  useEffect(() => {
    if (user && ranking.length > 0) {
      const found = ranking.find((r) => r.usuarioId === user.id);
      if (found) {
        setUserRankPos(found);
      }
    }
  }, [user, ranking]);

  const handleShare = (item: RankingItem) => {
    const text = `🏆 Bolão da Copa 🏆\nEstou na ${item.posicao}ª posição com ${item.pontos} pontos no Ranking Oficial!\nVenha participar e tentar me passar!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 text-center md:py-20">
        <div className="flex animate-pulse flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-zinc-100/10" />
          <div className="h-6 w-48 rounded bg-zinc-100/10" />
        </div>
      </main>
    );
  }

  const top3 = ranking.slice(0, 3);
  const others = ranking.slice(3);

  // Ordenar para exibição de pódio visual: 2º lugar, 1º lugar, 3º lugar
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  const getMedalColor = (pos: number) => {
    if (pos === 1) return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
    if (pos === 2) return "text-zinc-300 drop-shadow-[0_0_8px_rgba(212,212,216,0.5)]";
    if (pos === 3) return "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]";
    return "text-zinc-500";
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto mb-20 max-w-5xl px-4 py-8 md:py-16"
    >
      <div className="mb-10 space-y-4 text-center">
        <h1 className="flex items-center justify-center gap-3 text-4xl font-extrabold md:text-5xl">
          <Trophy className="h-10 w-10 text-yellow-400 drop-shadow-md" />
          Ranking Global
        </h1>
        <p className="mx-auto max-w-2xl px-2 text-base text-zinc-500 dark:text-zinc-400 md:text-lg">
          Os melhores palpiteiros da Copa. Acompanhe sua pontuação atualizada!
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs md:text-sm">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300 md:px-4 md:py-2">
            <strong className="font-black">5 pts</strong>{" "}
            <span className="opacity-80">Placar Exato</span>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-800 shadow-sm dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300 md:px-4 md:py-2">
            <strong className="font-black">3 pts</strong>{" "}
            <span className="opacity-80">Vencedor + Saldo</span>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-zinc-800 shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 md:px-4 md:py-2">
            <strong className="font-black">1 pt</strong>{" "}
            <span className="opacity-80">Acerto Vencedor</span>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-purple-800 shadow-sm dark:border-purple-900/50 dark:bg-purple-900/20 dark:text-purple-300 md:px-4 md:py-2">
            <strong className="font-black">+ bônus</strong>{" "}
            <span className="opacity-80">Pênaltis</span>
          </div>
        </div>
      </div>

      {/* Pódio Animated */}
      {top3.length > 0 && (
        <div className="mb-12 flex h-64 flex-row items-end justify-center gap-2 md:h-72 md:gap-6">
          {podiumOrder.map((item, index) => {
            const isCurrentUser = user?.id === item.usuarioId;
            const isFirst = item.posicao === 1;
            const isSecond = item.posicao === 2;

            // Alturas dinâmicas do pódio
            const heightClass = isFirst
              ? "h-56 md:h-64"
              : isSecond
                ? "h-44 md:h-52"
                : "h-36 md:h-44";

            return (
              <motion.div
                key={item.usuarioId}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex w-28 flex-col items-center justify-end rounded-t-3xl border-x border-t p-2 transition-all md:w-40 md:p-4 ${heightClass} ${
                  isFirst
                    ? "z-10 scale-105 border-yellow-500/30 bg-gradient-to-t from-yellow-500/20 to-yellow-500/5"
                    : isSecond
                      ? "z-0 border-zinc-400/30 bg-gradient-to-t from-zinc-400/20 to-zinc-400/5"
                      : "z-0 border-amber-700/30 bg-gradient-to-t from-amber-700/20 to-amber-700/5"
                } ${isCurrentUser ? "ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900" : ""}`}
              >
                <div className="absolute -top-10 flex flex-col items-center md:-top-12">
                  <Medal className={`h-10 w-10 md:h-12 md:w-12 ${getMedalColor(item.posicao)}`} />
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-sm font-bold text-zinc-800 shadow-md dark:border-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 md:h-10 md:w-10 md:text-base">
                    {item.usuario.nome.charAt(0).toUpperCase()}
                  </span>
                </div>

                <Link
                  href={`/perfil/${item.usuario.slug}`}
                  className="mt-4 line-clamp-1 break-all text-center text-sm font-bold text-zinc-900 hover:underline dark:text-zinc-100 md:text-lg"
                >
                  {item.usuario.nome.split(" ")[0]}
                </Link>
                <div className="mt-1 text-xl font-black text-zinc-900 dark:text-zinc-100 md:text-2xl">
                  {item.pontos}{" "}
                  <span className="text-xs font-normal opacity-70 md:text-sm">pts</span>
                </div>
                {isCurrentUser && (
                  <span className="mt-2 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-bold text-zinc-50 md:text-xs">
                    Você
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Lista do Restante - Mobile First */}
      {others.length > 0 && (
        <div className="flex flex-col gap-3">
          {others.map((item) => {
            const isCurrentUser = user?.id === item.usuarioId;
            return (
              <motion.div
                key={item.usuarioId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all hover:scale-[1.01] ${
                  isCurrentUser
                    ? "border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-500/10"
                    : "border-zinc-200/50 bg-zinc-100/50 dark:border-zinc-800/50 dark:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center font-bold text-zinc-500 dark:text-zinc-400">
                    {item.posicao}º
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 font-bold text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-200">
                      {item.usuario.nome.charAt(0).toUpperCase()}
                    </span>
                    <div className="flex flex-col">
                      <Link
                        href={`/perfil/${item.usuario.slug}`}
                        className="font-bold text-zinc-900 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
                      >
                        {item.usuario.nome}
                      </Link>
                      {isCurrentUser && (
                        <span className="w-fit rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                          Você
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-xl font-black text-zinc-900 dark:text-zinc-100">
                      {item.pontos}
                    </span>
                    <span className="block text-xs font-medium text-zinc-500">pts</span>
                  </div>
                  {isCurrentUser && (
                    <button
                      onClick={() => handleShare(item)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-md transition-transform hover:scale-110 active:scale-95"
                      title="Compartilhar no WhatsApp"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Botão Carregar Mais */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              setPage((p) => p + 1);
              fetchRanking(page + 1);
            }}
            disabled={loadingMore}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loadingMore ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Carregar Mais <ChevronDown className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      )}

      {ranking.length === 0 && !loading && (
        <div className="py-12 text-center text-zinc-500">Nenhum palpite registrado ainda.</div>
      )}

      {/* Floating Bottom Bar para o próprio usuário */}
      <AnimatePresence>
        {userRankPos && userRankPos.posicao > 3 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[72px] left-0 right-0 z-50 mx-auto w-full max-w-lg px-4 md:bottom-6"
          >
            <div className="flex items-center justify-between rounded-2xl border border-indigo-500/50 bg-indigo-600/95 p-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/50 font-black">
                  {userRankPos.posicao}º
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">Sua Posição</span>
                  <span className="text-xs text-indigo-200">{userRankPos.pontos} pts</span>
                </div>
              </div>
              <button
                onClick={() => handleShare(userRankPos)}
                className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-green-400 active:scale-95"
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
