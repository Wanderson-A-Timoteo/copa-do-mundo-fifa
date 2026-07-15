"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Book, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { name: "Início", path: "/", icon: Home },
    { name: "Tabela", path: "/tabela/grupos", icon: CalendarDays },
    { name: "Álbum", path: "/album", icon: Book },
    { name: "Perfil", path: user?.slug ? `/perfil/${user.slug}` : "/login", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-zinc-200/50 bg-white/90 pb-safe backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/90 md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200 active:scale-95 ${
                isActive
                  ? "text-emerald-500 scale-110"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
