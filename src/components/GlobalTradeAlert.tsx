"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { IconShield } from "@/components/Icons";
import { useAuth } from "@/contexts/AuthContext";

export default function GlobalTradeAlert() {
  const { user, getAuthHeaders } = useAuth();
  const [pendentesRec, setPendentesRec] = useState(0);
  const [recusadasEnv, setRecusadasEnv] = useState(0);
  const [fechado, setFechado] = useState(false);
  const [recusadasFechado, setRecusadasFechado] = useState(false);

  const fetchPendentes = useCallback(async () => {
    if (!user) return;
    try {
      const [resRec, resEnv] = await Promise.all([
        fetch("/api/trocas?tipo=recebidas", { headers: getAuthHeaders() }),
        fetch("/api/trocas?tipo=enviadas", { headers: getAuthHeaders() }),
      ]);

      if (resRec.ok) {
        const data = await resRec.json();
        const pending = (data.trocas || []).filter(
          (t: { status: string }) => t.status === "pendente",
        ).length;

        if (pending > 0 && pendentesRec === 0) setFechado(false);
        setPendentesRec(pending);
      }

      if (resEnv.ok) {
        const dataEnv = await resEnv.json();
        const rejected = (dataEnv.trocas || []).filter(
          (t: { status: string }) => t.status === "recusada",
        ).length;

        if (rejected > 0 && recusadasEnv === 0) setRecusadasFechado(false);
        setRecusadasEnv(rejected);
      }
    } catch {
      // silent
    }
  }, [user, getAuthHeaders, pendentesRec, recusadasEnv]);

  // Polling a cada 2 minutos
  useEffect(() => {
    if (!user) return;
    fetchPendentes();
    const interval = setInterval(fetchPendentes, 120000);
    return () => clearInterval(interval);
  }, [user, fetchPendentes]);

  if (!user || (pendentesRec === 0 && recusadasEnv === 0) || (fechado && recusadasFechado))
    return null;

  return (
    <div className="sticky top-0 z-[100] w-full flex flex-col">
      {pendentesRec > 0 && !fechado && (
        <div className="border-b border-emerald-200/50 bg-emerald-50/95 p-3 backdrop-blur-md shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/90">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-2 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800/50">
                <IconShield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Você tem {pendentesRec} troca{pendentesRec !== 1 ? "s" : ""} pendente
                  {pendentesRec !== 1 ? "s" : ""} ({pendentesRec} recebida
                  {pendentesRec !== 1 ? "s" : ""}).
                </p>
                <Link
                  href="/trocas"
                  onClick={() => setFechado(true)}
                  className="mt-0.5 inline-block text-xs font-bold text-emerald-600 hover:text-emerald-700 underline dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                >
                  Analisar solicitação
                </Link>
              </div>
            </div>
            <button
              onClick={() => setFechado(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-800/50 transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {recusadasEnv > 0 && !recusadasFechado && (
        <div className="border-b border-red-200/50 bg-red-50/95 p-3 backdrop-blur-md shadow-sm dark:border-red-900/50 dark:bg-red-900/90">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-2 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/50">
                <svg
                  className="h-5 w-5 text-red-600 dark:text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Você tem {recusadasEnv} solicitação{recusadasEnv !== 1 ? "ões" : ""} recusada
                  {recusadasEnv !== 1 ? "s" : ""}.
                </p>
                <Link
                  href="/trocas"
                  onClick={() => setRecusadasFechado(true)}
                  className="mt-0.5 inline-block text-xs font-bold text-red-600 hover:text-red-700 underline dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Ver trocas enviadas
                </Link>
              </div>
            </div>
            <button
              onClick={() => setRecusadasFechado(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-800/50 transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
