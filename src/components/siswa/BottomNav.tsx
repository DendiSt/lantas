"use client";

import { useState } from "react";
import { Home, History, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [activeTab, setActiveTab] = useState<"home" | "history" | "profile">("home");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleTabClick = (tab: "home" | "history" | "profile") => {
    setActiveTab(tab);
    if (tab === "history") {
      const historySection = document.getElementById("history-section");
      if (historySection) {
        historySection.scrollIntoView({ behavior: "smooth" });
      }
    } else if (tab === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (tab === "profile") {
      setIsProfileOpen(true);
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

      {/* Modal Profile Siswa */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-sm w-[90vw] p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <DialogHeader className="pb-3 border-b border-slate-200 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
              Profil Siswa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                {studentName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{studentName}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Kelas: {studentClass} • NISN: 0067829102
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Siswa Aktif
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800">
                <p className="text-slate-500 dark:text-zinc-400 text-[11px]">Total Pengajuan</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">{totalRequests}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800">
                <p className="text-slate-500 dark:text-zinc-400 text-[11px]">Izin Pending</p>
                <p className="text-base font-bold text-amber-700 dark:text-amber-400">{pendingRequests}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
