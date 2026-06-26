"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconUser, IconShield, IconLogout } from "./Icons";
import ModalConfirm from "./ModalConfirm";

interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
}

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [showSairModal, setShowSairModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const cached = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
    if (cached) setUser(cached);

    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          localStorage.setItem("user", JSON.stringify(d.user));
        }
      });
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Entrar
      </Link>
    );
  }

  const initial = user.nome.charAt(0).toUpperCase();
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-white/30 dark:border-zinc-600 dark:hover:bg-zinc-700/50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300 bg-white/20 text-xs font-bold dark:border-zinc-600 dark:bg-white/10">
          {initial}
        </span>
        <span className="hidden sm:inline">{user.nome.split(" ")[0]}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-zinc-200 bg-white py-2 text-zinc-800 shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          <div className="border-b border-zinc-100 px-4 pb-3 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-lg font-bold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                {initial}
              </span>
              <div>
                <p className="text-sm font-medium">{user.nome}</p>
                <p className="text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-2">
              <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
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

          <div className="py-1">
            <Link
              href="/perfil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <IconUser className="h-4 w-4 text-zinc-400" />
              Perfil
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <IconShield className="h-4 w-4 text-zinc-400" />
                Admin
              </Link>
            )}

            <button
              onClick={() => setShowSairModal(true)}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <IconLogout className="h-4 w-4 text-red-400" />
              Sair
            </button>
          </div>
        </div>
      )}

      {showSairModal && (
        <ModalConfirm
          title="Sair da conta?"
          message="Tem certeza que deseja sair?"
          onConfirm={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setOpen(false);
            setUser(null);
            setShowSairModal(false);
            router.push("/");
          }}
          onCancel={() => setShowSairModal(false)}
        />
      )}
    </div>
  );
}
