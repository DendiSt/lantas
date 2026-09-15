"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { updateAvatar } from "@/app/actions/profile";
import { toast } from "sonner";

function compressAvatar(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 400; // Small for avatar
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export function AvatarUpload({ currentAvatarUrl, studentName }: { currentAvatarUrl: string | null, studentName: string }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar (JPG, PNG).");
      return;
    }

    setLoading(true);
    try {
      const base64Image = await compressAvatar(file);
      
      const result = await updateAvatar(base64Image);
      if (result.success) {
        toast.success("Foto profil berhasil diperbarui!");
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat memproses gambar.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center gap-5">
      <div className="relative">
        <div className="size-24 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-inner">
          {currentAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentAvatarUrl} alt={studentName} className="size-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-slate-400">
              {studentName.charAt(0)}
            </span>
          )}
        </div>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange} 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 text-white border-2 border-white dark:border-zinc-950 shadow-md hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <Camera className="size-3" />}
        </button>
      </div>
      <div className="text-center sm:text-left">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{studentName}</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xs mt-1">
          Gunakan foto formal dengan seragam sekolah agar mudah dikenali oleh Admin TU saat verifikasi izin.
        </p>
      </div>
    </div>
  );
}
