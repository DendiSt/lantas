"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, LayoutDashboard } from "lucide-react";

const routeLabels: Record<string, string> = {
  admin: "Dashboard",
  requests: "Pengajuan Izin",
  attendances: "Rekap & Jurnal Absensi",
  students: "Data Siswa",
  teachers: "Data Guru",
  classes: "Manajemen Kelas",
  schedules: "Jadwal Pelajaran",
  reports: "Laporan & Rekap",
  admins: "Petugas TU",
  settings: "Pengaturan Sistem",
  edit: "Edit Data",
  detail: "Detail Informasi",
};

interface AdminBreadcrumbProps {
  className?: string;
  customItems?: { label: string; href?: string }[];
}

export function AdminBreadcrumb({ className = "", customItems }: AdminBreadcrumbProps) {
  const pathname = usePathname();

  // If custom items are provided, render those
  if (customItems && customItems.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className={`flex items-center text-xs font-medium text-slate-500 dark:text-zinc-400 ${className}`}>
        <Link
          href="/admin"
          className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Ke Dashboard"
        >
          <Home className="size-3.5 text-slate-400 dark:text-zinc-500" />
          <span>Dashboard</span>
        </Link>
        {customItems.map((item, idx) => {
          const isLast = idx === customItems.length - 1;

          return (
            <div key={idx} className="flex items-center">
              <ChevronRight className="size-3 mx-1.5 text-slate-400 dark:text-zinc-600 shrink-0" />
              {isLast || !item.href ? (
                <span className="font-bold text-slate-900 dark:text-white">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  // Decompose pathname: e.g. /admin/requests -> ["admin", "requests"]
  const segments = pathname.split("/").filter(Boolean);

  // If on /admin, show simple indicator
  if (segments.length <= 1) {
    return (
      <nav aria-label="Breadcrumb" className={`flex items-center text-xs font-medium text-slate-500 dark:text-zinc-400 ${className}`}>
        <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-300">
          <LayoutDashboard className="size-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Overview Ringkasan</span>
        </span>
      </nav>
    );
  }

  // Build breadcrumb items
  const breadcrumbItems: { label: string; href: string; isLast: boolean }[] = [];
  let currentPath = "";

  segments.forEach((seg, index) => {
    currentPath += `/${seg}`;
    const isLast = index === segments.length - 1;
    // Map segment or format nicely
    let label = routeLabels[seg.toLowerCase()];

    if (!label) {
      // If it looks like an ID or cuid (alphanumeric > 10 chars), label as Detail
      if (seg.length > 10) {
        label = "Detail";
      } else {
        label = seg.charAt(0).toUpperCase() + seg.slice(1);
      }
    }

    breadcrumbItems.push({
      label,
      href: currentPath,
      isLast,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs font-medium text-slate-500 dark:text-zinc-400 overflow-x-auto whitespace-nowrap py-0.5 no-scrollbar ${className}`}>
      <Link
        href="/admin"
        className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
        title="Ke Dashboard"
      >
        <Home className="size-3.5 text-slate-400 dark:text-zinc-500" />
        <span>Admin</span>
      </Link>

      {breadcrumbItems.map((item, idx) => {
        // Skip the very first "admin" since we already rendered "Admin" home above
        if (idx === 0) return null;

        return (
          <div key={item.href} className="flex items-center shrink-0">
            <ChevronRight className="size-3 mx-1 text-slate-400 dark:text-zinc-600 shrink-0" />
            {item.isLast ? (
              <span className="font-bold text-slate-900 dark:text-white">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
