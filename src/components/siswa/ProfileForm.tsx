"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Save, Edit } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function ProfileForm({ student, classes }: { student: any; classes: any[] }) {
  const [state, formAction, isPending] = useActionState<any, FormData>(
    updateProfile,
    null
  );

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success("Profil berhasil diperbarui");
      setIsEditing(false);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const defaultDate = student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : "";

  const selectedClass = classes.find(c => c.id === student.classId);

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
            <div className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center px-3 text-slate-500">
              {student.nisn || "-"}
            </div>
            <p className="text-[10px] text-slate-400">NISN hanya dapat diubah oleh Admin TU.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Kelas</Label>
            <div className="text-xs h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center px-3 text-slate-500">
              {selectedClass ? selectedClass.name : "Belum diatur"}
            </div>
            <p className="text-[10px] text-slate-400">Perpindahan kelas diatur oleh Admin TU.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tanggal Lahir</Label>
            <Input name="birthDate" type="date" required defaultValue={defaultDate} disabled={!isEditing} className="text-xs h-10 rounded-xl disabled:opacity-70" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Jenis Kelamin</Label>
            <select name="gender" required defaultValue={student.gender || ""} disabled={!isEditing} className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-transparent focus:border-slate-900 outline-none disabled:opacity-70">
              <option value="">Pilih</option>
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Alamat Lengkap</Label>
          <Input name="address" required defaultValue={student.address || ""} disabled={!isEditing} placeholder="Contoh: Jl. Merdeka No. 1, Subang" className="text-xs h-10 rounded-xl disabled:opacity-70" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">No. HP / WA</Label>
            <Input name="phone" required defaultValue={student.phone || ""} disabled={!isEditing} placeholder="Contoh: 08123456789" className="text-xs h-10 rounded-xl disabled:opacity-70" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nama Orang Tua</Label>
            <Input name="parentName" required defaultValue={student.parentName || ""} disabled={!isEditing} placeholder="Nama Ayah / Ibu" className="text-xs h-10 rounded-xl disabled:opacity-70" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 mt-4">
          {isEditing ? (
            <>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
                className="h-11 rounded-xl shadow-xs w-full sm:w-auto px-6"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-11 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl font-semibold shadow-xs w-full sm:w-auto px-6 gap-2"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                <span>{isPending ? "Menyimpan..." : "Simpan Profil"}</span>
              </Button>
            </>
          ) : (
            <Button 
              type="button" 
              onClick={() => setIsEditing(true)}
              className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs w-full sm:w-auto px-6 gap-2"
            >
              <Edit className="size-4" />
              <span>Edit Profil</span>
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
