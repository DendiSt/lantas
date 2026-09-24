"use client";

import { FileSpreadsheet, Printer } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

interface ExportButtonsProps {
  data: any[];
  classNameName: string;
  dateStr: string;
}

export function ExportButtons({ data, classNameName, dateStr }: ExportButtonsProps) {
  const formattedDate = new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleExportExcel = () => {
    // 1. Siapkan data untuk Excel
    const dataToExport = data.map((item, index) => ({
      "No.": index + 1,
      ...item
    }));

    if (dataToExport.length === 0) {
      dataToExport.push({
        "No.": 1,
        "Nama Siswa": "Belum ada data absensi",
      });
    }

    // 2. Buat worksheet dan workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");

    // 3. Atur lebar kolom agar rapi (dinamis)
    const colWidths = [{ wch: 5 }, { wch: 30 }];
    const keys = Object.keys(dataToExport[0] || {});
    for (let i = 2; i < keys.length; i++) {
       colWidths.push({ wch: Math.max(15, keys[i].length + 5) });
    }
    ws["!cols"] = colWidths;

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
