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
import { importSchedulesFromExcel } from "@/app/actions/schedules";
import { toast } from "sonner";
import * as xlsx from "xlsx";

export function ImportSchedulesDialog({ classes }: { classes: any[] }) {
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
    // Construct rows for the template
    const rows = [
      { Hari: "Senin", Jam: 1 },
      { Hari: "", Jam: 2 },
      { Hari: "", Jam: 3 },
      { Hari: "Selasa", Jam: 1 },
      { Hari: "", Jam: 2 },
      { Hari: "", Jam: 3 },
      { Hari: "Rabu", Jam: 1 },
      { Hari: "", Jam: 2 },
      { Hari: "", Jam: 3 },
      { Hari: "Kamis", Jam: 1 },
      { Hari: "", Jam: 2 },
      { Hari: "", Jam: 3 },
      { Hari: "Jumat", Jam: 1 },
      { Hari: "", Jam: 2 },
    ];

    // Add dynamic class columns with dummy data to the first row to show format
    const templateData = rows.map((row, index) => {
      const newRow: any = { ...row };
      classes.forEach((c, idx) => {
        if (index === 0) {
          // Add a sample on the very first cell
          newRow[c.name] = idx === 0 ? "Sejarah (Dendi)" : (idx === 1 ? "Matematika (Entuy)" : "Fisika (Revadisa)");
        } else {
          newRow[c.name] = "";
        }
      });
      return newRow;
    });

    const ws = xlsx.utils.json_to_sheet(templateData);

    // Set column widths
    const cols = [{ wch: 10 }, { wch: 5 }];
    classes.forEach(() => cols.push({ wch: 25 }));
    ws['!cols'] = cols;

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Jadwal Pelajaran");
    xlsx.writeFile(wb, "Template_Import_Jadwal.xlsx");
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
    const result = await importSchedulesFromExcel(null, formData);
    
    if (result.success) {
      setImportResult(result as any);
      if (result.failed === 0) {
        toast.success(`Berhasil mengimpor ${(result as any).imported} jadwal!`);
        setTimeout(() => {
          setOpen(false);
          window.location.reload();
        }, 2000);
      } else {
        const imported = (result as any).imported || 0;
        toast.warning(`Berhasil: ${imported}. Gagal: ${(result as any).failed}`);
        if (imported > 0) {
            setTimeout(() => window.location.reload(), 3000);
        }
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
      <DialogTrigger className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs gap-2 transition-colors">
        <FileUp className="size-4" />
        <span>Import Excel</span>
      </DialogTrigger>
      
      <DialogContent className="max-w-md p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <FileUp className="size-5 text-indigo-600 dark:text-indigo-400" />
            Import Jadwal Pelajaran (Excel)
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="pt-4 space-y-4">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                <p className="font-bold mb-1">Panduan Format Excel:</p>
                <ul className="list-disc pl-4 space-y-1 opacity-90">
                  <li>Gunakan <b>Template Excel</b> yang disediakan.</li>
                  <li>Isi sel dengan format: <b>Nama Mapel (Kata Kunci Guru)</b></li>
                  <li>Contoh: <b>Sejarah (Dendi)</b> atau <b>B. Inggris (Gibran)</b></li>
                  <li>Kata kunci di dalam kurung akan dipakai untuk mencari Guru.</li>
                </ul>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDownloadTemplate}
              className="w-full h-9 text-xs bg-white dark:bg-zinc-900 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400"
            >
              <Download className="size-3.5 mr-2" />
              Download Template Excel
            </Button>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-xs font-bold text-slate-700 dark:text-zinc-300">File Excel (.xlsx)</Label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 dark:text-zinc-400
                  file:mr-4 file:py-2.5 file:px-4
                  file:rounded-xl file:border-0
                  file:text-xs file:font-bold
                  file:bg-slate-100 file:text-slate-700
                  dark:file:bg-zinc-800 dark:file:text-zinc-300
                  hover:file:bg-slate-200 dark:hover:file:bg-zinc-700
                  border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-900/50 cursor-pointer"
                required
              />
            </div>
          </div>

          {importResult && (
            <div className={`p-4 rounded-xl border ${importResult.failed > 0 ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-200'}`}>
              <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                {importResult.failed === 0 ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                Hasil Import
              </div>
              <div className="text-xs space-y-1 mb-2">
                <p>✅ Berhasil: <b>{importResult.imported}</b> jadwal</p>
                {importResult.failed > 0 && <p className="text-rose-600 dark:text-rose-400">❌ Gagal: <b>{importResult.failed}</b> jadwal</p>}
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 max-h-32 overflow-y-auto">
                  <p className="text-[10px] font-bold mb-1 opacity-70">Detail Error:</p>
                  <ul className="text-[10px] space-y-1 list-disc pl-4 opacity-80">
                    {importResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!file || loading}
            className="w-full h-11 rounded-xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md disabled:opacity-50 transition-all"
          >
            {loading ? (
              <><Loader2 className="size-4 mr-2 animate-spin" /> Sedang Memproses...</>
            ) : (
              <><FileUp className="size-4 mr-2" /> Mulai Import</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
