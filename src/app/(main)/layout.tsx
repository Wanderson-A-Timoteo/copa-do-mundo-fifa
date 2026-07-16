"use client";

import TransitionWrapper from "@/components/TransitionWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-20 md:pb-0">
      <TransitionWrapper>{children}</TransitionWrapper>
      <Footer />
      <BottomNav />
    </div>
  );
}
