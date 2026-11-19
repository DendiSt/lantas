import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { CalendarDays } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats, getAlphaWarnings } from "@/app/actions/reports";
import { TrendChart } from "@/components/admin/charts/TrendChart";
import { DistributionPieChart } from "@/components/admin/charts/DistributionPieChart";
import { ClassComparisonChart } from "@/components/admin/charts/ClassComparisonChart";
import { resolveExpiredQRRequests } from "@/app/actions/requests";
import { AlphaWarningCard } from "@/components/admin/AlphaWarningCard";
import { getTimeGreeting, formatDate } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Admin LANTAS",
};

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  // Auto-resolve QR kedaluwarsa secara lazy
  await resolveExpiredQRRequests();

  const tuStaff = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  const staffName = tuStaff?.name || session.username;
  
  const stats = await getDashboardStats();
  const alphaWarnings = await getAlphaWarnings();
  
  const totalRequests = await prisma.request.count();
  const approvedRequests = await prisma.request.count({ where: { status: "APPROVED" } });
  const rejectedRequests = await prisma.request.count({ where: { status: "REJECTED" } });

  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // Convert Sunday (0) to 7, Monday is 1
  
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - (dayOfWeek - 1));
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const reqsThisWeek = await prisma.request.count({ where: { createdAt: { gte: startOfThisWeek } } });
  const reqsLastWeek = await prisma.request.count({ where: { createdAt: { gte: startOfLastWeek, lt: startOfThisWeek } } });
  
  const approvedThisWeek = await prisma.request.count({ where: { status: "APPROVED", createdAt: { gte: startOfThisWeek } } });
  const rejectedThisWeek = await prisma.request.count({ where: { status: "REJECTED", createdAt: { gte: startOfThisWeek } } });
  const approvedLastWeek = await prisma.request.count({ where: { status: "APPROVED", createdAt: { gte: startOfLastWeek, lt: startOfThisWeek } } });
  const rejectedLastWeek = await prisma.request.count({ where: { status: "REJECTED", createdAt: { gte: startOfLastWeek, lt: startOfThisWeek } } });

  const processedThisWeek = approvedThisWeek + rejectedThisWeek;
  const processedLastWeek = approvedLastWeek + rejectedLastWeek;
  const approvalRateThisWeek = processedThisWeek > 0 ? (approvedThisWeek / processedThisWeek) : 0;
  const approvalRateLastWeek = processedLastWeek > 0 ? (approvedLastWeek / processedLastWeek) : 0;

  const weeklyChange = reqsLastWeek > 0 ? ((reqsThisWeek - reqsLastWeek) / reqsLastWeek) * 100 : (reqsThisWeek > 0 ? 100 : 0);
  const approvalRateChange = (approvalRateThisWeek - approvalRateLastWeek) * 100;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description={`${getTimeGreeting()}, ${staffName}. Berikut ringkasan sistem LANTAS hari ini.`}
        action={
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 shadow-2xs">
            <CalendarDays className="size-3.5" />
            <span>{formatDate(now)}</span>
          </span>
        }
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <AdminStatsCards
          total={totalRequests}
          pending={stats?.pendingRequests || 0}
          approved={approvedRequests}
          rejected={rejectedRequests}
          weeklyChange={weeklyChange}
          approvalRateChange={approvalRateChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h2 className="text-sm font-bold mb-1 text-slate-900 dark:text-white">Total Siswa</h2>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalStudents || 0}</p>
          </div>
          <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
            <h2 className="text-sm font-bold mb-1 text-slate-900 dark:text-white">Pengajuan Hari Ini</h2>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats?.todayRequests || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-[360px]">
            <TrendChart data={stats?.trendData || []} />
          </div>
          <div className="h-[360px]">
            <DistributionPieChart data={stats?.distributionData || []} />
          </div>
        </div>

        <div className="h-[340px]">
          <ClassComparisonChart data={stats?.classComparisonData || []} />
        </div>
        
        <AlphaWarningCard warnings={alphaWarnings} />
      </main>

      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-3 text-xs text-slate-500 dark:text-zinc-400 text-center sm:text-left flex flex-col sm:flex-row justify-between gap-2">
        <p className="font-medium text-slate-700 dark:text-zinc-300">
          LANTAS • Layanan Terpadu Administrasi Sekolah
        </p>
        <p className="text-[11px]">Sistem Rekap & Verifikasi Perizinan Mandiri Siswa</p>
      </footer>
    </>
  );
}
