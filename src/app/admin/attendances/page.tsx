import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Calendar, Users, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAttendancesPage(props: { searchParams: Promise<{ date?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const dateStr = searchParams.date || new Date().toLocaleDateString('en-CA');
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);
  
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

  // Calculate submission status for each class
  const classesWithStats = await Promise.all(classes.map(async c => {
    const submittedCount = await prisma.attendance.count({
      where: {
        date: date,
        student: { classId: c.id }
      }
    });
    return { 
      ...c, 
      isSubmitted: submittedCount > 0 
    };
  }));

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
              Pilih kelas untuk memantau detail absensi siswa pada hari tersebut.
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
              <button type="submit" className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">
                Terapkan Tanggal
              </button>
            </form>
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
      </div>
    </div>
  );
}
