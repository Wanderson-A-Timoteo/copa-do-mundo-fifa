"use client";

import PaginaAnimada from "@/components/PaginaAnimada";

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return <PaginaAnimada>{children}</PaginaAnimada>;
}
