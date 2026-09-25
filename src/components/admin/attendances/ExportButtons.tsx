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
      let rawData: any[] = [];
      let isRange = false;
      
      // If it's a date range, we fetch the flat log from server
      if (exportStartDate !== exportEndDate) {
        isRange = true;
        const result = await getAttendanceRangeData(
          exportStartDate, 
          exportEndDate, 
          classId, 
          teacherId, 
          selectedSubject
        );
        
        if (result.success && result.data) {
          rawData = result.data;
        } else {
          alert("Gagal mengambil data dari server.");
          setIsExporting(false);
          return;
        }
      } else {
        // If single day, we can just fetch the single day flat data too, to maintain uniform format!
        const result = await getAttendanceRangeData(
          exportStartDate, 
          exportStartDate, 
          classId, 
          teacherId, 
          selectedSubject
        );
        if (result.success && result.data) {
          rawData = result.data;
        } else {
          // Fallback
          rawData = [];
        }
      }

      if (rawData.length === 0) {
        const ws = XLSX.utils.json_to_sheet([{ "Pesan": "Tidak ada data absensi untuk kriteria ini." }]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");
        XLSX.writeFile(wb, `Absensi_Kosong.xlsx`);
        setIsOpen(false);
        setIsExporting(false);
        return;
      }

      // --- Build Complex Matrix (AOA) ---
      const dates = Array.from(new Set(rawData.map(d => d.Tanggal))).sort();

      const sessionsMap: Record<string, {mapel: string, waktu: string}[]> = {};
      dates.forEach(date => {
        const recordsOnDate = rawData.filter(d => d.Tanggal === date);
        const uniqueSessions = new Map<string, {mapel: string, waktu: string}>();
        recordsOnDate.forEach(r => {
          uniqueSessions.set(r.Waktu + "_" + r.Mapel, {mapel: r.Mapel, waktu: r.Waktu});
        });
        sessionsMap[date] = Array.from(uniqueSessions.values()).sort((a, b) => a.waktu.localeCompare(b.waktu));
      });

      const row0: any[] = ["No", "NISN", "Nama Lengkap Siswa"];
      const row1: any[] = ["", "", ""];
      const row2: any[] = ["", "", ""];

      dates.forEach(date => {
        const sessions = sessionsMap[date];
        const dObj = new Date(date);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dateLabel = `${days[dObj.getDay()]}, ${dObj.getDate().toString().padStart(2, '0')}/${(dObj.getMonth()+1).toString().padStart(2, '0')}/${dObj.getFullYear()}`;
        
        row0.push(dateLabel);
        for (let i = 1; i < sessions.length; i++) row0.push("");

        sessions.forEach(sess => {
          row1.push(sess.mapel);
          row2.push(sess.waktu);
        });
      });

      const rekapCols = ["Hadir", "Sakit", "Izin", "Alpha", "Dispen", "Lainnya"];
      row0.push("Total Rekap");
      for(let i=1; i<rekapCols.length; i++) row0.push("");

      rekapCols.forEach(col => {
        row1.push(col);
        row2.push("");
      });

      const aoa: any[][] = [row0, row1, row2];

      const studentsMap = new Map<string, {nisn: string, name: string, records: any[]}>();
      rawData.forEach(d => {
        if (!studentsMap.has(d["Nama Siswa"])) {
          studentsMap.set(d["Nama Siswa"], { nisn: d.NISN, name: d["Nama Siswa"], records: [] });
        }
        studentsMap.get(d["Nama Siswa"])!.records.push(d);
      });

      let studentIndex = 1;
      
      // Keep track of total Hadir per column
      // column index starts at 3 (0: No, 1: NISN, 2: Nama)
      const totalHadirPerColumn: Record<number, number> = {};

      for (const [name, student] of Array.from(studentsMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
        const row: any[] = [studentIndex++, student.nisn, student.name];
        
        let h = 0, s = 0, i = 0, a = 0, d = 0, l = 0;
        let colIndex = 3;

        dates.forEach(date => {
          const sessions = sessionsMap[date];
          sessions.forEach(sess => {
            const record = student.records.find(r => r.Tanggal === date && r.Mapel === sess.mapel && r.Waktu === sess.waktu);
            if (!record) {
              row.push("-");
            } else {
              const stat = record.Status;
              if (stat === "HADIR") { h++; totalHadirPerColumn[colIndex] = (totalHadirPerColumn[colIndex] || 0) + 1; }
              else if (stat === "SAKIT") s++;
              else if (stat === "IZIN") i++;
              else if (stat === "ALPHA") a++;
              else if (stat === "DISPENSASI") d++;
              else l++;
              
              let label = stat;
              if (stat === "HADIR") label = "H";
              else if (stat === "SAKIT") label = "S";
              else if (stat === "IZIN") label = "I";
              else if (stat === "ALPHA") label = "A";
              else if (stat === "DISPENSASI") label = "D";
              
              row.push(label);
            }
            colIndex++;
          });
        });

        row.push(h, s, i, a, d, l);
        aoa.push(row);
      }

      // Bottom Row (Total Kehadiran Setiap Sesi)
      const bottomRow: any[] = ["", "", "Total Kehadiran Setiap Sesi"];
      let currentIdx = 3;
      dates.forEach(date => {
        const sessions = sessionsMap[date];
        sessions.forEach(() => {
          bottomRow.push(totalHadirPerColumn[currentIdx] || 0);
          currentIdx++;
        });
      });
      // Fill the rest with empty
      for(let k=0; k<rekapCols.length; k++) bottomRow.push("");
      aoa.push(bottomRow);

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Merges
      const merges: XLSX.Range[] = [];
      
      // Merge "No", "NISN", "Nama Lengkap Siswa", "Total Rekap" row 0-2
      merges.push({ s: { r: 0, c: 0 }, e: { r: 2, c: 0 } });
      merges.push({ s: { r: 0, c: 1 }, e: { r: 2, c: 1 } });
      merges.push({ s: { r: 0, c: 2 }, e: { r: 2, c: 2 } });

      let cIdx = 3;
      dates.forEach(date => {
        const count = sessionsMap[date].length;
        if (count > 1) {
          merges.push({ s: { r: 0, c: cIdx }, e: { r: 0, c: cIdx + count - 1 } });
        }
        cIdx += count;
      });

      // Merge Total Rekap
      if (rekapCols.length > 1) {
        merges.push({ s: { r: 0, c: cIdx }, e: { r: 0, c: cIdx + rekapCols.length - 1 } });
      }

      // Merge Total Rekap sub-headers (row 1 to 2)
      for(let k=0; k<rekapCols.length; k++) {
        merges.push({ s: { r: 1, c: cIdx + k }, e: { r: 2, c: cIdx + k } });
      }

      ws["!merges"] = merges;

      // Col Widths
      const colWidths = [{ wch: 5 }, { wch: 15 }, { wch: 30 }];
      for(let k = 3; k < row0.length; k++) colWidths.push({ wch: 15 });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");

      // Download
      const safeClassName = classNameName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      let fileName = `Absensi_${safeClassName}`;
      if (exportStartDate === exportEndDate) fileName += `_${exportStartDate}`;
      else fileName += `_${exportStartDate}_sd_${exportEndDate}`;
      
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
