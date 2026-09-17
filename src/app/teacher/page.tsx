import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  Thermometer, 
  LogOut, 
  XCircle, 
  AlertTriangle,
  CalendarDays,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/");
  }

  // Get Teacher and Class Data
  const teacher = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      homeroomClass: {
        include: {
          students: true,
        },
      },
    },
  });

  const teacherName = teacher?.name || session.username;
  const targetClass = teacher?.homeroomClass;

  if (!targetClass) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col lg:flex-row text-slate-900 dark:text-zinc-100">
        <TeacherSidebar teacherName={teacherName} currentPath="/teacher" />
        <div className="flex-1 lg:pl-64 flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="size-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Anda Belum Menjadi Wali Kelas</h2>
          <p className="text-slate-500 dark:text-zinc-400">Silakan hubungi Admin / Tata Usaha untuk menugaskan Anda ke sebuah kelas.</p>
        </div>
      </div>
    );
  }

  // Current Date
  const dateStr = new Date().toLocaleDateString('en-CA');
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);

  // Parallel Fetching for Dashboard Data
  const [todayAttendances, recentAbsences, allAlphas] = await Promise.all([
    // 1. Today's Attendance
    prisma.attendance.findMany({
      where: {
        date: date,
        student: { classId: targetClass.id }
      }
    }),
    // 2. Recent Absences (Last 10 records != HADIR)
    prisma.attendance.findMany({
      where: {
        student: { classId: targetClass.id },
        status: { not: "HADIR" },
      },
      include: { student: true },
      orderBy: { date: "desc" },
      take: 10
    }),
    // 3. All Alphas for Early Warning
    prisma.attendance.findMany({
      where: {
        student: { classId: targetClass.id },
        status: "ALPHA",
      },
      include: { student: true }
    })
  ]);

  // Process Today's Stats
  const totalStudents = targetClass.students.length;
  let hadir = 0, sakit = 0, izin = 0, alpha = 0;
  
  todayAttendances.forEach(a => {
    if (a.status === "HADIR") hadir++;
    if (a.status === "SAKIT") sakit++;
    if (a.status === "IZIN") izin++;
    if (a.status === "ALPHA") alpha++;
  });
  
  const unrecorded = totalStudents - todayAttendances.length;

  // Process Early Warning (Students with >= 3 Alphas)
  const alphaCountMap = new Map<string, { count: number, name: string }>();
  allAlphas.forEach(a => {
    const existing = alphaCountMap.get(a.studentId) || { count: 0, name: a.student.name };
    existing.count++;
    alphaCountMap.set(a.studentId, existing);
  });
  
  const frequentAlphas = Array.from(alphaCountMap.values())
    .filter(a => a.count >= 3)
    .sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col lg:flex-row text-slate-900 dark:text-zinc-100">
      <TeacherSidebar teacherName={teacherName} className={targetClass.name} currentPath="/teacher" />
      
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight">
              Dashboard Wali Kelas
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Selamat datang kembali, {teacherName}
            </p>
          </div>
          <Link href="/teacher/attendance" className="hidden sm:flex bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold items-center gap-2 transition-all">
            <Users className="size-4" />
            Isi Jurnal Hari Ini
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
          
          {/* Quick Action Mobile */}
          <Link href="/teacher/attendance" className="sm:hidden w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-xs">
            <Users className="size-4" />
            Isi Jurnal Absensi Sekarang
          </Link>

          {/* Today's Summary */}
          <div>
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <CalendarDays className="size-4 text-slate-500" />
              Rekap Absensi Hari Ini
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-xs flex flex-col items-center justify-center text-center">
                <UserCheck className="size-6 text-emerald-500 mb-2" />
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{hadir}</span>
                <span className="text-xs font-semibold text-slate-500 mt-1">Hadir</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-amber-100 dark:border-amber-900 shadow-xs flex flex-col items-center justify-center text-center">
                <Thermometer className="size-6 text-amber-500 mb-2" />
                <span className="text-3xl font-black text-amber-600 dark:text-amber-400">{sakit}</span>
                <span className="text-xs font-semibold text-slate-500 mt-1">Sakit</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-blue-100 dark:border-blue-900 shadow-xs flex flex-col items-center justify-center text-center">
                <LogOut className="size-6 text-blue-500 mb-2" />
                <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{izin}</span>
                <span className="text-xs font-semibold text-slate-500 mt-1">Izin</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-rose-100 dark:border-rose-900 shadow-xs flex flex-col items-center justify-center text-center">
                <XCircle className="size-6 text-rose-500 mb-2" />
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400">{alpha}</span>
                <span className="text-xs font-semibold text-slate-500 mt-1">Alpha</span>
              </div>
            </div>
            
            {unrecorded > 0 && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="size-4" />
                  Ada {unrecorded} siswa yang belum diabsen hari ini.
                </span>
                <Link href="/teacher/attendance" className="font-bold underline">Absen Sekarang</Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Early Warning System */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                <h3 className="font-bold flex items-center gap-2 text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="size-4" />
                  Peringatan Dini (Sering Alpha)
                </h3>
              </div>
              <div className="p-4 flex-1">
                {frequentAlphas.length > 0 ? (
                  <ul className="space-y-3">
                    {frequentAlphas.map((student, idx) => (
                      <li key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700">
                        <span className="text-sm font-semibold">{student.name}</span>
                        <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2 py-1 rounded-md border border-rose-200">
                          {student.count} kali Alpha
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
                    <CheckCircle2 className="size-8 text-emerald-400 mb-2" />
                    <p className="text-xs font-medium text-center">Aman!<br/>Tidak ada siswa yang terlalu sering bolos.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Absences */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                <h3 className="font-bold flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                  <Users className="size-4" />
                  Riwayat Ketidakhadiran Terbaru
                </h3>
              </div>
              <div className="p-0 flex-1 overflow-x-auto">
                {recentAbsences.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <tbody>
                      {recentAbsences.map((att) => {
                        const formattedDate = new Intl.DateTimeFormat("id-ID", {
                          day: "numeric", month: "short"
                        }).format(new Date(att.date));
                        
                        return (
                          <tr key={att.id} className="border-b border-slate-50 dark:border-zinc-800 last:border-0 hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                            <td className="p-3 font-medium text-xs whitespace-nowrap">
                              {formattedDate}
                            </td>
                            <td className="p-3 font-semibold text-slate-900 dark:text-white">
                              {att.student.name}
                            </td>
                            <td className="p-3 text-right">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                                att.status === "SAKIT" ? "bg-amber-100 text-amber-700" :
                                att.status === "IZIN" ? "bg-blue-100 text-blue-700" :
                                "bg-rose-100 text-rose-700"
                              }`}>
                                {att.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                    <p className="text-xs font-medium">Belum ada riwayat ketidakhadiran tercatat.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
