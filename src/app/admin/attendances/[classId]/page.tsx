import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminAttendanceTableClient } from "@/components/admin/attendances/AdminAttendanceTableClient";
import { getActiveDates } from "@/app/actions/attendance";
import { DateNavigator } from "@/components/ui/DateNavigator";

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

  const [adminStaff, targetClass, attendances, enabledDates] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.class.findUnique({
      where: { id: classId },
      include: {
        homeroomTeacher: true,
        students: { orderBy: { name: 'asc' } }
      }
    }),
    prisma.attendance.findMany({
      where: { 
        date: date,
        student: { classId: classId }
      },
      include: {
        subject: true,
        teacher: true
      },
      orderBy: { startTime: 'asc' }
    }),
    getActiveDates(date.getMonth(), date.getFullYear(), classId)
  ]);

  if (!targetClass) redirect("/admin/attendances");

  // Get distinct subjects + time range for this day
  const subjectMap = new Map<string, {id: string, name: string}>();
  attendances.forEach(att => {
    if (att.subject) {
      const uniqueId = `${att.subject.id}-${att.startTime}-${att.endTime}`;
      const displayName = `${att.subject.name} (${att.startTime} - ${att.endTime})`;
      subjectMap.set(uniqueId, { id: uniqueId, name: displayName });
    }
  });
  const availableSubjects = Array.from(subjectMap.values());

  // Group attendances by student
  const groupedAttendances = targetClass.students.map(student => {
    const studentRecords = attendances.filter(a => a.studentId === student.id);
    return {
      student: { id: student.id, name: student.name },
      records: studentRecords.map(r => ({
        id: r.id,
        status: r.status,
        startTime: r.startTime,
        endTime: r.endTime,
        subjectIdWithTime: r.subject ? `${r.subject.id}-${r.startTime}-${r.endTime}` : null,
        teacherName: r.teacher?.name || "Sistem"
      }))
    };
  });

  return (
    <>
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0 relative">
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
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full print-container relative">
          
          <div className="hidden print:block mb-6">
            <h2 className="text-xl font-bold text-center uppercase border-b-2 border-black pb-2">Laporan Rekap Absensi Harian</h2>
            <div className="flex justify-between mt-3 text-sm font-semibold">
              <p>Kelas: {targetClass.name}</p>
              <p>Tanggal: {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center gap-4 no-print relative z-10">
            <DateNavigator
              currentDate={dateStr}
              initialEnabledDates={enabledDates}
              classId={classId}
              basePath={`/admin/attendances/${classId}`}
            />
          </div>

          <AdminAttendanceTableClient 
            className={targetClass.name}
            dateStr={dateStr}
            groupedAttendances={groupedAttendances}
            availableSubjects={availableSubjects}
          />
        </main>
    </>
  );
}
