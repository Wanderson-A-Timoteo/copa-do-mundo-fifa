"use client";

import NavHeader from "@/components/NavHeader";
import PaginaAnimada from "@/components/PaginaAnimada";

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return (
    <PaginaAnimada>
      <NavHeader />
      {children}
    </PaginaAnimada>
  );
}
