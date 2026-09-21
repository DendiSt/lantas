"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateCurrentAdminProfile } from "@/app/actions/admins";
import { Loader2, Edit } from "lucide-react";

export function UpdateAdminProfileForm({ 
  initialName, 
  initialUsername 
}: { 
  initialName: string; 
  initialUsername: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await updateCurrentAdminProfile(formData);
    
    if (result.success) {
      toast.success("Profil berhasil diperbarui");
      setIsEditing(false);
    } else {
      toast.error(result.error || "Gagal memperbarui profil");
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Nama Lengkap</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={initialName} 
          required 
          disabled={!isEditing}
          className="h-10 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 disabled:opacity-70"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Username</Label>
        <Input 
          id="username" 
          name="username" 
          defaultValue={initialUsername} 
          required 
          disabled={!isEditing}
          className="h-10 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 disabled:opacity-70"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        {isEditing ? (
          <>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
              className="rounded-xl shadow-xs"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </>
        ) : (
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="rounded-xl shadow-xs gap-2"
          >
            <Edit className="size-4" />
            Edit Profil
          </Button>
        )}
      </div>
    </form>
  );
}
