"use client";

import TransitionWrapper from "@/components/TransitionWrapper";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import GlobalTradeAlert from "@/components/GlobalTradeAlert";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalTradeAlert />
      <TransitionWrapper>{children}</TransitionWrapper>
      <Footer />
      <BottomNav />
    </div>
  );
}
