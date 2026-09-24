"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Key, BookOpen, Check } from "lucide-react";
import { updateTeacherSettings } from "@/app/actions/teacher";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
}

interface TeacherSettingsClientProps {
  allSubjects: Subject[];
  initialSelectedSubjectIds: string[];
}

export function TeacherSettingsClient({ allSubjects, initialSelectedSubjectIds }: TeacherSettingsClientProps) {
  const [password, setPassword] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set(initialSelectedSubjectIds));
  const [loading, setLoading] = useState(false);

  const toggleSubject = (id: string) => {
    const newSet = new Set(selectedSubjects);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedSubjects(newSet);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateTeacherSettings({
      password: password || undefined,
      subjectIds: Array.from(selectedSubjects),
    });

    if (result.success) {
      toast.success("Pengaturan berhasil disimpan");
      if (password) setPassword("");
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      {/* Subject Selection */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Mata Pelajaran yang Diampu</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Pilih mata pelajaran yang Anda ajarkan untuk Jurnal Kelas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allSubjects.map((subject) => {
            const isSelected = selectedSubjects.has(subject.id);
            return (
              <div
                key={subject.id}
                onClick={() => toggleSubject(subject.id)}
                className={`cursor-pointer p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20" 
                    : "border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-zinc-700 bg-slate-50 dark:bg-zinc-900"
                }`}
              >
                <div className={`size-5 rounded-md flex items-center justify-center border ${
                  isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                }`}>
                  {isSelected && <Check className="size-3.5" />}
                </div>
                <span className={`text-sm font-semibold ${isSelected ? "text-indigo-900 dark:text-indigo-300" : "text-slate-700 dark:text-zinc-300"}`}>
                  {subject.name}
                </span>
              </div>
            );
          })}
          {allSubjects.length === 0 && (
            <div className="col-span-full text-center py-6 text-sm text-slate-500">
              Belum ada data mata pelajaran dari admin.
            </div>
          )}
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 flex items-center justify-center">
            <Key className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Ubah Kata Sandi</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Kosongkan jika tidak ingin mengubah kata sandi.</p>
          </div>
        </div>

        <div className="max-w-md">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Kata Sandi Baru</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ketik kata sandi baru..."
            className="w-full mt-1.5 text-sm h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 dark:border-zinc-800 pt-6">
        <Button 
          type="submit" 
          disabled={loading || selectedSubjects.size === 0} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 gap-2"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Simpan Pengaturan
        </Button>
      </div>
    </form>
  );
}
