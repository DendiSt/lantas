"use client";

import { useState } from "react";
import { FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { getAttendanceRangeData } from "@/app/actions/attendance";

interface Subject {
  id: string;
  name: string;
}

interface ExportButtonsProps {
  data?: any[];
  classNameName: string;
  dateStr: string;
  availableSubjects?: Subject[];
  classId?: string;
  teacherId?: string;
}

export function ExportButtons({ classNameName, dateStr, availableSubjects = [], classId, teacherId }: ExportButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [exportStartDate, setExportStartDate] = useState(dateStr);
  const [exportEndDate, setExportEndDate] = useState(dateStr);
  const [isExporting, setIsExporting] = useState(false);

  const executeExport = async () => {
    setIsExporting(true);

    try {
      let rawData: any[] = [];
      
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

      // Group unique dates and subjects
      const sessionsMap: Record<string, { mapel: string, waktu: string }[]> = {};
      const datesSet = new Set<string>();

      rawData.forEach(d => {
        datesSet.add(d.Tanggal);

        if (!sessionsMap[d.Tanggal]) {
          sessionsMap[d.Tanggal] = [];
        }

        const exists = sessionsMap[d.Tanggal].some(s => s.mapel === d.Mapel && s.waktu === d.Waktu);

        if (!exists) {
          sessionsMap[d.Tanggal].push({ mapel: d.Mapel, waktu: d.Waktu });
        }
      });

      const dates = Array.from(datesSet).sort();

      dates.forEach(d => {
        sessionsMap[d].sort((a, b) => a.waktu.localeCompare(b.waktu));
      });

      // Headers
      const row0: any[] = ["No", "NISN", "Nama Lengkap Siswa", "Kelas"];
      const row1: any[] = ["", "", "", ""];
      const row2: any[] = ["", "", "", ""];

      dates.forEach(date => {
        const sessions = sessionsMap[date];
        const dateObj = new Date(date);
        const dateLabel = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' });
        
        row0.push(dateLabel);

        for (let i = 1; i < sessions.length; i++) row0.push("");

        sessions.forEach(sess => {
          row1.push(sess.mapel);
          row2.push(sess.waktu);
        });
      });

      const rekapCols = ["Hadir", "Sakit", "Izin", "Alpha", "Dispen", "% Hadir"];
      row0.push("Total Rekapitulasi");

      for(let i = 1; i < rekapCols.length; i++) row0.push("");

      rekapCols.forEach(col => {
        row1.push(col);
        row2.push("");
      });

      const metaClassName = classNameName && classNameName !== "Pilih Kelas" ? classNameName : (classId ? "Kelas Tertentu" : "Semua Kelas");
      const metaDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      const meta0 = ["LAPORAN KEHADIRAN / IZIN SISWA - LANTAS"];
      const meta1 = [`Kelas: ${metaClassName}`];
      const meta2 = [`Tanggal Ekspor: ${metaDate}`];
      const meta3 = [""]; // Empty row for spacing
      
      const aoa: any[][] = [meta0, meta1, meta2, meta3, row0, row1, row2];

      const studentsMap = new Map<string, {id: string, nisn: string, name: string, className: string, records: any[]}>();
      rawData.forEach(d => {
        const uniqueKey = d.ID || (d.NISN + "_" + d["Nama Siswa"]);
        
        if (!studentsMap.has(uniqueKey)) {
          studentsMap.set(uniqueKey, { id: d.ID || "", nisn: d.NISN, name: d["Nama Siswa"], className: d["Kelas"], records: [] });
        }

        studentsMap.get(uniqueKey)!.records.push(d);
      });

      let studentIndex = 1;
      const totalHadirPerColumn: Record<number, number> = {};

      let totalClassH = 0;
      let totalClassS = 0;
      let totalClassI = 0;
      let totalClassA = 0;
      let totalClassD = 0;
      let totalClassSessions = 0;

      for (const student of Array.from(studentsMap.values()).sort((a, b) => {
        const clsCmp = a.className.localeCompare(b.className);

        if (clsCmp !== 0) return clsCmp;

        return a.name.localeCompare(b.name);
      })) {
        const row: any[] = [studentIndex++, student.nisn, student.name, student.className];
        
        let h = 0, s = 0, i = 0, a = 0, d = 0, l = 0;
        let colIndex = 4;

        dates.forEach(date => {
          const sessions = sessionsMap[date];
          sessions.forEach(sess => {
            const record = student.records.find(r => r.Tanggal === date && r.Mapel === sess.mapel && r.Waktu === sess.waktu);

            if (!record) {
              row.push("-");
            } else {
              const stat = record.Status;

              if (stat === "HADIR") { 
                h++; 
                totalHadirPerColumn[colIndex] = (totalHadirPerColumn[colIndex] || 0) + 1; 
              } else if (stat === "SAKIT") s++;
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

        const totalSessions = h + s + i + a + d + l;
        const studentRateStr = totalSessions > 0 ? `${((h / totalSessions) * 100).toFixed(1)}%` : "-";

        totalClassH += h;
        totalClassS += s;
        totalClassI += i;
        totalClassA += a;
        totalClassD += d;
        totalClassSessions += totalSessions;

        row.push(h, s, i, a, d, studentRateStr);
        aoa.push(row);
      }

      // Bottom Row (Total Kehadiran Setiap Sesi & Rata-rata Kelas)
      const bottomRow: any[] = ["", "", "Total / Rata-rata Kelas", ""];
      let currentIdx = 4;
      dates.forEach(date => {
        const sessions = sessionsMap[date];
        sessions.forEach(() => {
          bottomRow.push(totalHadirPerColumn[currentIdx] || 0);
          currentIdx++;
        });
      });

      const overallClassRate = totalClassSessions > 0 ? `${((totalClassH / totalClassSessions) * 100).toFixed(1)}%` : "-";
      bottomRow.push(totalClassH, totalClassS, totalClassI, totalClassA, totalClassD, overallClassRate);
      aoa.push(bottomRow);

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Merges
      const merges: XLSX.Range[] = [];
      const offset = 4;
      
      // Merge Kop Surat
      const totalCols = row0.length;
      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } });
      merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } });
      merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } });
      merges.push({ s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } });

      // Merge "No", "NISN", "Nama Lengkap Siswa", "Kelas", "Total Rekap" row 0-2 (now offset to 4-6)
      merges.push({ s: { r: offset + 0, c: 0 }, e: { r: offset + 2, c: 0 } });
      merges.push({ s: { r: offset + 0, c: 1 }, e: { r: offset + 2, c: 1 } });
      merges.push({ s: { r: offset + 0, c: 2 }, e: { r: offset + 2, c: 2 } });
      merges.push({ s: { r: offset + 0, c: 3 }, e: { r: offset + 2, c: 3 } });

      let cIdx = 4;
      dates.forEach(date => {
        const count = sessionsMap[date].length;

        if (count > 1) {
          merges.push({ s: { r: offset + 0, c: cIdx }, e: { r: offset + 0, c: cIdx + count - 1 } });
        }

        cIdx += count;
      });

      // Merge Total Rekap
      if (rekapCols.length > 1) {
        merges.push({ s: { r: offset + 0, c: cIdx }, e: { r: offset + 0, c: cIdx + rekapCols.length - 1 } });
      }

      // Merge Total Rekap sub-headers
      for(let k = 0; k < rekapCols.length; k++) {
        merges.push({ s: { r: offset + 1, c: cIdx + k }, e: { r: offset + 2, c: cIdx + k } });
      }

      ws["!merges"] = merges;

      // Col Widths
      const colWidths = [{ wch: 5 }, { wch: 15 }, { wch: 30 }, { wch: 15 }];

      for(let k = 4; k < row0.length; k++) colWidths.push({ wch: 14 });
      ws["!cols"] = colWidths;

      // Apply Styles
      for (const cell in ws) {
        if (cell[0] === '!') continue;
        const col = cell.replace(/[0-9]/g, '');
        const row = parseInt(cell.replace(/[a-zA-Z]/g, '')); // 1-indexed row in Excel
        
        if (row <= 4) { // Metadata rows
          if (row === 1) {
            ws[cell].s = { font: { bold: true, sz: 14, color: { rgb: "1E293B" } }, alignment: { horizontal: "left" } };
          } else if (row === 2 || row === 3) {
            ws[cell].s = { font: { bold: true, sz: 10, color: { rgb: "475569" } }, alignment: { horizontal: "left" } };
          }

          continue;
        }

        let horizontal = "center";
        let bold = false;
        let fill: any = null;
        let fontColor = { rgb: "1E293B" };
        
        if ((row >= 5 && row <= 7) || row === aoa.length) { // Header rows (5,6,7) or bottom total row
          bold = true;
          fill = { fgColor: { rgb: row === aoa.length ? "F1F5F9" : "E2E8F0" } };
        } else {
          // B = NISN, C = Nama Lengkap
          if (col === "B" || col === "C") horizontal = "left";

          // Conditional Formatting for attendance cells
          const cellVal = String(ws[cell].v ?? "");

          if (cellVal === "H") {
            bold = true;
            fill = { fgColor: { rgb: "DCFCE7" } }; // Soft emerald 100
            fontColor = { rgb: "15803D" }; // Emerald 700
          } else if (cellVal === "S" || cellVal === "I") {
            bold = true;
            fill = { fgColor: { rgb: "FEF3C7" } }; // Soft amber 100
            fontColor = { rgb: "B45309" }; // Amber 700
          } else if (cellVal === "A") {
            bold = true;
            fill = { fgColor: { rgb: "FEE2E2" } }; // Soft rose 100
            fontColor = { rgb: "B91C1C" }; // Rose 700
          } else if (cellVal === "D") {
            bold = true;
            fill = { fgColor: { rgb: "E0E7FF" } }; // Soft indigo 100
            fontColor = { rgb: "4338CA" }; // Indigo 700
          } else if (cellVal.endsWith("%")) {
            bold = true;
            const pctVal = parseFloat(cellVal);

            if (!isNaN(pctVal)) {
              if (pctVal >= 85) {
                fill = { fgColor: { rgb: "F0FDF4" } };
                fontColor = { rgb: "166534" };
              } else if (pctVal < 75) {
                fill = { fgColor: { rgb: "FFF1F2" } };
                fontColor = { rgb: "9F1239" };
              }
            }
          }
        }
        
        ws[cell].s = {
          alignment: { horizontal, vertical: "center", wrapText: true },
          font: { bold, color: fontColor },
          border: {
            top: { style: "thin", color: { rgb: "CBD5E1" } },
            bottom: { style: "thin", color: { rgb: "CBD5E1" } },
            left: { style: "thin", color: { rgb: "CBD5E1" } },
            right: { style: "thin", color: { rgb: "CBD5E1" } }
          }
        };

        if (fill) ws[cell].s.fill = fill;
      }

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
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-9 px-3 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-transparent cursor-pointer"
        >
          <FileSpreadsheet className="size-4" />
          <span>Unduh Excel</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unduh Laporan Excel</DialogTitle>
            <DialogDescription>
              Pilih format rekap absensi yang ingin Anda unduh.
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
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)} disabled={isExporting}>Batal</Button>
            <Button type="button" disabled={isExporting} onClick={executeExport} className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
              <Download className="size-4 mr-2" /> {isExporting ? "Memproses..." : "Unduh Sekarang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
