"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ModalConfirm({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-zinc-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-zinc-100 p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-200 active:scale-95 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-zinc-50 transition-colors hover:bg-red-700 active:scale-95 shadow-md shadow-red-500/20"
          >
            Sair
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
