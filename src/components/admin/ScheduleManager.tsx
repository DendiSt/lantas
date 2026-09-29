"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, CalendarDays, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createSchedule, updateSchedule, deleteSchedule } from "@/app/actions/schedules";
import { ImportSchedulesDialog } from "./ImportSchedulesDialog";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";

const DAYS = [
  { id: 1, name: "Senin" },
  { id: 2, name: "Selasa" },
  { id: 3, name: "Rabu" },
  { id: 4, name: "Kamis" },
  { id: 5, name: "Jumat" },
  { id: 6, name: "Sabtu" }
];

export function ScheduleManager({ initialSchedules, classes, subjects, teachers }: any) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const [formData, setFormData] = useState<any>({
    id: "",
    classId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: 1,
    startTime: "07:00",
    endTime: "08:30"
  });

  const calculateDefaultTime = (classId: string, dayOfWeek: number) => {
    const existingForDayClass = schedules.filter((s: any) => s.classId === classId && s.dayOfWeek === dayOfWeek);
    const count = existingForDayClass.length;

    if (dayOfWeek === 5) { // Jumat
      if (count === 0) return { startTime: "07:30", endTime: "09:30" };
      if (count === 1) return { startTime: "09:30", endTime: "11:30" };
      return { startTime: "13:00", endTime: "15:00" }; 
    } else {
      if (count === 0) return { startTime: "07:30", endTime: "10:00" };
      if (count === 1) return { startTime: "10:00", endTime: "12:00" };
      return { startTime: "13:00", endTime: "15:00" };
    }
  };

  const handleOpenDialog = (schedule?: any) => {
    if (schedule) {
      setFormData({ ...schedule });
    } else {
      const firstSubject = subjects[0];
      const firstTeacher = firstSubject?.teachers?.[0]?.id || teachers[0]?.id || "";
      const defaultClassId = classes[0]?.id || "";
      const defaultDay = 1;
      const { startTime, endTime } = calculateDefaultTime(defaultClassId, defaultDay);
      
      setFormData({
        id: "",
        classId: defaultClassId,
        subjectId: firstSubject?.id || "",
        teacherId: firstTeacher,
        dayOfWeek: defaultDay,
        startTime: startTime,
        endTime: endTime
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let res;
      if (formData.id) {
        res = await updateSchedule(formData.id, formData);
      } else {
        res = await createSchedule(formData);
      }

      if (res.success) {
        toast.success(formData.id ? "Jadwal diperbarui" : "Jadwal ditambahkan");
        setIsDialogOpen(false);
        // Optimistic UI update or rely on router refresh. We rely on refresh since it's easy.
        window.location.reload();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSchedule(id);
      if (res.success) {
        toast.success("Jadwal dihapus");
        setSchedules(schedules.filter((s: any) => s.id !== id));
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan");
    }
  };

  const filtered = schedules.filter((s: any) => {
    if (selectedClass !== "ALL" && s.classId !== selectedClass) return false;
    if (selectedDay !== 0 && s.dayOfWeek !== selectedDay) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.subject.name.toLowerCase().includes(q) || 
             s.teacher.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex w-full sm:w-auto items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Cari guru / mapel..."
              className="pl-9 w-full sm:w-64 h-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="ALL">Semua Kelas</option>
            {classes.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select 
            className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm"
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
          >
            <option value={0}>Semua Hari</option>
            {DAYS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <ImportSchedulesDialog classes={classes} />
          <Button onClick={() => handleOpenDialog()} className="rounded-xl shrink-0">
            <Plus className="size-4 mr-2" />
            Tambah Jadwal
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-zinc-800/50 text-xs text-slate-500 dark:text-zinc-400 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Kelas</th>
                <th className="px-6 py-4 font-semibold">Hari</th>
                <th className="px-6 py-4 font-semibold">Waktu</th>
                <th className="px-6 py-4 font-semibold">Mata Pelajaran</th>
                <th className="px-6 py-4 font-semibold">Guru Pengajar</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {(() => {
                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <CalendarDays className="size-12 mx-auto text-slate-300 mb-3" />
                        Belum ada jadwal yang sesuai
                      </td>
                    </tr>
                  );
                }

                // Calculate row spans
                const spans = filtered.map(() => ({ classSpan: 1, daySpan: 1 }));
                for (let i = 0; i < filtered.length; i++) {
                  if (i > 0 && filtered[i].class.id === filtered[i-1].class.id) {
                    spans[i].classSpan = 0;
                    let p = i - 1;
                    while (p >= 0 && spans[p].classSpan === 0) p--;
                    spans[p].classSpan++;
                  }
                  
                  if (i > 0 && filtered[i].class.id === filtered[i-1].class.id && filtered[i].dayOfWeek === filtered[i-1].dayOfWeek) {
                    spans[i].daySpan = 0;
                    let p = i - 1;
                    while (p >= 0 && spans[p].daySpan === 0) p--;
                    spans[p].daySpan++;
                  }
                }

                return filtered.map((s: any, idx: number) => {
                  const span = spans[idx];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                      {span.classSpan > 0 && (
                        <td 
                          rowSpan={span.classSpan} 
                          className="px-6 py-4 font-bold text-slate-900 dark:text-white align-top bg-white dark:bg-zinc-900 shadow-[inset_-1px_0_0_0_#e2e8f0] dark:shadow-[inset_-1px_0_0_0_#27272a]"
                        >
                          <div className="sticky top-4">
                            {s.class.name}
                          </div>
                        </td>
                      )}
                      {span.daySpan > 0 && (
                        <td 
                          rowSpan={span.daySpan} 
                          className="px-6 py-4 font-medium text-slate-700 dark:text-zinc-300 align-top bg-slate-50/50 dark:bg-zinc-800/30 shadow-[inset_-1px_0_0_0_#e2e8f0] dark:shadow-[inset_-1px_0_0_0_#27272a]"
                        >
                          {DAYS.find(d => d.id === s.dayOfWeek)?.name}
                        </td>
                      )}
                      <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                        {s.startTime} - {s.endTime}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-700 dark:text-zinc-300">{s.subject.name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                        {s.teacher.name}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="icon" className="size-8 rounded-lg cursor-pointer" onClick={() => handleOpenDialog(s)}>
                            <Edit className="size-4" />
                          </Button>
                          <ConfirmDeleteDialog
                            title="Hapus Jadwal?"
                            description={`Apakah Anda yakin ingin menghapus jadwal mata pelajaran ${s.subject.name} untuk guru ${s.teacher.name}?`}
                            onConfirm={() => handleDelete(s.id)}
                            trigger={
                              <Button variant="outline" size="icon" className="size-8 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer">
                                <Trash2 className="size-4" />
                              </Button>
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <CalendarDays className="size-5 text-indigo-600 dark:text-indigo-400" />
                  {formData.id ? "Edit Jadwal" : "Tambah Jadwal Baru"}
                </DialogTitle>
              </DialogHeader>
              
              {(() => {
                const selectedSubject = subjects.find((s: any) => s.id === formData.subjectId);
                const availableTeachers = selectedSubject?.teachers && selectedSubject.teachers.length > 0 
                  ? selectedSubject.teachers 
                  : teachers; // Fallback jika belum di-mapping

                return (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Kelas</Label>
                      <select required className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-transparent text-sm" value={formData.classId} onChange={e => {
                        const newClassId = e.target.value;
                        if (!formData.id) {
                          const { startTime, endTime } = calculateDefaultTime(newClassId, formData.dayOfWeek);
                          setFormData({...formData, classId: newClassId, startTime, endTime});
                        } else {
                          setFormData({...formData, classId: newClassId});
                        }
                      }}>
                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Mata Pelajaran</Label>
                      <select required className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-transparent text-sm" value={formData.subjectId} onChange={e => {
                        const newSubjId = e.target.value;
                        const subj = subjects.find((s:any) => s.id === newSubjId);
                        const firstT = subj?.teachers?.[0]?.id || "";
                        setFormData({...formData, subjectId: newSubjId, teacherId: firstT});
                      }}>
                        {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Guru Pengajar</Label>
                      <select required className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-transparent text-sm" value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})}>
                        {availableTeachers.length === 0 && <option value="">-- Guru Belum Di-assign --</option>}
                        {availableTeachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                <div className="space-y-1.5">
                  <Label>Hari</Label>
                  <select required className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-transparent text-sm" value={formData.dayOfWeek} onChange={e => {
                    const newDay = Number(e.target.value);
                    if (!formData.id) {
                      const { startTime, endTime } = calculateDefaultTime(formData.classId, newDay);
                      setFormData({...formData, dayOfWeek: newDay, startTime, endTime});
                    } else {
                      setFormData({...formData, dayOfWeek: newDay});
                    }
                  }}>
                    {DAYS.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Waktu Mulai</Label>
                      <Input type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Waktu Selesai</Label>
                      <Input type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="h-10 rounded-xl" />
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-zinc-900 bg-slate-50 dark:bg-zinc-900/50 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-md">
                {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
