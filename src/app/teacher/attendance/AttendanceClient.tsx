"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, Loader2, Save, FileText } from "lucide-react";
import { toast } from "sonner";
import { getAttendanceForTimeRange, submitAttendanceForTimeRange } from "@/app/actions/attendance";

type AttendanceStatus = "HADIR" | "SAKIT" | "IZIN" | "ALPHA";

interface Student {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Subject {
  id: string;
  name: string;
}

interface SavedSession {
  subjectId: string;
  subjectName: string;
  startTime: string;
  endTime: string;
}

interface AttendanceClientProps {
  dateStr: string;
  date: Date;
  students: Student[];
  teacherSubjects: Subject[];
  classId: string;
  initialStartTime?: string;
  initialEndTime?: string;
  minStartTime?: string;
  savedSessions?: SavedSession[];
}

export function AttendanceClient({ dateStr, date, students, teacherSubjects, classId, initialStartTime = "07:30", initialEndTime = "08:30", minStartTime, savedSessions }: AttendanceClientProps) {
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [subjectId, setSubjectId] = useState<string>(teacherSubjects.length > 0 ? teacherSubjects[0].id : "");
  
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [lockedStudents, setLockedStudents] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchPeriodData = async () => {
      if (!startTime || !endTime) return;
      setLoading(true);
      const res = await getAttendanceForTimeRange(classId, date, startTime, endTime);
      if (res.success && res.attendanceMap) {
        setAttendance(res.attendanceMap as Record<string, AttendanceStatus>);
        setLockedStudents(new Set(res.lockedStudents));
        setIsSaved(res.isSaved || false);
        if (res.subjectId) {
           setSubjectId(res.subjectId);
        }
      }
      setLoading(false);
    };
    
    const timeoutId = setTimeout(() => {
      fetchPeriodData();
    }, 500); // debounce time inputs
    
    return () => clearTimeout(timeoutId);
  }, [classId, date, startTime, endTime]);

  const setAll = (status: AttendanceStatus) => {
    const newAtt = { ...attendance };
    students.forEach(student => {
      if (!lockedStudents.has(student.id)) {
        newAtt[student.id] = status;
      }
    });
    setAttendance(newAtt);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    if (lockedStudents.has(studentId)) {
      toast.info("Status siswa ini terkunci oleh sistem perizinan TU.");
      return;
    }
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!subjectId) {
      toast.error("Pilih Mata Pelajaran terlebih dahulu");
      return;
    }
    if (!startTime || !endTime) {
      toast.error("Masukan waktu mulai dan selesai dengan benar");
      return;
    }
    if (startTime >= endTime) {
      toast.error("Waktu selesai harus lebih besar dari waktu mulai");
      return;
    }
    if (minStartTime && startTime < minStartTime && !isSaved) {
      toast.error(`Waktu tumpang tindih! Jam kosong dimulai dari ${minStartTime}`);
      return;
    }

    setSaving(true);
    const result = await submitAttendanceForTimeRange(classId, date, startTime, endTime, subjectId, attendance);
    if (result.success) {
      toast.success(`Absensi ${startTime} - ${endTime} berhasil disimpan`);
      setIsSaved(true);
    } else {
      toast.error(result.error);
    }
    setSaving(false);
  };

  const getStatusColor = (currentStatus: AttendanceStatus, targetStatus: AttendanceStatus, isLocked: boolean) => {
    if (currentStatus !== targetStatus) return "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800";
    
    if (isLocked) {
      // Locked styling
      if (targetStatus === "SAKIT") return "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 opacity-70";
      if (targetStatus === "IZIN") return "bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 opacity-70";
    }

    switch (targetStatus) {
      case "HADIR": return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500";
      case "SAKIT": return "bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 ring-1 ring-blue-500";
      case "IZIN": return "bg-amber-50 dark:bg-amber-900/20 border-amber-500 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500";
      case "ALPHA": return "bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-400 ring-1 ring-rose-500";
    }
  };

  if (teacherSubjects.length === 0) {
    return (
      <div className="p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center shadow-xs">
        <FileText className="size-10 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Anda belum mengatur Mata Pelajaran</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 max-w-sm">
          Silakan masuk ke menu Pengaturan dan pilih mata pelajaran yang Anda ampu sebelum mengisi Jurnal Kelas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selection Toolbar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs flex flex-col gap-4">
        <div className="w-full flex flex-col sm:flex-row gap-4">
          <div className="flex gap-4 flex-1">
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Waktu Mulai</label>
              <input
                type="time"
                value={startTime}
                min={minStartTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full h-10 px-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 outline-none focus:border-slate-900 dark:focus:border-white"
              />
            </div>
            
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Waktu Selesai</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full h-10 px-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 outline-none focus:border-slate-900 dark:focus:border-white"
              />
            </div>
          </div>
          
          <div className="space-y-1.5 sm:w-1/3 w-full shrink-0">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Mata Pelajaran</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full h-10 px-3 text-sm font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 outline-none focus:border-slate-900 dark:focus:border-white"
            >
              {teacherSubjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Edit Cepat: Shortcut Buttons for saved sessions */}
        {savedSessions && savedSessions.length > 0 && (
          <div className="w-full flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
            <span className="text-xs font-semibold text-slate-500 mr-1">Edit Cepat:</span>
            {savedSessions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setStartTime(s.startTime);
                  setEndTime(s.endTime);
                  setSubjectId(s.subjectId);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
              >
                {s.subjectName} ({s.startTime} - {s.endTime})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Tanggal: <span className="text-indigo-600 dark:text-indigo-400">{new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Total {students.length} siswa di kelas ini.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button onClick={() => setAll("HADIR")} disabled={isSaved} variant="outline" size="sm" className="rounded-xl text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 h-9 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Set Semua Hadir</Button>
          <Button onClick={() => setAll("ALPHA")} disabled={isSaved} variant="outline" size="sm" className="rounded-xl text-xs bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800 h-9 shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Set Semua Alpha</Button>
        </div>
      </div>

      <div className={`bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-opacity duration-200 relative ${loading ? 'opacity-60 pointer-events-none' : ''}`}>
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/20 dark:bg-zinc-900/20 backdrop-blur-[1px]">
            <Loader2 className="size-8 animate-spin text-indigo-500 drop-shadow-md" />
          </div>
        )}
        <div className="divide-y divide-slate-100 dark:divide-zinc-800">
          {students.map((student, idx) => {
            const currentStatus = attendance[student.id] || "HADIR"; // default to HADIR if untouched
            const isLocked = lockedStudents.has(student.id);

            return (
              <div key={student.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4 text-right">{idx + 1}.</span>
                  <div className="size-8 sm:size-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 overflow-hidden">
                    {student.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={student.avatarUrl} alt={student.name} className="size-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-slate-500">{student.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{student.name}</h3>
                    {isLocked && (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
                        <Clock className="size-3" /> Sistem TU
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-7 sm:pl-0 w-full sm:w-auto">
                  {(!isLocked || currentStatus === "HADIR" || currentStatus === "ALPHA") && (
                    <button 
                      onClick={() => handleStatusChange(student.id, "HADIR")}
                      disabled={isLocked || isSaved}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${getStatusColor(currentStatus, "HADIR", isLocked)} ${(isLocked || isSaved) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <Check className="size-3.5" /> <span className="hidden sm:inline">Hadir</span><span className="sm:hidden">H</span>
                    </button>
                  )}
                  
                  {isLocked && currentStatus === "SAKIT" && (
                    <button 
                      disabled={true}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${getStatusColor(currentStatus, "SAKIT", isLocked)} cursor-not-allowed opacity-60`}
                      title="Terkunci (Izin Sakit)"
                    >
                      <FileText className="size-3.5" /> <span className="hidden sm:inline">Sakit</span><span className="sm:hidden">S</span>
                    </button>
                  )}

                  {isLocked && currentStatus === "IZIN" && (
                    <button 
                      disabled={true}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${getStatusColor(currentStatus, "IZIN", isLocked)} cursor-not-allowed opacity-60`}
                      title="Terkunci (Izin Keluar)"
                    >
                      <Clock className="size-3.5" /> <span className="hidden sm:inline">Izin</span><span className="sm:hidden">I</span>
                    </button>
                  )}

                  {(!isLocked || currentStatus === "HADIR" || currentStatus === "ALPHA") && (
                    <button 
                      onClick={() => handleStatusChange(student.id, "ALPHA")}
                      disabled={isLocked || isSaved}
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${getStatusColor(currentStatus, "ALPHA", isLocked)} ${(isLocked || isSaved) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    >
                      <X className="size-3.5" /> <span className="hidden sm:inline">Alpha</span><span className="sm:hidden">A</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="sticky bottom-4 z-10 p-4 mt-6 bg-slate-900/90 dark:bg-zinc-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-800/50 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-slate-300 dark:text-zinc-300 text-xs sm:text-sm text-center sm:text-left">
          <span className="font-bold text-white">Sudah selesai?</span> Pastikan absensi dari {startTime} - {endTime} sudah sesuai.
        </div>
        <Button 
          onClick={isSaved ? () => setIsSaved(false) : handleSubmit} 
          disabled={saving || loading || !subjectId || !startTime || !endTime} 
          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 px-6 font-bold shadow-xs cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <><Loader2 className="size-4 mr-2 animate-spin" /> Menyimpan...</>
          ) : isSaved ? (
            <><Check className="size-4 mr-2" /> Edit Absensi</>
          ) : (
            <><Save className="size-4 mr-2" /> Simpan Absensi</>
          )}
        </Button>
      </div>
    </div>
  );
}
