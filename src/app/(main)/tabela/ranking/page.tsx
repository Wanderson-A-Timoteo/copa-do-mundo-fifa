"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { IconTrophy } from "@/components/Icons";

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

  const getBadgeClass = (posicao: number) => {
    switch (posicao) {
      case 1:
        return "bg-amber-400 text-white shadow-lg shadow-amber-400/50 border-amber-500";
      case 2:
        return "bg-zinc-300 text-zinc-800 shadow-md shadow-zinc-300/50 border-zinc-400";
      case 3:
        return "bg-amber-700 text-white shadow-md shadow-amber-700/50 border-amber-800";
      default:
        return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700";
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 md:py-20 text-center">
        <div className="animate-pulse flex flex-col items-center justify-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-6 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <div className="mb-10 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold flex items-center justify-center gap-3">
          <IconTrophy className="h-10 w-10 text-amber-400" />
          Ranking Global
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Veja quem são os melhores palpiteiros da Copa. Cada acerto exato vale 3 pontos, acertar o
          vencedor vale 1 ponto.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 uppercase text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold text-center w-24">
                  Posição
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Usuário
                </th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">
                  Pontuação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {ranking.map((item) => {
                const isCurrentUser = user?.id === item.usuarioId;

                return (
                  <tr
                    key={item.usuarioId}
                    className={`transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 ${
                      isCurrentUser ? "bg-indigo-50/50 dark:bg-indigo-900/20" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex justify-center">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${getBadgeClass(
                            item.posicao,
                          )}`}
                        >
                          {item.posicao === 1 ? <IconTrophy className="h-4 w-4" /> : item.posicao}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/perfil/${item.usuario.slug}`}
                          className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold text-base"
                        >
                          {item.usuario.nome}
                        </Link>
                        {isCurrentUser && (
                          <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                            Você
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {item.pontos}
                      </span>
                      <span className="text-zinc-500 ml-1 text-xs uppercase font-semibold">
                        pts
                      </span>
                    </td>
                  </tr>
                );
              })}

              {ranking.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum palpite registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
