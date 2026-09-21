"use client";

import { useState } from "react";
import { Home, History, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter, usePathname } from "next/navigation";

interface BottomNavProps {
  studentName: string;
  studentClass: string;
  totalRequests: number;
  pendingRequests: number;
}

export function BottomNav({
  studentName,
  studentClass,
  totalRequests,
  pendingRequests,
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Derive active tab from pathname
  const activeTab = 
    pathname === "/dashboard/profile" ? "profile" 
    : pathname === "/dashboard/history" ? "history" 
    : "home";

  const handleTabClick = (tab: "home" | "history" | "profile") => {
    if (tab === "history") {
      if (pathname !== "/dashboard/history") {
        setIsNavigating(true);
        router.push("/dashboard/history");
      }
    } else if (tab === "home") {
      if (pathname !== "/dashboard") {
        setIsNavigating(true);
        router.push("/dashboard");
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (tab === "profile") {
      if (pathname !== "/dashboard/profile") {
        setIsNavigating(true);
        router.push("/dashboard/profile");
      }
    }
  };

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 px-6 py-2 flex items-center justify-around shadow-sm"
      >
        <button
          type="button"
          onClick={() => handleTabClick("home")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "home"
              ? "text-slate-900 dark:text-white font-bold"
              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <Home className="size-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("history")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer relative ${
            activeTab === "history"
              ? "text-slate-900 dark:text-white font-bold"
              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <History className="size-5" />
          <span className="text-[10px]">History</span>
          {pendingRequests > 0 && (
            <span className="absolute top-1 right-2 size-2 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick("profile")}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === "profile"
              ? "text-slate-900 dark:text-white font-bold"
              : "text-slate-500 dark:text-zinc-400 hover:text-slate-900"
          }`}
        >
          <User className="size-5" />
          <span className="text-[10px]">Profile</span>
        </button>
      </nav>

    </>
  );
}
