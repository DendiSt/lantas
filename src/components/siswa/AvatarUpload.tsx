"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Crop } from "lucide-react";
import { updateAvatar } from "@/app/actions/profile";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Cropper from "react-easy-crop";

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "";
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Compress
  const MAX_DIM = 400; // Small for avatar
  if (canvas.width > MAX_DIM || canvas.height > MAX_DIM) {
    const scale = MAX_DIM / Math.max(canvas.width, canvas.height);
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = canvas.width * scale;
    scaledCanvas.height = canvas.height * scale;
    const scaledCtx = scaledCanvas.getContext("2d");
    scaledCtx?.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    return scaledCanvas.toDataURL("image/jpeg", 0.8);
  }

  return canvas.toDataURL("image/jpeg", 0.8);
};

export function AvatarUpload({ currentAvatarUrl, studentName }: { currentAvatarUrl: string | null, studentName: string }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Format file harus berupa gambar (JPG, PNG).");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageSrc(reader.result?.toString() || "");
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCropDialogOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setLoading(true);
    try {
      const base64Image = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      const result = await updateAvatar(base64Image);
      if (result.success) {
        toast.success("Foto profil berhasil diperbarui!");
        setIsCropDialogOpen(false);
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
    <>
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
            className="absolute bottom-0 right-0 p-2 rounded-full bg-slate-900 text-white border-2 border-white dark:border-zinc-950 shadow-md hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
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

      <Dialog open={isCropDialogOpen} onOpenChange={(open) => !open && !loading && setIsCropDialogOpen(false)}>
        <DialogContent className="sm:max-w-md p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <DialogHeader className="pb-3 border-b border-slate-200 dark:border-zinc-800">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Crop className="size-4" />
              <span>Sesuaikan Potongan Foto</span>
            </DialogTitle>
          </DialogHeader>

          <div className="relative w-full h-[300px] bg-slate-900 dark:bg-black rounded-xl overflow-hidden shadow-inner my-2">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                onZoomChange={setZoom}
              />
            )}
          </div>

          <p className="text-[10px] text-center text-slate-500 dark:text-zinc-400">
            Geser (drag) foto dan gunakan scroll untuk zoom in/out
          </p>

          <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => setIsCropDialogOpen(false)}
              className="rounded-xl text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={loading}
              onClick={handleSaveCrop}
              className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl text-xs font-medium cursor-pointer"
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : null}
              Simpan Potongan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
