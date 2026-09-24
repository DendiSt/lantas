import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherSidebar } from "@/components/teacher/TeacherSidebar";
import { Calendar } from "lucide-react";
import { AdminAttendanceTableClient } from "@/components/admin/attendances/AdminAttendanceTableClient";
import { SubjectTeacherRecapClient } from "@/components/teacher/SubjectTeacherRecapClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeacherRecapPage(props: { searchParams: Promise<{ date?: string, view?: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    redirect("/");
  }

  const searchParams = await props.searchParams;
  const dateStr = searchParams.date || new Date().toLocaleDateString('en-CA');
  const viewMode = searchParams.view || 'wali';
  const date = new Date(dateStr);
  date.setHours(0,0,0,0);

  // Fetch teacher data
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

  const targetClass = teacher?.homeroomClass;
  const isMapelView = !targetClass || viewMode === 'mapel';

  // If NOT a homeroom teacher, or if they explicitly selected mapel view, fetch attendances they inputted today
  if (isMapelView) {
    const subjectAttendances = await prisma.attendance.findMany({
      where: { 
        date: date,
        teacherId: session.userId
      },
      include: {
        student: { include: { class: true } },
        subject: true
      }
    });

    const mappedAttendances = subjectAttendances.map(a => ({
      id: a.id,
      status: a.status,
      startTime: a.startTime,
      endTime: a.endTime,
      subjectName: a.subject?.name || "Unknown",
      subjectId: a.subjectId || "unknown",
      student: {
        id: a.student.id,
        name: a.student.name,
        className: a.student.class?.name || "Unknown"
      }
    }));

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col lg:flex-row">
        <TeacherSidebar teacherName={teacher?.name || "Guru"} currentPath="/teacher/recap" />
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0 relative">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Rekap Absensi (Guru Mapel)
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Menampilkan jurnal kelas yang telah Anda isi pada tanggal {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full print-container relative">
            <div className="hidden print:block mb-6">
              <h2 className="text-xl font-bold text-center uppercase border-b-2 border-black pb-2">Laporan Rekap Jurnal Kelas</h2>
              <div className="flex justify-between mt-3 text-sm font-semibold">
                <p>Guru: {teacher?.name}</p>
                <p>Tanggal: {new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print relative z-10">
              <form className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="view" value={viewMode} />
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

              {targetClass && (
                <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
                  <Link href={`/teacher/recap?date=${dateStr}&view=wali`} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'wali' ? 'bg-white dark:bg-zinc-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Rekap Wali Kelas</Link>
                  <Link href={`/teacher/recap?date=${dateStr}&view=mapel`} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'mapel' ? 'bg-white dark:bg-zinc-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Jurnal Mengajar</Link>
                </div>
              )}
            </div>

            <SubjectTeacherRecapClient 
              teacherName={teacher?.name || "Guru"}
              dateStr={dateStr}
              attendances={mappedAttendances}
            />
          </main>
        </div>
      </div>
    );
  }

  // --- HOMEROOM TEACHER LOGIC ---
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
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print relative z-10">
            <form className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="view" value={viewMode} />
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

            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
              <Link href={`/teacher/recap?date=${dateStr}&view=wali`} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'wali' ? 'bg-white dark:bg-zinc-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Rekap Wali Kelas</Link>
              <Link href={`/teacher/recap?date=${dateStr}&view=mapel`} className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${viewMode === 'mapel' ? 'bg-white dark:bg-zinc-700 shadow-xs text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Jurnal Mengajar</Link>
            </div>
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
