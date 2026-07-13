import React from "react";
import { IconShield } from "@tabler/icons-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center">
      <IconShield className="h-12 w-12 text-zinc-300 dark:text-zinc-700" />
      <h2 className="mt-4 text-2xl font-bold">Acesso restrito</h2>
      <p className="mt-2 text-zinc-500">Apenas administradores podem acessar esta página.</p>
      {children}
    </main>
  );
}
