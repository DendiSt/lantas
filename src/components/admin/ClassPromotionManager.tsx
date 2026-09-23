"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Loader2, Users, ArrowUpCircle } from "lucide-react";
import { promoteStudents } from "@/app/actions/students";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Student {
  id: string;
  name: string;
  nisn: string | null;
  username: string;
}

interface ClassData {
  id: string;
  name: string;
  students: Student[];
}

export function ClassPromotionManager({ classes }: { classes: ClassData[] }) {
  const [sourceClassId, setSourceClassId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const sourceClass = classes.find(c => c.id === sourceClassId);
  const sourceStudents = sourceClass?.students || [];

  const allSelected = sourceStudents.length > 0 && sourceStudents.every(s => selectedIds.has(s.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sourceStudents.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handlePromote = async () => {
    setLoading(true);
    const ids = Array.from(selectedIds);
    const result = await promoteStudents(ids, targetClassId);

    if (result.success) {
      toast.success(`${result.promoted} siswa berhasil dipindahkan ke ${result.targetClassName}`);
      setSelectedIds(new Set());
      setSourceClassId("");
      setTargetClassId("");
      setShowConfirm(false);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const targetClassName = classes.find(c => c.id === targetClassId)?.name || "";

  return (
    <div className="space-y-6">
      {/* Step 1 & 2: Select Classes */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Kelas Asal</label>
          <select
            value={sourceClassId}
            onChange={(e) => { setSourceClassId(e.target.value); setSelectedIds(new Set()); }}
            className="w-full text-sm h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-slate-900 outline-none font-semibold"
          >
            <option value="">Pilih Kelas Asal</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name} ({cls.students.length} siswa)</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center pb-1">
          <div className="size-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
            <ArrowRight className="size-5 text-slate-500" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Kelas Tujuan</label>
          <select
            value={targetClassId}
            onChange={(e) => setTargetClassId(e.target.value)}
            className="w-full text-sm h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-slate-900 outline-none font-semibold"
          >
            <option value="">Pilih Kelas Tujuan</option>
            {classes.filter(c => c.id !== sourceClassId).map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List from Source Class */}
      {sourceClassId && sourceStudents.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="size-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Pilih Semua ({sourceStudents.length} siswa)
              </span>
            </div>
            {selectedIds.size > 0 && (
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {selectedIds.size} dipilih
              </span>
            )}
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-zinc-800 max-h-[400px] overflow-y-auto">
            {sourceStudents.map((student, idx) => (
              <label
                key={student.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors ${selectedIds.has(student.id) ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(student.id)}
                  onChange={() => toggleSelect(student.id)}
                  className="size-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                />
                <div className="size-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                  <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{student.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">@{student.username} {student.nisn ? `• NISN: ${student.nisn}` : ''}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : sourceClassId ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
            <Users className="size-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Kelas ini kosong</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Tidak ada siswa di kelas ini.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
            <ArrowUpCircle className="size-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Pilih Kelas Asal</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Pilih kelas asal terlebih dahulu untuk menampilkan daftar siswa.</p>
        </div>
      )}

      {/* Action Button */}
      {selectedIds.size > 0 && targetClassId && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowConfirm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs gap-2 h-10 px-5 cursor-pointer"
          >
            <ArrowUpCircle className="size-4" />
            Pindahkan {selectedIds.size} Siswa ke {targetClassName}
          </Button>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm p-5 rounded-2xl">
          <DialogHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ArrowUpCircle className="size-4 text-indigo-600" />
              Konfirmasi Perpindahan
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Anda akan memindahkan <strong className="text-slate-900 dark:text-white">{selectedIds.size} siswa</strong> dari
              kelas <strong className="text-slate-900 dark:text-white">{sourceClass?.name}</strong> ke
              kelas <strong className="text-indigo-600">{targetClassName}</strong>.
            </p>
            <p className="text-[10px] text-slate-500">Tindakan ini dapat dibatalkan dengan memindahkan kembali siswa secara manual.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)} className="rounded-xl text-xs cursor-pointer">
              Batal
            </Button>
            <Button size="sm" disabled={loading} onClick={handlePromote} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs gap-1.5 cursor-pointer">
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              Konfirmasi Pindah
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
