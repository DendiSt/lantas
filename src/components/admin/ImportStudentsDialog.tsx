"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUp, Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { importStudentsFromExcel } from "@/app/actions/students";
import { toast } from "sonner";
import * as xlsx from "xlsx";

export function ImportStudentsDialog({ classes }: { classes: any[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleDownloadTemplate = () => {
    const ws = xlsx.utils.json_to_sheet([
      { "Nama Lengkap": "Budi Santoso", "NISN": "0012345678", "Jenis Kelamin (L/P)": "L", "Nama Orang Tua": "Agus Santoso", "Alamat": "Jl. Merdeka No. 10" },
      { "Nama Lengkap": "Siti Aminah", "NISN": "0087654321", "Jenis Kelamin (L/P)": "P", "Nama Orang Tua": "Hadi Prasetyo", "Alamat": "Jl. Sudirman No. 5" }
    ]);

    // Set column widths for readability
    ws['!cols'] = [
      { wch: 25 }, // Nama Lengkap
      { wch: 15 }, // NISN
      { wch: 18 }, // Jenis Kelamin
      { wch: 25 }, // Nama Orang Tua
      { wch: 35 }, // Alamat
    ];

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Siswa");
    xlsx.writeFile(wb, "Template_Import_Siswa.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setImportResult(null);
    
    const formData = new FormData(e.currentTarget);
    const result = await importStudentsFromExcel(null, formData);
    
    if (result.success) {
      setImportResult(result as any);
      if (result.failed === 0) {
        toast.success(`Berhasil mengimpor ${result.imported} siswa!`);
        setTimeout(() => setOpen(false), 2000);
      } else {
        toast.warning(`Berhasil: ${result.imported}. Gagal: ${result.failed}`);
      }
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const resetState = () => {
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) resetState();
    }}>
      <DialogTrigger className="inline-flex items-center justify-center h-9 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs gap-1.5 cursor-pointer">
        <FileUp className="size-4" />
        <span>Import Excel</span>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <FileUp className="size-4 text-emerald-600" />
            Import Siswa via Excel
          </DialogTitle>
        </DialogHeader>

        {!importResult ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">Template Excel (5 Kolom)</span>
                <Button type="button" size="sm" variant="outline" onClick={handleDownloadTemplate} className="h-7 text-[11px] bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer">
                  <Download className="size-3 mr-1" /> Download
                </Button>
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Kolom: <strong>Nama Lengkap</strong>, NISN, Jenis Kelamin (L/P), Nama Orang Tua, Alamat.
                <br />Jika Gender + Ortu + Alamat terisi → profil otomatis <strong>Lengkap</strong>.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="classId" className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Kelas Tujuan (Opsional)</Label>
              <select
                id="classId"
                name="classId"
                className="w-full text-xs h-9 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:border-slate-900 outline-none"
              >
                <option value="">Pilih Kelas (Bisa dikosongkan)</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">File Excel (.xlsx / .csv)</Label>
              <input 
                ref={fileInputRef}
                type="file" 
                name="file" 
                accept=".xlsx, .xls, .csv" 
                required
                onChange={handleFileChange}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
              />
              {file && <p className="text-[10px] text-emerald-600 font-medium mt-1">File terpilih: {file.name}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800 mt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="rounded-xl text-xs h-8 cursor-pointer">
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={loading || !file} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5 h-8 cursor-pointer">
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <FileUp className="size-3.5" />}
                Mulai Import
              </Button>
            </div>
          </form>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex flex-col items-center justify-center text-center space-y-2 mb-4">
              {importResult.failed === 0 ? (
                <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="size-6" />
                </div>
              ) : importResult.imported > 0 ? (
                <div className="size-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertCircle className="size-6" />
                </div>
              ) : (
                <div className="size-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="size-6" />
                </div>
              )}
              
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Hasil Import</h3>
              <div className="flex gap-4 text-xs font-semibold">
                <span className="text-emerald-600">Berhasil: {importResult.imported}</span>
                <span className="text-rose-600">Gagal: {importResult.failed}</span>
              </div>
            </div>

            {importResult.errors && importResult.errors.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900/50">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1">Rincian Error (Max 5):</p>
                <ul className="text-[11px] text-rose-700 dark:text-rose-400 space-y-1 list-disc pl-4">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setOpen(false)} className="rounded-xl text-xs h-8 bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">
                Selesai
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
