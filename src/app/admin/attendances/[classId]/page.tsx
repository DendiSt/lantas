import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ExportButtons } from "@/components/admin/attendances/ExportButtons";

export const dynamic = "force-dynamic";

export default async function AdminClassAttendancePage(props: { params: Promise<{ classId: string }>, searchParams: Promise<{ date?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const params = await props.params;
  const searchParams = await props.searchParams;
  const classId = params.classId;
  const dateStr = searchParams.date || new Date().toLocaleDateString('en-CA');
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);

  // Fetch all independent data in parallel (Promise.all) to massively reduce wait time
  const [adminStaff, pendingCount, targetClass, attendances] = await Promise.all([
    // 1. Get Admin Data
    prisma.user.findUnique({ where: { id: session.userId } }),
    // 2. Pending Count
    prisma.request.count({ where: { status: "PENDING" } }),
    // 3. Get Class Data
    prisma.class.findUnique({
      where: { id: classId },
      include: {
        homeroomTeacher: true,
        _count: { select: { students: true } }
      }
    }),
    // 4. Query condition for attendances
    prisma.attendance.findMany({
      where: { 
        date: date,
        student: { classId: classId }
      },
      include: {
        student: true,
        teacher: true
      },
      orderBy: { student: { name: 'asc' } }
    })
  ]);

  const staffName = adminStaff?.name || session.username;

  if (!targetClass) {
    redirect("/admin/attendances");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      <AdminSidebar staffName={staffName} pendingCount={pendingCount} currentPath="/admin/attendances" />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/attendances?date=${dateStr}`} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors">
                <ArrowLeft className="size-5" />
              </Link>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Detail Absensi {targetClass.name}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 ml-10">
              Menampilkan data absensi untuk kelas {targetClass.name} pada tanggal {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <ExportButtons 
            classNameName={targetClass.name} 
            dateStr={dateStr}
            attendances={attendances.map(a => ({
              studentName: a.student.name,
              status: a.status,
              teacherName: a.teacher?.name || "Sistem"
            }))}
          />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full print-container">
          {/* Header Tambahan Khusus Print (Tersembunyi di Web) */}
          <div className="hidden print:block mb-6">
            <h2 className="text-xl font-bold text-center uppercase border-b-2 border-black pb-2">Laporan Rekap Absensi Harian</h2>
            <div className="flex justify-between mt-3 text-sm font-semibold">
              <p>Kelas: {targetClass.name}</p>
              <p>Tanggal: {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center gap-4 no-print">
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
              <button type="submit" className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
                Ubah Tanggal
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden print-table-container">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Nama Siswa</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold">Diinput Oleh</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                        Belum ada data absensi yang disubmit oleh wali kelas pada tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    attendances.map(att => (
                      <tr key={att.id} className="border-b border-slate-100 dark:border-zinc-800 hover:bg-slate-50/50">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {att.student.name}
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
