"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, MouseEvent } from "react";

export default function ActiveLink({ href, children, onClick }: { href: string; children: ReactNode; onClick?: (e: MouseEvent) => void }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative transition-all ${
        isActive ? "opacity-100 font-semibold" : "opacity-50 hover:opacity-100"
      }`}
    >
      {children}
      <span
        className={`absolute -bottom-1 left-0 h-0.5 w-full origin-left bg-current transition-transform duration-300 ${
          isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
    </Link>
  );
}
