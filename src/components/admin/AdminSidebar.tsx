"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  BarChart3,
  Settings,
  GraduationCap,
  ArrowLeftRight,
  UserCheck,
  Menu,
  X,
  Building2,
} from "lucide-react";

interface AdminSidebarProps {
  staffName: string;
  pendingCount: number;
}

export function AdminSidebar({ staffName, pendingCount }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("requests");

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "requests",
      label: "Permission Requests",
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      id: "students",
      label: "Student Records",
      icon: Users,
      badge: null,
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Topbar with Menu Trigger */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">LANTAS</h1>
            <p className="text-[10px] text-slate-500 font-medium">Tata Usaha</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
          aria-label="Buka Menu Navigasi"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container (Desktop Persistent, Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  LANTAS
                </h2>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  TU
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
                <Building2 className="size-3" />
                <span>Tata Usaha Sekolah</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
            Main Menu
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveItem(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`size-4 ${isActive ? "text-white dark:text-slate-900" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-amber-400 text-slate-950"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Info & Switcher at Bottom of Sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 space-y-3 bg-slate-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
              <UserCheck className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {staffName}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Petugas Verifikasi</span>
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-700/80 flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex-1 text-center py-1.5 px-2.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeftRight className="size-3" />
              <span>Mode Siswa</span>
            </Link>

            <Link
              href="/"
              className="py-1.5 px-2.5 text-xs font-medium rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span>Home</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
