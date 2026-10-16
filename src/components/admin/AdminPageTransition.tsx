"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function AdminPageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      style={{ viewTransitionName: "admin-main" }}
      className="animate-in fade-in-50 duration-200 slide-in-from-bottom-1 ease-out flex-1 flex flex-col min-h-0 w-full"
    >
      {children}
    </div>
  );
}
