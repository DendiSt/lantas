"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, Save } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { toast } from "sonner";
import { useEffect } from "react";

export function ProfileForm({ student }: { student: any }) {
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
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Kelas</Label>
            <Input name="classId" required defaultValue={student.classId || ""} placeholder="Contoh: 10 TAB B" className="text-xs h-10 rounded-xl" />
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
