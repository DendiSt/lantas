"use client";

import { FileSpreadsheet, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

interface AttendanceExportData {
  studentName: string;
  status: string;
  teacherName: string;
}

interface ExportButtonsProps {
  attendances: AttendanceExportData[];
  classNameName: string;
  dateStr: string;
}

export function ExportButtons({ attendances, classNameName, dateStr }: ExportButtonsProps) {
  const formattedDate = new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleExportExcel = () => {
    // 1. Siapkan data untuk Excel
    const dataToExport = attendances.map((att, index) => ({
      "No.": index + 1,
      "Nama Siswa": att.studentName,
      Status: att.status,
      "Diinput Oleh": att.teacherName,
    }));

    if (dataToExport.length === 0) {
      dataToExport.push({
        "No.": 1,
        "Nama Siswa": "Belum ada data absensi",
        Status: "-",
        "Diinput Oleh": "-",
      });
    }

    // 2. Buat worksheet dan workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");

    // 3. Atur lebar kolom agar rapi
    ws["!cols"] = [
      { wch: 5 }, // No.
      { wch: 30 }, // Nama Siswa
      { wch: 15 }, // Status
      { wch: 25 }, // Diinput Oleh
    ];

    // 4. Download file
    const safeClassName = classNameName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fileName = `Absensi_${safeClassName}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 no-print">
      <Button
        onClick={handlePrintPDF}
        variant="outline"
        className="h-9 px-3 gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-slate-200 hover:bg-slate-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        <Printer className="size-4" />
        <span>Cetak PDF</span>
      </Button>

      <Button
        onClick={handleExportExcel}
        className="h-9 px-3 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
      >
        <FileSpreadsheet className="size-4" />
        <span>Unduh Excel</span>
      </Button>
    </div>
  );
}
