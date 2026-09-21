"use client";

import { useState, useActionState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createPermissionRequest, updatePermissionRequest, CreateRequestState } from "@/app/actions/requests";
import {
  Plus,
  Thermometer,
  LogOut,
  FileQuestion,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Users,
  Tent,
  FileText,
  UploadCloud,
  Calendar,
  Pencil,
} from "lucide-react";

interface CreateRequestDialogProps {
  studentId: string;
  studentName: string;
  triggerClassName?: string;
  buttonText?: string;
  
  // Props for Edit Mode
  requestId?: string;
  initialType?: "SAKIT" | "IZIN_PULANG" | "IZIN_KELUARGA" | "IZIN_KEGIATAN" | "DISPENSASI" | "LAINNYA";
  initialReason?: string;
  initialDate?: string;
  initialAttachmentUrl?: string | null;
}

// ... compressImage function remains the same ...
function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 1200;
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
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

export function CreateRequestDialog({
  studentId,
  studentName,
  triggerClassName,
  buttonText,
  requestId,
  initialType = "SAKIT",
  initialReason = "",
  initialDate,
  initialAttachmentUrl = null,
}: CreateRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(initialType);
  const [reason, setReason] = useState(initialReason);
  const [requestDate, setRequestDate] = useState(() => {
    if (initialDate) return initialDate;
    return new Date().toISOString().split("T")[0];
  });
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(initialAttachmentUrl);
  const [fileName, setFileName] = useState<string>(initialAttachmentUrl ? "Lampiran Sebelumnya" : "");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const getMinDate = () => {
    const today = new Date();
    // Jika izin keluarga, minimal harus untuk besok (H-1 pengajuan)
    if (selectedType === "IZIN_KELUARGA") {
      today.setDate(today.getDate() + 1);
    }
    return today.toISOString().split("T")[0];
  };

  useEffect(() => {
    const minDate = getMinDate();
    if (requestDate < minDate) {
      setRequestDate(minDate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  const isEditMode = !!requestId;
  const defaultButtonText = isEditMode ? "Edit Pengajuan" : "+ AJUKAN IZIN BARU";
  const displayButtonText = buttonText || defaultButtonText;

  const formActionFn = async (prevState: CreateRequestState | null, formData: FormData) => {
    if (isEditMode && requestId) {
      return await updatePermissionRequest(requestId, formData);
    }
    return await createPermissionRequest(prevState, formData);
  };

  const [state, formAction, isPending] = useActionState<CreateRequestState | null, FormData>(
    formActionFn,
    null
  );

  // Tutup dialog dan reset form saat berhasil (hanya jika buat baru, jika edit biarkan saja state awalnya)
  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setOpen(false);
        if (!isEditMode) {
          setReason("");
          setAttachmentPreview(null);
          setFileName("");
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [state, isEditMode]);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setIsProcessingFile(true);
    try {
      if (file.type.startsWith("image/")) {
        const compressed = await compressImage(file);
        setAttachmentPreview(compressed);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error("Gagal memproses lampiran:", err);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const setSampleDoctorLetter = () => {
    const sampleUrl =
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80";
    setAttachmentPreview(sampleUrl);
    setFileName("surat_keterangan_dokter_klinik.jpg");
  };

  const removeAttachment = () => {
    setAttachmentPreview(null);
    setFileName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="lg"
            variant={isEditMode ? "outline" : "default"}
            className={
              triggerClassName ||
              (isEditMode
                ? "h-8 px-3 rounded-lg text-xs font-semibold gap-1.5"
                : "w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]")
            }
          >
            {isEditMode ? <Pencil className="size-3.5" /> : <Plus className="size-4 stroke-[3]" />}
            <span>{displayButtonText}</span>
          </Button>
        }
      />

      <DialogContent className="max-w-md w-[95vw] sm:max-w-lg p-5 sm:p-6 rounded-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
        <DialogHeader className="gap-1.5 pb-3 border-b border-slate-200 dark:border-zinc-800">
          <DialogTitle className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {isEditMode ? "Edit Pengajuan Izin" : "Pengajuan Izin Baru (New Request)"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
            Siswa: <strong className="text-slate-800 dark:text-zinc-200 font-semibold">{studentName}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Notifikasi feedback */}
        {state?.error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs sm:text-sm animate-in fade-in">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">{state.error}</div>
          </div>
        )}

        {state?.success && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm animate-in fade-in">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex-1">{state.message}</div>
          </div>
        )}

        <form action={formAction} className="space-y-4 pt-1">
          <input type="hidden" name="studentId" value={studentId} />
          <input type="hidden" name="type" value={selectedType} />
          <input type="hidden" name="attachmentUrl" value={attachmentPreview || ""} />

          {/* 1. Jenis Izin (Pill Selection - Monochromatic) */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Jenis Izin <span className="text-rose-500">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedType("SAKIT")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedType === "SAKIT"
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Thermometer className="size-4 mb-1" />
                <span className="text-xs">Sakit</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("IZIN_PULANG")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedType === "IZIN_PULANG"
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <LogOut className="size-4 mb-1" />
                <span className="text-xs">Pulang</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("IZIN_KELUARGA")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedType === "IZIN_KELUARGA"
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Users className="size-4 mb-1" />
                <span className="text-[11px] leading-tight mt-1">Acara Keluarga</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("IZIN_KEGIATAN")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedType === "IZIN_KEGIATAN"
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Tent className="size-4 mb-1" />
                <span className="text-[11px] leading-tight mt-1">Kegiatan Luar</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("DISPENSASI")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedType === "DISPENSASI"
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <FileText className="size-4 mb-1" />
                <span className="text-xs">Dispensasi</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("LAINNYA")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  selectedType === "LAINNYA"
                    ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <FileQuestion className="size-4 mb-1" />
                <span className="text-xs">Lainnya</span>
              </button>
            </div>
          </div>

          {/* 2. Waktu Pengajuan (Date field) */}
          <div className="space-y-1.5">
            <Label htmlFor="requestDate" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1">
              <Calendar className="size-3.5" />
              <span>Tanggal Pengajuan</span>
            </Label>
            <div className="relative">
              <Input
                id="requestDate"
                name="requestDate"
                type="date"
                min={getMinDate()}
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 text-xs bg-white dark:bg-zinc-900"
              />
            </div>
          </div>

          {/* 3. Alasan Izin (Textarea) */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
              Alasan Izin <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="reason"
              name="reason"
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                selectedType === "SAKIT"
                  ? "Tuliskan rincian gejala sakit (contoh: demam tinggi sejak pagi dan flu)..."
                  : selectedType === "IZIN_PULANG"
                  ? "Tuliskan alasan permohonan izin pulang lebih awal..."
                  : "Tuliskan keperluan izin Anda secara detail..."
              }
              className="resize-none rounded-xl border-slate-200 dark:border-zinc-800 focus:border-slate-900 text-xs sm:text-sm bg-white dark:bg-zinc-900"
            />
          </div>

          {/* 4. Area Drag-and-Drop / Upload Bukti Surat */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                Bukti Surat / Lampiran
              </Label>
              {selectedType === "SAKIT" && !attachmentPreview && (
                <button
                  type="button"
                  onClick={setSampleDoctorLetter}
                  className="text-[11px] font-medium text-slate-800 dark:text-zinc-300 hover:underline cursor-pointer"
                >
                  + Gunakan Contoh Surat Dokter
                </button>
              )}
            </div>

            {isProcessingFile ? (
              <div className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-800/40 text-xs text-slate-500 dark:text-zinc-400 gap-2">
                <Loader2 className="size-5 animate-spin text-slate-800 dark:text-zinc-200" />
                <span>Mengompresi dan menyiapkan foto...</span>
              </div>
            ) : attachmentPreview ? (
              <div className="relative border border-slate-200 dark:border-zinc-800 rounded-xl p-3 bg-slate-50 dark:bg-zinc-800/40 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachmentPreview}
                  alt="Preview lampiran"
                  className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-zinc-700 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                    {fileName || "Bukti Terlampir"}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="size-3" /> Berhasil dilampirkan & terkompresi
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-500 hover:text-rose-600 transition-colors"
                  title="Hapus lampiran"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-xl cursor-pointer transition-colors text-center ${
                  isDragging
                    ? "border-slate-900 bg-slate-100 dark:border-white dark:bg-zinc-800"
                    : "border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/30 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="size-9 rounded-full bg-slate-200/70 dark:bg-zinc-700 flex items-center justify-center mb-1.5 text-slate-700 dark:text-zinc-200">
                  <UploadCloud className="size-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Tarik file ke sini atau <span className="underline">Pilih dari perangkat</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Mendukung foto surat dokter atau keterangan orang tua (JPG, PNG)
                </p>
              </div>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 flex items-center gap-2.5">
            <Button
              type="submit"
              disabled={isPending || state?.success}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl py-2.5 text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Mengirim Pengajuan...</span>
                </>
              ) : state?.success ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Pengajuan Berhasil Terkirim!</span>
                </>
              ) : (
                <span>Kirim Pengajuan Izin</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
