"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconShield, IconUser } from "@/components/Icons";
import { SkeletonPerfil } from "@/components/Skeleton";
import ModalConfirm from "@/components/ModalConfirm";
import { useAuth } from "@/hooks/useAuth";

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    nome: string;
    email: string;
    role: string;
  } | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [showSairModal, setShowSairModal] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
        else router.push("/login");
      })
      .finally(() => setCarregando(false));
  }, [router]);

  if (carregando) {
    return (
      <main className="mx-auto max-w-lg px-6 py-8">
        <SkeletonPerfil />
      </main>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  return (
    <main className="mx-auto max-w-lg px-6 py-8">
      <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text drop-shadow-sm">
        Perfil
      </h1>

      <div className="mt-8 rounded-2xl border border-zinc-200/50 bg-zinc-100/90 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-700/50 dark:bg-zinc-800/90">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-2xl font-black text-white shadow-md">
            {user.nome.charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className="text-xl font-bold">{user.nome}</h2>
            <p className="text-sm text-zinc-500">{user.email}</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                isAdmin
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              }`}
            >
              {isAdmin ? (
                <span className="inline-flex items-center gap-1">
                  <IconShield className="h-3.5 w-3.5" />
                  Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <IconUser className="h-3.5 w-3.5" />
                  Torcedor
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={() => setShowSairModal(true)}
          className="w-full rounded-xl border border-red-200 bg-white/50 px-4 py-3 text-sm font-bold text-red-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md active:scale-95 dark:border-red-900/50 dark:bg-zinc-900/50 dark:text-red-400 dark:hover:bg-red-950/50"
        >
          Sair da conta
        </button>
      </div>

      {showSairModal && (
        <ModalConfirm
          title="Sair da conta?"
          message="Tem certeza que deseja sair?"
          onConfirm={() => {
            logout();
            window.location.href = "/";
          }}
          onCancel={() => setShowSairModal(false)}
        />
      )}
    </main>
  );
}
