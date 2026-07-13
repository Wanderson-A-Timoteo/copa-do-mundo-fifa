"use client";

import NavHeader from "@/components/NavHeader";
import TransitionWrapper from "@/components/TransitionWrapper";


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <NavHeader />
      <TransitionWrapper>{children}</TransitionWrapper>
    </div>
  );
}
