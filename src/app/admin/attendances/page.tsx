import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getActiveDates } from "@/app/actions/attendance";
import { DateNavigator } from "@/components/ui/DateNavigator";
import { ExportButtons } from "@/components/admin/attendances/ExportButtons";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rekap Absensi | Admin LANTAS",
};

export default async function AdminAttendancesPage(props: { searchParams: Promise<{ date?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const dateStr = searchParams.date || new Date().toLocaleDateString('en-CA');
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);
  
  // Fetch all independent data in parallel
  const [classes, attendancesToday, enabledDates] = await Promise.all([
    prisma.class.findMany({
      orderBy: { name: 'asc' },
      include: {
        homeroomTeacher: true,
        _count: { select: { students: true } }
      }
    }),
    prisma.attendance.findMany({
      where: { date: date },
      select: {
        student: { select: { classId: true } }
      }
    }),
    getActiveDates(date.getMonth(), date.getFullYear())
  ]);

  const submittedClassIds = new Set(
    attendancesToday.map(a => a.student.classId).filter(Boolean)
  );

  const classesWithStats = classes.map(c => ({
    ...c,
    isSubmitted: submittedClassIds.has(c.id)
  }));

  return (
    <>
      <AdminPageHeader
        title="Rekap Absensi"
        description="Pilih kelas untuk memantau detail absensi siswa pada hari tersebut."
        action={
          <ExportButtons
            classNameName="Semua Kelas"
            dateStr={dateStr}
            data={[]}
          />
        }
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">

      {/* Filter Tanggal */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs">
        <DateNavigator
          currentDate={dateStr}
          initialEnabledDates={enabledDates}
        />
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classesWithStats.map(c => (
          <Link key={c.id} href={`/admin/attendances/${c.id}?date=${dateStr}`}>
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {c._count.students} Siswa
                  </p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
                  c.isSubmitted 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' 
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800'
                }`}>
                  {c.isSubmitted ? (
                    <><CheckCircle2 className="size-3.5" /> Sudah Diisi</>
                  ) : (
                    <><XCircle className="size-3.5" /> Belum Diisi</>
                  )}
                </div>
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-500 dark:text-zinc-400">Wali Kelas: </span>
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">
                    {c.homeroomTeacher?.name || "Belum Ditugaskan"}
                  </span>
                </div>
                <ChevronRight className="size-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
        
        {classesWithStats.length === 0 && (
          <div className="col-span-full bg-white dark:bg-zinc-900 p-10 rounded-2xl border border-slate-200 dark:border-zinc-800 text-center text-slate-500">
            Belum ada kelas yang terdaftar di sistem.
          </div>
        )}
      </div>
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
