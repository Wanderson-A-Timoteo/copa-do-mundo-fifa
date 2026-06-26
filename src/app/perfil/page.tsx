"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavHeader from "@/components/NavHeader";
import { IconShield, IconUser } from "@/components/Icons";

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; nome: string; email: string; role: string } | null>(null);
  const [carregando, setCarregando] = useState(true);

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
      <div className="min-h-screen">
        <NavHeader />
        <main className="mx-auto max-w-lg px-6 py-8">
          <p className="text-zinc-500">Carregando...</p>
        </main>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen">
      <NavHeader />
      <main className="mx-auto max-w-lg px-6 py-8">
        <h1 className="text-3xl font-bold">Perfil</h1>

        <div className="mt-8 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 text-2xl font-bold dark:bg-zinc-700">
              {user.nome.charAt(0).toUpperCase()}
            </span>
            <div>
              <h2 className="text-xl font-bold">{user.nome}</h2>
              <p className="text-sm text-zinc-500">{user.email}</p>
              <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                isAdmin
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              }`}>
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
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/");
            }}
            className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            Sair da conta
          </button>
        </div>
      </main>
    </div>
  );
}
