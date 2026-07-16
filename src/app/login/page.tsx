"use client";

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import PaginaAnimada from "@/components/PaginaAnimada";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  function handleGoogleSuccess() {
    window.location.href = "/";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <PaginaAnimada>
      <div className="flex min-h-screen flex-col md:flex-row">
        <div className="relative flex h-48 w-full md:h-auto md:w-3/5">
          <Image
            src="https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=1200&q=80"
            alt="Estádio de futebol"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
          <div className="absolute bottom-6 left-6 text-zinc-50 md:bottom-auto md:left-auto md:right-6 md:top-6">
            <h1 className="text-3xl font-bold">Copa do Mundo</h1>
            <p className="text-lg text-zinc-50/80">FIFA 2026</p>
          </div>
        </div>

        <div className="flex w-full items-center justify-center p-8 md:w-2/5">
          <div className="w-full max-w-sm">
            <h2 className="mb-2 text-2xl font-bold">Entrar</h2>
            <p className="mb-8 text-zinc-500">Acesse sua conta para continuar</p>

            {erro && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
                  required
                />
              </div>

              <div>
                <label htmlFor="senha" className="mb-1.5 block text-sm font-medium">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {carregando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-100 px-2 text-zinc-500 dark:bg-zinc-900">ou</span>
              </div>
            </div>

            <GoogleLoginButton onSuccess={handleGoogleSuccess} />

            <p className="mt-8 text-center text-sm text-zinc-500">
              Não tem conta?{" "}
              <Link
                href="/cadastro"
                className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
              >
                Cadastre-se
              </Link>
            </p>
            <p className="mt-2 text-center">
              <Link
                href="/"
                className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                ← Voltar para início
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PaginaAnimada>
  );
}
