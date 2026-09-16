"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Save, Check, ChevronsUpDown } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";

export function ProfileForm({ student, classes }: { student: any; classes: any[] }) {
  const [state, formAction, isPending] = useActionState<any, FormData>(
    updateProfile,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success("Profil berhasil diperbarui");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const defaultDate = student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : "";

  // Searchable dropdown state
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [classQuery, setClassQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState(student.classId || "");
  const classDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (classDropdownRef.current && !classDropdownRef.current.contains(event.target as Node)) {
        setIsClassOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClasses = classes.filter((c) =>
    c.name.toLowerCase().includes(classQuery.toLowerCase())
  );
  
  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Data Diri</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Lengkapi data Anda dengan benar.</p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">NISN</Label>
            <Input name="nisn" required defaultValue={student.nisn || ""} placeholder="Contoh: 0012345678" className="text-xs h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5 relative" ref={classDropdownRef}>
            <Label className="text-xs font-semibold">Kelas</Label>
            <input type="hidden" name="classId" value={selectedClassId} required />
            <button
              type="button"
              onClick={() => setIsClassOpen(!isClassOpen)}
              className="w-full flex items-center justify-between px-3 h-10 text-xs rounded-xl border border-slate-200 dark:border-zinc-800 bg-transparent focus:border-slate-900 outline-none"
            >
              <span className={selectedClass ? "text-slate-900 dark:text-white" : "text-slate-400"}>
                {selectedClass ? selectedClass.name : "Pilih Kelas"}
              </span>
              <ChevronsUpDown className="size-3.5 opacity-50" />
            </button>

            {isClassOpen && (
              <div className="absolute top-full left-0 mt-1 w-full z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg max-h-48 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-slate-100 dark:border-zinc-800">
                  <Input 
                    placeholder="Cari kelas..." 
                    value={classQuery}
                    onChange={(e) => setClassQuery(e.target.value)}
                    className="h-8 text-xs rounded-lg bg-slate-50 dark:bg-zinc-800/50 border-none"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto p-1 flex-1">
                  {filteredClasses.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500">Kelas tidak ditemukan</div>
                  ) : (
                    filteredClasses.map((cls) => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          setClassQuery("");
                          setIsClassOpen(false);
                        }}
                        className={`w-full text-left flex items-center justify-between px-2 py-2 text-xs rounded-lg transition-colors ${
                          selectedClassId === cls.id 
                            ? "bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-medium" 
                            : "text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        {cls.name}
                        {selectedClassId === cls.id && <Check className="size-3.5" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tanggal Lahir</Label>
            <Input name="birthDate" type="date" required defaultValue={defaultDate} className="text-xs h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Jenis Kelamin</Label>
            <select name="gender" required defaultValue={student.gender || ""} className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-transparent focus:border-slate-900 outline-none">
              <option value="">Pilih</option>
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Alamat Lengkap</Label>
          <Input name="address" required defaultValue={student.address || ""} placeholder="Contoh: Jl. Merdeka No. 1, Subang" className="text-xs h-10 rounded-xl" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">No. HP / WA</Label>
            <Input name="phone" required defaultValue={student.phone || ""} placeholder="Contoh: 08123456789" className="text-xs h-10 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nama Orang Tua</Label>
            <Input name="parentName" required defaultValue={student.parentName || ""} placeholder="Nama Ayah / Ibu" className="text-xs h-10 rounded-xl" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl font-semibold mt-4 gap-2"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          <span>{isPending ? "Menyimpan..." : "Simpan Profil"}</span>
        </Button>
      </form>
    </div>
  );
}
