"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitAttendance } from "@/app/actions/attendance";
import { AttendanceStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, CheckCircle2, ShieldAlert, Check, X, Edit3 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export function AttendanceClient({ 
  dateStr, 
  students, 
  initialAttendanceMap, 
  lockedStudents,
  className,
  hasSubmittedToday
}: { 
  dateStr: string, 
  students: Student[], 
  initialAttendanceMap: Record<string, string>,
  lockedStudents: string[],
  className: string,
  hasSubmittedToday: boolean
}) {
  const router = useRouter();
  const [attendance, setAttendance] = useState<Record<string, string>>(initialAttendanceMap);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [isFormLocked, setIsFormLocked] = useState(hasSubmittedToday);

  // Sync state when initial props change from a server refresh
  useEffect(() => {
    setAttendance(initialAttendanceMap);
  }, [initialAttendanceMap]);

  const handleStatusChange = (studentId: string, status: string) => {
    if (lockedStudents.includes(studentId) || isFormLocked) return;
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const setAllStatus = (status: string) => {
    if (isFormLocked) return;
    const newAtt = { ...attendance };
    students.forEach(s => {
      if (!lockedStudents.includes(s.id)) {
        newAtt[s.id] = status;
      }
    });
    setAttendance(newAtt);
  };

  const onSubmit = () => {
    startTransition(async () => {
      try {
        const records = students.map(s => ({
          studentId: s.id,
          status: (attendance[s.id] as AttendanceStatus) || "HADIR"
        }));
        await submitAttendance(dateStr, records);
        router.refresh();
        setMessage({ type: 'success', text: 'Absensi berhasil disimpan! Data telah terkirim ke Admin.' });
        setIsFormLocked(true);
        setTimeout(() => setMessage(null), 3000);
      } catch (e: any) {
        setMessage({ type: 'error', text: e.message || 'Gagal menyimpan absensi' });
      }
    });
  };

  const formattedDate = new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Calendar className="size-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Jurnal Hari Ini</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFormLocked ? (
            <Button onClick={() => setIsFormLocked(false)} variant="outline" className="text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
              <Edit3 className="size-3.5 mr-2" /> Edit Absensi
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setAllStatus("HADIR")} className="text-xs h-8">
                <Check className="size-3.5 mr-1 text-emerald-500" /> Hadir Semua
              </Button>
              <Button variant="outline" size="sm" onClick={() => setAllStatus("ALPHA")} className="text-xs h-8">
                <X className="size-3.5 mr-1 text-rose-500" /> Alpha Semua
              </Button>
              <Button onClick={onSubmit} disabled={isPending} className="text-xs h-8 ml-2 bg-slate-900 hover:bg-slate-800 text-white">
                {isPending ? <Loader2 className="size-3.5 mr-2 animate-spin" /> : <CheckCircle2 className="size-3.5 mr-2" />}
                Simpan Absen
              </Button>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
          {message.text}
        </div>
      )}

      {/* Student List */}
      <div className="flex flex-col gap-3">
        {students.map((student) => {
          const isLocked = lockedStudents.includes(student.id);
          const currentStatus = attendance[student.id] || "HADIR";

          return (
            <div 
              key={student.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                isLocked 
                  ? "bg-slate-50 border-slate-200 dark:bg-zinc-800/50 dark:border-zinc-700 opacity-80" 
                  : currentStatus === "HADIR"
                    ? "bg-white border-slate-200 dark:bg-zinc-900 dark:border-zinc-800"
                    : currentStatus === "ALPHA"
                      ? "bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/50"
                      : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-slate-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
                  {student.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={student.avatarUrl} alt={student.name} className="size-full object-cover" />
                  ) : (
                    <span className="font-bold text-xs text-slate-500 dark:text-zinc-400">
                      {student.name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[120px]">{student.name}</p>
                  {isLocked && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                      <ShieldAlert className="size-3 text-amber-500" /> Tersinkronisasi TU
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                <button
                  disabled={isLocked || isFormLocked}
                  onClick={() => handleStatusChange(student.id, "HADIR")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    currentStatus === "HADIR"
                      ? "bg-white dark:bg-zinc-600 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-700 disabled:opacity-50"
                  }`}
                >
                  Hadir
                </button>
                <button
                  disabled={isLocked || isFormLocked}
                  onClick={() => handleStatusChange(student.id, "ALPHA")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    currentStatus === "ALPHA"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-700 disabled:opacity-50"
                  }`}
                >
                  Alpha
                </button>
                {isLocked && (
                  <div className="px-3 py-1 text-xs font-semibold rounded-md bg-amber-500 text-white shadow-xs ml-1">
                    {currentStatus}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
