import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { Calendar } from "lucide-react";
import { AdminAttendanceTableClient } from "@/components/admin/attendances/AdminAttendanceTableClient";

export const dynamic = "force-dynamic";

export default async function TeacherRecapPage(props: { searchParams: Promise<{ date?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const dateStr = searchParams.date || new Date().toLocaleDateString('en-CA');
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);

  // Fetch teacher's homeroom class and attendances
  const teacher = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      homeroomClass: {
        include: {
          students: { orderBy: { name: 'asc' } }
        }
      }
    }
  });

  if (!teacher?.homeroomClass) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center text-slate-500">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Akses Ditolak</h1>
        <p>Anda belum ditugaskan sebagai Wali Kelas. Hubungi TU.</p>
      </div>
    );
  }

  const targetClass = teacher.homeroomClass;

  const attendances = await prisma.attendance.findMany({
    where: { 
      date: date,
      student: { classId: targetClass.id }
    },
    include: {
      student: true,
      teacher: true,
      subject: true
    },
    orderBy: { startTime: 'asc' }
  });

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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
      <TeacherSidebar teacherName={teacher.name} className={targetClass.name} currentPath="/teacher/recap" />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0 relative">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Rekap Absensi Kelas {targetClass.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Menampilkan data absensi untuk kelas {targetClass.name} pada tanggal {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full print-container relative">
          {/* Header Tambahan Khusus Print (Tersembunyi di Web) */}
          <div className="hidden print:block mb-6">
            <h2 className="text-xl font-bold text-center uppercase border-b-2 border-black pb-2">Laporan Rekap Absensi Harian</h2>
            <div className="flex justify-between mt-3 text-sm font-semibold">
              <p>Kelas: {targetClass.name}</p>
              <p>Wali Kelas: {teacher.name}</p>
              <p>Tanggal: {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center gap-4 no-print relative z-10">
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

          <AdminAttendanceTableClient 
            className={targetClass.name}
            dateStr={dateStr}
            groupedAttendances={groupedAttendances}
            availableSubjects={availableSubjects}
          />
        </main>
      </div>
    </div>
  );
}
