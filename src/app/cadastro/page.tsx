"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await fetch("/api/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/admin");
    } catch {
      setErro("Erro ao conectar com o servidor");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="flex w-full items-center justify-center p-8 md:w-2/5">
        <div className="w-full max-w-sm">
          <h2 className="mb-2 text-2xl font-bold">Criar conta</h2>
          <p className="mb-8 text-zinc-500">
            Preencha os dados para se cadastrar
          </p>

          {erro && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="nome"
                className="mb-1.5 block text-sm font-medium"
              >
                Nome
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
              >
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
              <label
                htmlFor="senha"
                className="mb-1.5 block text-sm font-medium"
              >
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
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {carregando ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
            >
              Entre aqui
            </Link>
          </p>
        </div>
      </div>

      <div className="relative flex h-48 w-full md:h-auto md:w-3/5">
        <img
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80"
          alt="Campo de futebol"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 md:bg-gradient-to-l" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold">Faça parte</h1>
          <p className="text-lg text-white/80">
            Monte seu álbum e acompanhe os jogos
          </p>
        </div>
      </div>
    </div>
  );
}
