"use client";

import TransitionWrapper from "@/components/TransitionWrapper";


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <TransitionWrapper>{children}</TransitionWrapper>
    </div>
  );
}
