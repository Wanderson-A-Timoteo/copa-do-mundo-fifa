"use client";

import GoogleLoginButton from "./GoogleLoginButton";

export default function ModalLogin({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50">
      <div className="w-full max-w-sm rounded-xl bg-zinc-100 p-8 shadow-xl dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Acesso necessário</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Você precisa estar logado para editar placares.
        </p>

        <div className="mb-4">
          <GoogleLoginButton onSuccess={onClose} />
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-100 px-2 text-zinc-500 dark:bg-zinc-900">ou</span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="/login"
            className="block w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm text-zinc-50 transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Fazer Login
          </a>
          <a
            href="/cadastro"
            className="block w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-center text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cadastrar
          </a>
          <button
            onClick={onClose}
            className="block w-full rounded-lg px-4 py-2.5 text-center text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
