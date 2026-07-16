"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  CalendarDays,
  Book,
  User,
  Menu,
  X,
  Trophy,
  Calculator,
  Swords,
  Target,
  Repeat,
  MapPin,
  Flag,
  Shield,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ModalConfirm from "@/components/ModalConfirm";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Início", path: "/", icon: Home },
    { name: "Tabela", path: "/tabela/grupos", icon: CalendarDays },
    { name: "Álbum", path: "/album", icon: Book },
    { name: "Perfil", path: mounted && user?.slug ? `/perfil/${user.slug}` : "/login", icon: User },
  ];

  const menuGridItems = [
    {
      name: "Tabela Oficial",
      path: "/tabela/oficial",
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      name: "Bolão",
      path: "/palpites/bolao",
      icon: Target,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    { name: "Trocas", path: "/trocas", icon: Repeat, color: "text-blue-500", bg: "bg-blue-500/10" },
    {
      name: "Simular Grupos",
      path: "/tabela/simulacao-grupos",
      icon: Calculator,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      name: "Mata-Mata",
      path: "/tabela/simulacao-mata-mata",
      icon: Swords,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      name: "Seleções",
      path: "/selecoes",
      icon: Flag,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      name: "Estádios",
      path: "/estadios",
      icon: MapPin,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  if (mounted && user?.role === "ADMIN") {
    menuGridItems.push({
      name: "Painel Admin",
      path: "/admin",
      icon: Shield,
      color: "text-red-500",
      bg: "bg-red-500/10",
    });
  }

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setShowLogoutModal(false);
    router.push("/");
  };

  return (
    <>
      {/* Fullscreen Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 md:hidden ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />

        <div
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-zinc-100 p-6 shadow-2xl transition-transform duration-300 dark:bg-zinc-800 ${
            isMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Explorar</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Descubra mais recursos</p>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 active:scale-95 transition-all dark:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {menuGridItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-100 bg-zinc-100 p-4 shadow-sm transition-all active:scale-95 hover:border-zinc-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${item.bg}`}
                  >
                    <Icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <span className="text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {mounted && user && (
            <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-3.5 text-sm font-bold text-red-600 transition-all active:scale-95 dark:bg-red-950/30 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Sair da Conta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Bottom Navigation */}
      <nav className="fixed bottom-0 z-50 w-full border-t border-zinc-200/50 bg-zinc-100/90 pb-safe backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-800/90 md:hidden shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex h-16 items-center justify-around px-1 sm:px-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-all duration-300 active:scale-95 ${
                  isActive
                    ? "text-emerald-500 translate-y-[-4px]"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                <div
                  className={`relative flex items-center justify-center rounded-xl p-1.5 transition-colors ${isActive ? "bg-emerald-500/10" : ""}`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
                </div>
                <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Menu Trigger Button */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-1 h-full text-zinc-500 transition-all duration-300 active:scale-95 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <div className="flex items-center justify-center rounded-xl p-1.5 transition-colors">
              <Menu className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </div>
      </nav>

      {showLogoutModal && (
        <ModalConfirm
          title="Sair da conta?"
          message="Tem certeza que deseja sair?"
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  );
}
