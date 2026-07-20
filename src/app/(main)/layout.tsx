"use client";

import TransitionWrapper from "@/components/TransitionWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <TransitionWrapper>{children}</TransitionWrapper>
      <Footer />
      <BottomNav />
    </div>
  );
}
