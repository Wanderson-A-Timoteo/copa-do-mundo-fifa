"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";

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

  useEffect(() => {
    fetch("/api/palpite/ranking")
      .then((res) => res.json())
      .then((data) => {
        if (data.ranking) {
          setRanking(data.ranking);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 md:py-20 text-center">
        <div className="animate-pulse flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-zinc-100/10" />
          <div className="h-6 w-48 rounded bg-zinc-100/10" />
        </div>
      </main>
    );
  }

  const top3 = ranking.slice(0, 3);
  const others = ranking.slice(3);

  const getMedalColor = (pos: number) => {
    if (pos === 1) return "text-yellow-400";
    if (pos === 2) return "text-zinc-300";
    if (pos === 3) return "text-amber-600";
    return "text-zinc-500";
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-5xl px-4 py-12 md:py-16"
    >
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold flex items-center justify-center gap-3">
          <Trophy className="h-10 w-10 text-yellow-400" />
          Ranking Global
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Os melhores palpiteiros da Copa. Acerto exato = 3 pts, Acertar vencedor = 1 pt.
        </p>
      </div>

      {/* Top 3 Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {top3.map((item) => {
          const isCurrentUser = user?.id === item.usuarioId;
          return (
            <motion.div
              key={item.usuarioId}
              whileHover={{ scale: 1.05 }}
              className={`flex flex-col items-center justify-center p-8 rounded-3xl bg-zinc-100/5 backdrop-blur-md border transition-all shadow-xl ${
                item.posicao === 1
                  ? "border-yellow-500/30 dark:bg-yellow-500/10"
                  : item.posicao === 2
                    ? "border-zinc-400/30 dark:bg-zinc-400/10"
                    : "border-amber-600/30 dark:bg-amber-600/10"
              } ${isCurrentUser ? "ring-2 ring-indigo-500" : ""}`}
            >
              <div className="mb-4 relative">
                <Medal className={`h-16 w-16 ${getMedalColor(item.posicao)}`} />
              </div>
              <Link
                href={`/perfil/${item.usuario.slug}`}
                className="text-xl font-bold hover:underline mb-1 text-zinc-900 dark:text-zinc-100"
              >
                {item.usuario.nome}
              </Link>
              <div className="text-2xl font-black mt-2 text-zinc-900 dark:text-zinc-100">
                {item.pontos} <span className="text-sm font-normal opacity-70">pts</span>
              </div>
              {isCurrentUser && (
                <span className="mt-3 rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-zinc-50">
                  Você
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tabela do Restante */}
      {others.length > 0 && (
        <div className="bg-zinc-100/5 backdrop-blur-md border border-zinc-100/10 rounded-2xl p-2 md:p-6 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm uppercase text-zinc-500 border-b border-zinc-200 dark:border-zinc-100/10">
                <tr>
                  <th className="px-6 py-4 font-semibold text-center w-24">Pos</th>
                  <th className="px-6 py-4 font-semibold">Usuário</th>
                  <th className="px-6 py-4 font-semibold text-right">Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
                {others.map((item) => {
                  const isCurrentUser = user?.id === item.usuarioId;
                  return (
                    <tr
                      key={item.usuarioId}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-100/10 transition-all ${
                        isCurrentUser ? "bg-indigo-50 dark:bg-zinc-100/10 ring-1 ring-indigo-500" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-center font-bold text-zinc-500 dark:text-zinc-400">
                        {item.posicao}º
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/perfil/${item.usuario.slug}`}
                            className="font-medium text-lg text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            {item.usuario.nome}
                          </Link>
                          {isCurrentUser && (
                            <span className="rounded bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                              Você
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-lg text-zinc-900 dark:text-zinc-100">
                        {item.pontos} <span className="text-sm font-normal text-zinc-500">pts</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {ranking.length === 0 && (
        <div className="text-center py-12 text-zinc-500">Nenhum palpite registrado ainda.</div>
      )}
    </motion.main>
  );
}
