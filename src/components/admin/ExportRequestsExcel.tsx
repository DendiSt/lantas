"use client";

import { useState } from "react";
import { FileSpreadsheet, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx-js-style";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { getRequestExportData } from "@/app/actions/requests";
import { toast } from "sonner";

interface ExportRequestsExcelProps {
  initialStartDate?: string;
  initialEndDate?: string;
  initialStatus?: string;
  initialType?: string;
}

export function ExportRequestsExcel({
  initialStartDate = "",
  initialEndDate = "",
  initialStatus = "ALL",
  initialType = "ALL",
}: ExportRequestsExcelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(initialStartDate);
  const [exportEndDate, setExportEndDate] = useState(initialEndDate);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedType, setSelectedType] = useState(initialType);
  const [isExporting, setIsExporting] = useState(false);

  const handleOpenModal = () => {
    setExportStartDate(initialStartDate);
    setExportEndDate(initialEndDate);
    setSelectedStatus(initialStatus);
    setSelectedType(initialType);
    setIsOpen(true);
  };

  const executeExport = async () => {
    setIsExporting(true);

    try {
      const res = await getRequestExportData({
        startDate: exportStartDate || undefined,
        endDate: exportEndDate || undefined,
        status: selectedStatus,
        type: selectedType,
      });

      if (!res.success || !res.data) {
        toast.error(res.error || "Gagal mengambil data dari server.");
        setIsExporting(false);
        return;
      }

      const rawData = res.data;

      if (rawData.length === 0) {
        toast.warning("Tidak ada data perizinan untuk kriteria ini.");
        setIsExporting(false);
        return;
      }

      // Metadata Periode & Filter
      const metaPeriod =
        exportStartDate || exportEndDate
          ? `${exportStartDate ? new Date(exportStartDate).toLocaleDateString("id-ID") : "Awal"} s/d ${exportEndDate ? new Date(exportEndDate).toLocaleDateString("id-ID") : "Hari Ini"}`
          : "Semua Waktu";

      const statusText =
        selectedStatus === "ALL"
          ? "Semua Status"
          : selectedStatus === "APPROVED"
          ? "Disetujui"
          : selectedStatus === "PENDING"
          ? "Menunggu"
          : "Ditolak";

      const typeText =
        selectedType === "ALL" ? "Semua Jenis" : selectedType.replace("IZIN_", "");

      const metaDate = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const aoa: any[][] = [
        ["LAPORAN REKAPITULASI PERIZINAN SISWA - LANTAS"],
        [`Periode: ${metaPeriod}`],
        [`Status: ${statusText} | Jenis: ${typeText}`],
        [`Tanggal Unduh: ${metaDate}`],
        [""], // Baris spasi pemisah
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

      rawData.forEach((item) => {
        aoa.push([
          item.no,
          item.nisn,
          item.name,
          item.className,
          item.type,
          item.waktu,
          item.reason,
          item.status,
          item.reviewer,
        ]);
      });

      // Hitung ringkasan status
      const totalApp = rawData.filter((d) => d.status === "Disetujui").length;
      const totalPend = rawData.filter((d) => d.status === "Menunggu").length;
      const totalRej = rawData.filter((d) => d.status === "Ditolak").length;

      aoa.push([
        "",
        "",
        `Ringkasan: ${rawData.length} Total Pengajuan (Disetujui: ${totalApp}, Menunggu: ${totalPend}, Ditolak: ${totalRej})`,
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

      // Lebar kolom proporsional
      ws["!cols"] = [
        { wch: 6 },  // No
        { wch: 18 }, // NISN
        { wch: 32 }, // Nama Siswa
        { wch: 14 }, // Kelas
        { wch: 18 }, // Jenis Izin
        { wch: 22 }, // Waktu Pengajuan
        { wch: 42 }, // Alasan
        { wch: 16 }, // Status
        { wch: 22 }, // Diproses Oleh
      ];

      // Styling Seluruh Sel
      for (const cell in ws) {
        if (cell[0] === "!") continue;
        const col = cell.replace(/[0-9]/g, "");
        const row = parseInt(cell.replace(/[a-zA-Z]/g, ""));

        // Baris Kop Surat (Row 1-4)
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
          continue;
        }

        if (row === 5) continue; // Spasi kosong

        let horizontal = "center";
        let bold = false;
        let fill: any = null;

        if (row === 6) {
          // Header Tabel
          bold = true;
          fill = { fgColor: { rgb: "E2E8F0" } };
        } else if (row === aoa.length) {
          // Baris Summary di Paling Bawah
          bold = true;
          fill = { fgColor: { rgb: "F1F5F9" } };
          horizontal = "left";
        } else {
          // Nama & Alasan rata kiri
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
      let fileName = `Rekap_Perizinan_Siswa_${dateTag}`;
      if (selectedStatus !== "ALL") fileName += `_${selectedStatus}`;
      fileName += ".xlsx";

      XLSX.writeFile(wb, fileName);

      toast.success("File Excel berhasil diunduh!");
      setIsOpen(false);
    } catch (error) {
      console.error("Error exporting excel:", error);
      toast.error("Terjadi kesalahan saat mengunduh file Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 no-print">
        <Button
          type="button"
          onClick={handleOpenModal}
          className="h-9 px-3 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-transparent cursor-pointer shadow-2xs"
        >
          <FileSpreadsheet className="size-4" />
          <span>Unduh Excel</span>
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Unduh Rekap Perizinan (Excel)</DialogTitle>
            <DialogDescription>
              Pilih kriteria dan rentang tanggal perizinan siswa yang ingin Anda unduh.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Filter Status */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Status Pengajuan:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:border-slate-900 outline-none text-sm text-slate-800 dark:text-zinc-200"
              >
                <option value="ALL">Semua Status</option>
                <option value="APPROVED">Disetujui</option>
                <option value="PENDING">Menunggu Verifikasi</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>

            {/* Filter Jenis Izin */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                Jenis Izin:
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 focus:border-slate-900 outline-none text-sm text-slate-800 dark:text-zinc-200"
              >
                <option value="ALL">Semua Jenis Izin</option>
                <option value="SAKIT">Sakit</option>
                <option value="IZIN_PULANG">Pulang Awal</option>
                <option value="IZIN_KELUARGA">Acara Keluarga</option>
                <option value="IZIN_KEGIATAN">Kegiatan Luar</option>
                <option value="DISPENSASI">Dispensasi</option>
                <option value="TANPA_KETERANGAN">Alpha</option>
              </select>
            </div>

            {/* Filter Rentang Tanggal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">
                  Dari Tanggal
                </label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:border-slate-900 text-slate-800 dark:text-zinc-200 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-white">
                  Sampai Tanggal
                </label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm outline-none focus:border-slate-900 text-slate-800 dark:text-zinc-200 cursor-pointer"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Kosongkan tanggal jika ingin mengekspor seluruh data tanpa batasan waktu.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isExporting}
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={isExporting}
              onClick={executeExport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Download className="size-4" />
                  <span>Unduh Sekarang</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
