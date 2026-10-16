"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Loader2,
} from "lucide-react";
import { getRequestsForReport } from "@/app/actions/requests";
import { toast } from "sonner";
import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportRequestsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultStatus?: string;
  defaultType?: string;
}

export function ExportRequestsDialog({
  isOpen,
  onOpenChange,
  defaultStartDate = "",
  defaultEndDate = "",
  defaultStatus = "ALL",
  defaultType = "ALL",
}: ExportRequestsDialogProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [status, setStatus] = useState(defaultStatus);
  const [type, setType] = useState(defaultType);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "APPROVED":
        return "Disetujui";
      case "REJECTED":
        return "Ditolak";
      default:
        return "Menunggu";
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case "SAKIT":
        return "Sakit";
      case "IZIN_PULANG":
        return "Pulang Awal";
      case "IZIN_KELUARGA":
        return "Acara Keluarga";
      case "IZIN_KEGIATAN":
        return "Kegiatan Luar";
      case "DISPENSASI":
        return "Dispensasi";
      case "TANPA_KETERANGAN":
        return "Alpha";
      default:
        return t.replace("IZIN_", "");
    }
  };

  const fetchData = async () => {
    const res = await getRequestsForReport({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status,
      type,
    });

    if (!res.success || !res.data) {
      toast.error(res.error || "Gagal mengambil data dari server");
      return null;
    }

    if (res.data.length === 0) {
      toast.warning("Tidak ada data perizinan yang sesuai dengan filter yang dipilih.");
      return null;
    }

    return res.data;
  };

  // 1. UNDUH EXCEL (.XLSX)
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const data = await fetchData();
      if (!data) {
        setIsExportingExcel(false);
        return;
      }

      // Metadata Kop
      const metaPeriod =
        startDate || endDate
          ? `${startDate ? new Date(startDate).toLocaleDateString("id-ID") : "Awal"} s/d ${endDate ? new Date(endDate).toLocaleDateString("id-ID") : "Hari Ini"}`
          : "Semua Waktu";

      const aoa: any[][] = [
        ["LAPORAN REKAPITULASI PERIZINAN SISWA - LANTAS"],
        [`Periode: ${metaPeriod}`],
        [`Status: ${status === "ALL" ? "Semua Status" : getStatusLabel(status)} | Jenis: ${type === "ALL" ? "Semua Jenis" : getTypeLabel(type)}`],
        [`Tanggal Unduh: ${new Date().toLocaleDateString("id-ID", { dateStyle: "long", timeStyle: "short" })}`],
        [""], // baris kosong pemisah
        [
          "No",
          "NISN",
          "Nama Siswa",
          "Kelas",
          "Jenis Izin",
          "Waktu Pengajuan",
          "Alasan / Keterangan",
          "Status",
          "Diproses Oleh",
        ],
      ];

      data.forEach((item, index) => {
        const formattedDate = new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(item.createdAt));

        aoa.push([
          index + 1,
          item.student.nisn || "-",
          item.student.name,
          item.student.class?.name || "-",
          getTypeLabel(item.type),
          formattedDate,
          item.reason,
          getStatusLabel(item.status),
          item.reviewer?.name || (item.status === "PENDING" ? "-" : "Sistem"),
        ]);
      });

      // Baris Ringkasan di Bawah
      const totalApp = data.filter((d) => d.status === "APPROVED").length;
      const totalPend = data.filter((d) => d.status === "PENDING").length;
      const totalRej = data.filter((d) => d.status === "REJECTED").length;

      aoa.push([
        "",
        "",
        `Ringkasan: ${data.length} Total Pengajuan (Disetujui: ${totalApp}, Menunggu: ${totalPend}, Ditolak: ${totalRej})`,
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Merge Kop Surat & Summary
      const totalCols = 9;
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: totalCols - 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: totalCols - 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: totalCols - 1 } },
        { s: { r: aoa.length - 1, c: 2 }, e: { r: aoa.length - 1, c: totalCols - 1 } },
      ];

      // Lebar kolom proporsional agar tidak terpotong
      ws["!cols"] = [
        { wch: 6 },  // No
        { wch: 18 }, // NISN
        { wch: 32 }, // Nama Lengkap
        { wch: 14 }, // Kelas
        { wch: 18 }, // Jenis
        { wch: 22 }, // Waktu
        { wch: 42 }, // Alasan
        { wch: 16 }, // Status
        { wch: 22 }, // Diproses Oleh
      ];

      // Format Style Seluruh Sel (Persis standar ExportButtons & StudentAbsenceTable)
      for (const cell in ws) {
        if (cell[0] === "!") continue;
        const col = cell.replace(/[0-9]/g, "");
        const row = parseInt(cell.replace(/[a-zA-Z]/g, ""));

        // Baris Metadata Kop (Row 1-4)
        if (row <= 4) {
          if (row === 1) {
            ws[cell].s = {
              font: { bold: true, sz: 14, color: { rgb: "0F172A" } },
              alignment: { horizontal: "left", vertical: "center" },
            };
          } else {
            ws[cell].s = {
              font: { bold: row === 2, sz: 10, color: { rgb: "475569" } },
              alignment: { horizontal: "left", vertical: "center" },
            };
          }
          continue; // Tanpa border untuk kop
        }

        if (row === 5) continue; // Spasi kosong

        let horizontal = "center";
        let bold = false;
        let fill: any = null;

        if (row === 6) {
          // Table Header
          bold = true;
          fill = { fgColor: { rgb: "E2E8F0" } }; // Standard elegan abu-abu
        } else if (row === aoa.length) {
          // Bottom Summary Row
          bold = true;
          fill = { fgColor: { rgb: "F1F5F9" } };
          horizontal = "left";
        } else {
          // Alignment Kolom: C = Nama, G = Alasan rata kiri
          if (col === "C" || col === "G") {
            horizontal = "left";
          }
        }

        ws[cell].s = {
          alignment: { horizontal, vertical: "center", wrapText: true },
          font: { bold, color: { rgb: "0F172A" }, sz: 10 },
          border: {
            top: { style: "thin", color: { rgb: "CBD5E1" } },
            bottom: { style: "thin", color: { rgb: "CBD5E1" } },
            left: { style: "thin", color: { rgb: "CBD5E1" } },
            right: { style: "thin", color: { rgb: "CBD5E1" } },
          },
        };

        if (fill) ws[cell].s.fill = fill;
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Perizinan");

      const dateTag = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `Rekap_Perizinan_Siswa_${dateTag}.xlsx`);

      toast.success("File Excel berhasil diunduh!");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat file Excel");
    } finally {
      setIsExportingExcel(false);
    }
  };

  // 2. UNDUH PDF LANGSUNG (.PDF)
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const data = await fetchData();
      if (!data) {
        setIsExportingPdf(false);
        return;
      }

      // Inisialisasi jsPDF Landscape agar tabel lebar muat sempurna
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      // Header Laporan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.text("LAPORAN REKAPITULASI PERIZINAN SISWA", 40, 40);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const metaPeriod =
        startDate || endDate
          ? `Periode: ${startDate ? new Date(startDate).toLocaleDateString("id-ID") : "Awal"} s/d ${endDate ? new Date(endDate).toLocaleDateString("id-ID") : "Hari Ini"}`
          : "Periode: Semua Waktu";
      doc.text(`${metaPeriod}  |  Total Data: ${data.length} pengajuan`, 40, 56);
      doc.text(
        `Dicetak pada: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full", timeStyle: "short" })}`,
        40,
        70
      );

      // Garis pemisah header
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(1);
      doc.line(40, 78, 802, 78);

      // Data baris tabel
      const tableRows = data.map((item, index) => {
        const formattedDate = new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(item.createdAt));

        return [
          index + 1,
          item.student.nisn || "-",
          item.student.name,
          item.student.class?.name || "-",
          getTypeLabel(item.type),
          formattedDate,
          item.reason || "-",
          getStatusLabel(item.status),
          item.reviewer?.name || (item.status === "PENDING" ? "-" : "Sistem"),
        ];
      });

      autoTable(doc, {
        startY: 90,
        head: [
          [
            "No",
            "NISN",
            "Nama Siswa",
            "Kelas",
            "Jenis Izin",
            "Waktu Pengajuan",
            "Alasan",
            "Status",
            "Verifikator",
          ],
        ],
        body: tableRows,
        styles: {
          font: "helvetica",
          fontSize: 8,
          cellPadding: 4,
          textColor: [15, 23, 42],
        },
        headStyles: {
          fillColor: [30, 41, 59], // Slate 800
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 26 },
          1: { halign: "center", cellWidth: 65 },
          2: { cellWidth: 120 },
          3: { halign: "center", cellWidth: 55 },
          4: { halign: "center", cellWidth: 70 },
          5: { halign: "center", cellWidth: 95 },
          6: { cellWidth: 170 },
          7: { halign: "center", cellWidth: 65 },
          8: { halign: "center", cellWidth: 90 },
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        margin: { left: 40, right: 40 },
      });

      const dateTag = new Date().toISOString().split("T")[0];
      doc.save(`Rekap_Perizinan_Siswa_${dateTag}.pdf`);

      toast.success("File PDF berhasil diunduh!");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat file PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
              <Download className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black">
                Unduh Rekap Perizinan
              </DialogTitle>
              <DialogDescription className="text-xs">
                Unduh berkas laporan dalam format Excel (.xlsx) atau PDF (.pdf) langsung ke perangkat Anda.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Range Tanggal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-slate-500" />
              <span>Rentang Tanggal Pengajuan</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Dari Tanggal</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-900 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium">Sampai Tanggal</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-900 cursor-pointer"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Kosongkan untuk mengunduh seluruh rentang waktu.</p>
          </div>

          {/* Filter Status & Jenis */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Status Izin</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-900 cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="APPROVED">Disetujui Saja</option>
                <option value="PENDING">Menunggu Saja</option>
                <option value="REJECTED">Ditolak Saja</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">Jenis Izin</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-900 cursor-pointer"
              >
                <option value="ALL">Semua Jenis</option>
                <option value="SAKIT">Sakit</option>
                <option value="IZIN_PULANG">Pulang Awal</option>
                <option value="IZIN_KELUARGA">Acara Keluarga</option>
                <option value="IZIN_KEGIATAN">Kegiatan Luar</option>
                <option value="DISPENSASI">Dispensasi</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExportingExcel || isExportingPdf}
            className="text-xs order-last sm:order-first"
          >
            Batal
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Tombol Unduh Excel */}
            <Button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel || isExportingPdf}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
            >
              {isExportingExcel ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="size-3.5" />
              )}
              <span>Unduh Excel</span>
            </Button>

            {/* Tombol Unduh PDF */}
            <Button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingExcel || isExportingPdf}
              className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
            >
              {isExportingPdf ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <FileText className="size-3.5" />
              )}
              <span>Unduh PDF</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
