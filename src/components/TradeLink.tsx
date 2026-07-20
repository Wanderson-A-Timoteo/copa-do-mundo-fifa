"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function TradeLink({
  userId,
  userSlug,
  figurinhaSlug,
}: {
  userId: number;
  userSlug?: string;
  figurinhaSlug: string;
}) {
  const { user } = useAuth();

  if (!user || user.id === userId) return null;

  return (
    <Link
      href={`/trocas/nova/${userSlug || userId}/${figurinhaSlug}`}
      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
    >
      Solicitar Troca
    </Link>
  );
}
