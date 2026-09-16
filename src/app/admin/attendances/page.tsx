import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Calendar, Filter } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAttendancesPage(props: { searchParams: Promise<{ date?: string, classId?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const dateStr = searchParams.date || new Date().toISOString().split('T')[0];
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);
  
  const selectedClassId = searchParams.classId || "ALL";

  // Get Admin Data
  const adminStaff = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  const staffName = adminStaff?.name || session.username;

  // Pending Count
  const pendingCount = await prisma.request.count({ where: { status: "PENDING" } });

  // Get all classes
  const classes = await prisma.class.findMany({
    orderBy: { name: 'asc' },
    include: {
      homeroomTeacher: true,
      _count: { select: { students: true } }
    }
  });

  // Query condition for attendances
  const where: any = { date: date };
  if (selectedClassId !== "ALL") {
    where.student = { classId: selectedClassId };
  }

  const attendances = await prisma.attendance.findMany({
    where,
    include: {
      student: {
        include: { class: true }
      },
      teacher: true
    },
    orderBy: [
      { student: { class: { name: 'asc' } } },
      { student: { name: 'asc' } }
    ]
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex">
      <AdminSidebar staffName={staffName} pendingCount={pendingCount} currentPath="/admin/attendances" />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Rekap Absensi Harian
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Pemantauan absensi harian dari seluruh Jurnal Kelas Guru.
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
          {/* Filters */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center gap-4">
            <form className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-slate-500" />
                <input 
                  type="date" 
                  name="date"
                  defaultValue={dateStr}
                  className="h-9 px-3 rounded-lg border-slate-200 text-sm focus:ring-slate-900" 
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-slate-500" />
                <select 
                  name="classId"
                  defaultValue={selectedClassId}
                  className="h-9 px-3 rounded-lg border-slate-200 text-sm focus:ring-slate-900"
                >
                  <option value="ALL">Semua Kelas</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
                Terapkan
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Nama Siswa</th>
                    <th className="px-6 py-3 font-semibold">Kelas</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Diinput Oleh</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                        Belum ada data absensi yang disubmit oleh guru pada tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    attendances.map(att => (
                      <tr key={att.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {att.student.name}
                        </td>
                        <td className="px-6 py-4">
                          {att.student.class?.name || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            att.status === "HADIR" ? "bg-emerald-100 text-emerald-700" :
                            att.status === "ALPHA" ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {att.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {att.teacher?.name || "Sistem"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
