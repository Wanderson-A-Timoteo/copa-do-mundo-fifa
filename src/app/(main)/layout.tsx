"use client";

import NavHeader from "@/components/NavHeader";
import PaginaAnimada from "@/components/PaginaAnimada";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <PaginaAnimada>
      <div className="min-h-screen">
        <NavHeader />
        {children}
      </div>
    </PaginaAnimada>
  );
}
