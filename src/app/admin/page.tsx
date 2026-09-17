import { prisma } from "@/lib/prisma";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { LayoutDashboard } from "lucide-react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/app/actions/reports";
import { TrendChart } from "@/components/admin/charts/TrendChart";
import { DistributionPieChart } from "@/components/admin/charts/DistributionPieChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const tuStaff = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  const staffName = tuStaff?.name || session.username;
  
  const stats = await getDashboardStats();
  
  const totalRequests = await prisma.request.count();
  const approvedRequests = await prisma.request.count({ where: { status: "APPROVED" } });
  const rejectedRequests = await prisma.request.count({ where: { status: "REJECTED" } });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      <AdminSidebar staffName={staffName} pendingCount={stats?.pendingRequests || 0} currentPath="/admin" />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutDashboard className="size-5" /> Dashboard
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Selamat datang, {staffName}. Berikut ringkasan sistem LANTAS.
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
          <AdminStatsCards
            total={totalRequests}
            pending={stats?.pendingRequests || 0}
            approved={approvedRequests}
            rejected={rejectedRequests}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <h2 className="text-sm font-bold mb-1 text-slate-900 dark:text-white">Total Siswa</h2>
              <p className="text-3xl font-black text-blue-600">{stats?.totalStudents || 0}</p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
              <h2 className="text-sm font-bold mb-1 text-slate-900 dark:text-white">Pengajuan Hari Ini</h2>
              <p className="text-3xl font-black text-indigo-600">{stats?.todayRequests || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-[350px]">
              <TrendChart data={stats?.trendData || []} />
            </div>
            <div className="h-[350px]">
              <DistributionPieChart data={stats?.distributionData || []} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
