"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconShield, IconTrophy, IconUser } from "@/components/Icons";
import { SkeletonAdmin } from "@/components/Skeleton";

interface UserItem {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserItem | null>(null);
  const [usuarios, setUsuarios] = useState<UserItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [promovendo, setPromovendo] = useState<number | null>(null);

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
      });
  }, [router]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      setCarregando(false);
      return;
    }
    const token = localStorage.getItem("token");
    fetch("/api/admin/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setUsuarios(d.usuarios);
      })
      .finally(() => setCarregando(false));
  }, [user]);

  async function promover(id: number) {
    setPromovendo(id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/promover", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ usuarioId: id }),
      });
      if (res.ok) {
        setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, role: "ADMIN" } : u)));
      }
    } finally {
      setPromovendo(null);
    }
  }

  if (carregando) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <SkeletonAdmin />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-8">
        <p className="text-zinc-500">Redirecionando...</p>
      </main>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
        <IconShield className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
        <h2 className="mt-4 text-2xl font-bold">Acesso restrito</h2>
        <p className="mt-2 text-zinc-500">Apenas administradores podem acessar esta página.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-3xl font-bold">
        <IconShield className="mr-2 inline-block h-7 w-7" />
        Admin
      </h1>
      <p className="mt-1 text-zinc-500">Gerencie os usuários da plataforma</p>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold">Usuários</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs text-zinc-500 dark:bg-zinc-900">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3 font-medium">{u.nome}</td>
                  <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {u.role === "ADMIN" ? (
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
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== "ADMIN" && (
                      <button
                        onClick={() => promover(u.id)}
                        disabled={promovendo === u.id}
                        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                      >
                        {promovendo === u.id ? "..." : "Promover a Admin"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
