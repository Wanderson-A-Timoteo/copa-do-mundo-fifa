"use client";

import TransitionWrapper from "@/components/TransitionWrapper";
import { BottomNav } from "@/components/layout/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <TransitionWrapper>{children}</TransitionWrapper>
      <BottomNav />
    </div>
  );
}
