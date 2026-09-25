"use client";

import { useState } from "react";
import { FileSpreadsheet, Printer, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getAttendanceRangeData } from "@/app/actions/attendance";

interface Subject {
  id: string;
  name: string;
}

interface ExportButtonsProps {
  data: any[];
  classNameName: string;
  dateStr: string;
  availableSubjects?: Subject[];
  classId?: string;
  teacherId?: string;
}

export function ExportButtons({ data, classNameName, dateStr, availableSubjects = [], classId, teacherId }: ExportButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportType, setExportType] = useState<"excel" | "pdf" | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [exportStartDate, setExportStartDate] = useState(dateStr);
  const [exportEndDate, setExportEndDate] = useState(dateStr);
  const [isExporting, setIsExporting] = useState(false);

  const processDataForExport = () => {
    let finalData = data;
    
    if (selectedSubject !== "ALL") {
      const subject = availableSubjects.find(s => s.id === selectedSubject);
      if (subject) {
        finalData = data.map((item) => ({
          "Nama Siswa": item["Nama Siswa"],
          "Status": item[subject.name] || "Belum Diisi",
          "Diinput Oleh": item["Diinput Oleh"]
        }));
      }
    }

    const dataToExport = finalData.map((item, index) => ({
      "No.": index + 1,
      ...item
    }));

    if (dataToExport.length === 0) {
      dataToExport.push({
        "No.": 1,
        "Nama Siswa": "Belum ada data absensi",
      } as any);
    }
    
    return dataToExport;
  };

  const executeExport = async () => {
    if (exportType === "pdf") {
      window.print();
      setIsOpen(false);
      return;
    }

    setIsExporting(true);

    try {
      let dataToExport: any[];
      
      // If it's a date range, we fetch the flat log from server
      if (exportStartDate !== exportEndDate) {
        const result = await getAttendanceRangeData(
          exportStartDate, 
          exportEndDate, 
          classId, 
          teacherId, 
          selectedSubject
        );
        
        if (result.success && result.data) {
          dataToExport = result.data;
          if (dataToExport.length === 0) {
            dataToExport = [{ "No.": 1, "Pesan": "Tidak ada data absensi untuk rentang tanggal ini." }];
          }
        } else {
          alert("Gagal mengambil data dari server.");
          setIsExporting(false);
          return;
        }
      } else {
        // If single day, we use the matrix view
        dataToExport = processDataForExport();
      }

      // 2. Buat worksheet dan workbook
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");

      // 3. Atur lebar kolom
      const colWidths = [{ wch: 5 }, { wch: 30 }];
      const keys = Object.keys(dataToExport[0] || {});
      for (let i = 2; i < keys.length; i++) {
         colWidths.push({ wch: Math.max(15, keys[i].length + 5) });
      }
      ws["!cols"] = colWidths;

      // 4. Download file
      const safeClassName = classNameName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      let fileName = `Absensi_${safeClassName}`;
      
      if (exportStartDate === exportEndDate) {
        fileName += `_${exportStartDate}`;
      } else {
        fileName += `_${exportStartDate}_sd_${exportEndDate}`;
      }

      if (selectedSubject !== "ALL") {
        const subject = availableSubjects.find(s => s.id === selectedSubject);
        if (subject) {
          const cleanSubName = subject.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
          fileName += `_${cleanSubName}`;
        }
      }
      fileName += ".xlsx";
      
      XLSX.writeFile(wb, fileName);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengekspor.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 no-print">
        <Button
          onClick={() => {
            setExportType("pdf");
            setIsOpen(true);
          }}
          variant="outline"
          className="h-9 px-3 gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <Printer className="size-4" />
          <span>Cetak PDF</span>
        </Button>

        <Button
          onClick={() => {
            setExportType("excel");
            setIsOpen(true);
          }}
          className="h-9 px-3 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
        >
          <FileSpreadsheet className="size-4" />
          <span>Unduh Excel</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{exportType === "excel" ? "Unduh Laporan Excel" : "Cetak Laporan PDF"}</DialogTitle>
            <DialogDescription>
              Pilih format rekap absensi yang ingin Anda {exportType === "excel" ? "unduh" : "cetak"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Pilih Mapel / Cakupan Laporan:</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:border-slate-900 outline-none text-sm"
              >
                <option value="ALL">Semua Mapel (Format Matriks)</option>
                {availableSubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            {exportType === "excel" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Dari Tanggal</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>
            )}
            
            {exportType === "pdf" && selectedSubject !== "ALL" && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50">
                Catatan: Fitur cetak PDF saat ini selalu mencetak seluruh tampilan matriks pada layar Anda secara apa adanya. Jika Anda ingin merekap 1 mapel spesifik saja secara rapi, disarankan menggunakan format Excel.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>Batal</Button>
            <Button disabled={isExporting} onClick={executeExport} className={exportType === "excel" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}>
              {exportType === "excel" ? <><Download className="size-4 mr-2" /> {isExporting ? "Memproses..." : "Unduh Sekarang"}</> : <><Printer className="size-4 mr-2" /> Cetak Sekarang</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
