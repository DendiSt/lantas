"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Key, BookOpen, Check, Eye, EyeOff } from "lucide-react";
import { updateTeacherSettings } from "@/app/actions/teacher";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Subject {
  id: string;
  name: string;
}

interface TeacherSettingsClientProps {
  allSubjects: Subject[];
  initialSelectedSubjectIds: string[];
}

export function TeacherSettingsClient({ allSubjects, initialSelectedSubjectIds }: TeacherSettingsClientProps) {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isEditingSubjects, setIsEditingSubjects] = useState(initialSelectedSubjectIds.length === 0);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set(initialSelectedSubjectIds));
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const toggleSubject = (id: string) => {
    const newSet = new Set(selectedSubjects);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedSubjects(newSet);
  };

  const handleSaveSubjects = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateTeacherSettings({
      subjectIds: Array.from(selectedSubjects),
    });

    if (result.success) {
      toast.success("Mata pelajaran berhasil disimpan");
      setIsEditingSubjects(false);
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) return toast.error("Kata sandi saat ini wajib diisi");
    if (!newPassword) return toast.error("Kata sandi baru wajib diisi");
    if (newPassword !== confirmPassword) {
      return toast.error("Konfirmasi kata sandi baru tidak sama");
    }

    setPasswordLoading(true);

    const result = await updateTeacherSettings({
      currentPassword,
      newPassword,
      subjectIds: Array.from(selectedSubjects), // Preserve subjects
    });

    if (result.success) {
      toast.success("Kata sandi berhasil diperbarui");
      setIsEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(result.error);
    }

    setPasswordLoading(false);
  };
  return (
    <div className="space-y-8 max-w-3xl">
      <form onSubmit={handleSaveSubjects}>
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

        {isEditingSubjects ? (
          <>
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

            <div className="flex justify-end gap-2 border-t border-slate-200 dark:border-zinc-800 pt-6 mt-6">
              {initialSelectedSubjectIds.length > 0 && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setSelectedSubjects(new Set(initialSelectedSubjectIds));
                    setIsEditingSubjects(false);
                  }}
                  className="rounded-xl h-11 px-6 cursor-pointer"
                >
                  Batal
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={loading || selectedSubjects.size === 0} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-6 gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Simpan Pengaturan
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {allSubjects.filter(s => selectedSubjects.has(s.id)).map(subject => (
                <div key={subject.id} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                  <Check className="size-4" />
                  <span className="text-sm font-bold">{subject.name}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-slate-200 dark:border-zinc-800 pt-6 mt-6">
              <Button 
                type="button"
                onClick={() => setIsEditingSubjects(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 cursor-pointer"
              >
                Ubah Pengaturan
              </Button>
            </div>
          </>
        )}
        </div>
      </form>

      {/* Account Settings */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs p-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 flex items-center justify-center">
            <Key className="size-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Ubah Kata Sandi</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Atur kata sandi untuk melindungi akun Anda.</p>
          </div>
          
          <Dialog open={isEditingPassword} onOpenChange={setIsEditingPassword}>
            <DialogTrigger className="inline-flex items-center justify-center h-9 px-4 text-xs font-medium border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 rounded-xl cursor-pointer transition-colors">
              Ubah Kata Sandi
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-6 rounded-2xl">
              <DialogHeader className="mb-4">
                <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                  <Key className="size-5" /> Ganti Kata Sandi
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSavePassword} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Kata Sandi Saat Ini</label>
                  <div className="relative mt-1.5">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full text-sm h-11 px-3 pr-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 outline-none"
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                      {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Kata Sandi Baru</label>
                  <div className="relative mt-1.5">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-sm h-11 px-3 pr-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 outline-none"
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                      {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative mt-1.5">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-sm h-11 px-3 pr-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-indigo-500 outline-none"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300">
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <Button type="button" variant="outline" onClick={() => setIsEditingPassword(false)} className="rounded-xl h-10 text-xs cursor-pointer">
                    Batal
                  </Button>
                  <Button type="submit" disabled={passwordLoading} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-6 text-xs font-bold cursor-pointer">
                    {passwordLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                    Perbarui Kata Sandi
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
