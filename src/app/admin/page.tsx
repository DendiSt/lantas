import { prisma } from "@/lib/prisma";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminRequestsTable } from "@/components/admin/AdminRequestsTable";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Ambil semua data pengajuan izin beserta relasi siswa
  const requests = await prisma.request.findMany({
    include: {
      student: {
        select: {
          id: true,
          name: true,
          classId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Ambil data staf TU
  const tuStaff = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  const staffName = tuStaff?.name || "Hendra Pratama, S.Pd (Staf TU)";

  // Hitung metrik ringkasan
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;
  const rejected = requests.filter((r) => r.status === "REJECTED").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex">
      {/* Sidebar Navigation: Dashboard, Permission Requests, Student Records, Reports, Settings */}
      <AdminSidebar staffName={staffName} pendingCount={pending} />

      {/* Main Content Area (Offset by sidebar width on lg screens) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Content Header */}
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Permission Requests
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold border border-slate-200 dark:border-zinc-700">
                Live Data
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Verifikasi dan rekap data perizinan siswa SMK Negeri 2 Subang
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              <ShieldCheck className="size-3.5 text-slate-900 dark:text-white" />
              <span>Sistem Terverifikasi TU</span>
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
          {/* 3 Metric Summary Cards with percentage indicators */}
          <AdminStatsCards
            total={total}
            pending={pending}
            approved={approved}
            rejected={rejected}
          />

          {/* Desktop Data Table with Pagination, Status Badges & Action Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daftar Pengajuan Masuk
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Pembaruan instan tanpa refresh
              </p>
            </div>
            <AdminRequestsTable initialRequests={requests} />
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex flex-col sm:flex-row justify-between gap-2">
          <p className="font-medium text-slate-700 dark:text-zinc-300">
            LANTAS • Layanan Terpadu Administrasi Sekolah
          </p>
          <p className="text-[11px]">Sistem Rekap & Verifikasi Perizinan Mandiri Siswa</p>
        </footer>
      </div>
    </div>
  );
}
