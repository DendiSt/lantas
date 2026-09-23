import { prisma } from "@/lib/prisma";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
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

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const reqsThisWeek = await prisma.request.count({ where: { createdAt: { gte: sevenDaysAgo } } });
  const reqsLastWeek = await prisma.request.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } });
  
  const approvedThisWeek = await prisma.request.count({ where: { status: "APPROVED", createdAt: { gte: sevenDaysAgo } } });
  const rejectedThisWeek = await prisma.request.count({ where: { status: "REJECTED", createdAt: { gte: sevenDaysAgo } } });
  const approvedLastWeek = await prisma.request.count({ where: { status: "APPROVED", createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } });
  const rejectedLastWeek = await prisma.request.count({ where: { status: "REJECTED", createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } });

  const processedThisWeek = approvedThisWeek + rejectedThisWeek;
  const processedLastWeek = approvedLastWeek + rejectedLastWeek;
  const approvalRateThisWeek = processedThisWeek > 0 ? (approvedThisWeek / processedThisWeek) : 0;
  const approvalRateLastWeek = processedLastWeek > 0 ? (approvedLastWeek / processedLastWeek) : 0;

  const weeklyChange = reqsLastWeek > 0 ? ((reqsThisWeek - reqsLastWeek) / reqsLastWeek) * 100 : (reqsThisWeek > 0 ? 100 : 0);
  const approvalRateChange = (approvalRateThisWeek - approvalRateLastWeek) * 100;

  return (
    <>
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
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
            weeklyChange={weeklyChange}
            approvalRateChange={approvalRateChange}
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
    </>
  );
}
