"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, Calendar, Filter, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, FileText } from "lucide-react";
import { getRequestsForReport } from "@/app/actions/requests";
import { toast } from "sonner";

interface ExportRequestsPdfDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
  defaultStatus?: string;
  defaultType?: string;
}

export function ExportRequestsPdfDialog({
  isOpen,
  onOpenChange,
  defaultStartDate = "",
  defaultEndDate = "",
  defaultStatus = "ALL",
  defaultType = "ALL",
}: ExportRequestsPdfDialogProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [status, setStatus] = useState(defaultStatus);
  const [type, setType] = useState(defaultType);
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any[] | null>(null);

  const fetchAndPrint = async () => {
    setIsLoading(true);
    try {
      const res = await getRequestsForReport({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status,
        type,
      });

      if (!res.success || !res.data) {
        toast.error(res.error || "Gagal mengambil data laporan");
        setIsLoading(false);
        return;
      }

      if (res.data.length === 0) {
        toast.warning("Tidak ada data perizinan yang sesuai dengan filter yang dipilih.");
        setIsLoading(false);
        return;
      }

      setReportData(res.data);
      setIsLoading(false);

      // Jeda 200ms agar DOM ter-render sempurna sebelum print dialog muncul
      setTimeout(() => {
        window.print();
      }, 250);
    } catch (err) {
      console.error("Print error:", err);
      toast.error("Terjadi kesalahan saat memproses cetak dokumen");
      setIsLoading(false);
    }
  };

  const getStatusBadge = (s: string) => {
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

  const currentDateFormatted = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const approvedCount = reportData ? reportData.filter((r) => r.status === "APPROVED").length : 0;
  const pendingCount = reportData ? reportData.filter((r) => r.status === "PENDING").length : 0;
  const rejectedCount = reportData ? reportData.filter((r) => r.status === "REJECTED").length : 0;

  return (
    <>
      {/* Modal Dialog Setting Cetak */}
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md no-print">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                <Printer className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black">Cetak Rekap Perizinan (PDF)</DialogTitle>
                <DialogDescription className="text-xs">
                  Cetak rekap resmi perizinan siswa untuk laporan TU atau arsip sekolah.
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
                    className="w-full text-xs h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-medium">Sampai Tanggal</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 outline-none focus:border-slate-900"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Kosongkan untuk mencetak semua rentang waktu.</p>
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

            <div className="rounded-xl bg-slate-100 dark:bg-zinc-800/60 p-3 text-xs text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
              <p className="font-semibold text-slate-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
                <FileText className="size-3.5 text-slate-600 dark:text-slate-400" />
                Format Cetak:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Dokumen resmi lengkap dengan Kop Surat Sekolah</li>
                <li>Rekap ringkasan jumlah izin & rincian siswa</li>
                <li>Tanda tangan Kepala Sekolah & Petugas Tata Usaha</li>
                <li>Otomatis tersimpan sebagai file PDF via dialog cetak browser</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={fetchAndPrint}
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-slate-900 text-xs font-bold gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Memuat Dokumen...</span>
                </>
              ) : (
                <>
                  <Printer className="size-4" />
                  <span>Cetak / Simpan PDF</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DOKUMEN CETAK KHUSUS (Hanya muncul saat window.print() dipanggil) */}
      {reportData && (
        <div id="print-report-container" className="hidden print:block font-serif text-black bg-white p-4">
          {/* KOP SURAT */}
          <div className="border-b-2 border-black pb-3 mb-4 text-center">
            <h2 className="text-base font-bold uppercase tracking-wide">
              PEMERINTAH DAERAH PROVINSI JAWA BARAT
            </h2>
            <h1 className="text-lg font-black uppercase tracking-wider">
              DINAS PENDIDIKAN — SISTEM LANTAS
            </h1>
            <p className="text-xs font-medium mt-0.5">
              Layanan Terpadu Administrasi Perizinan & Presensi Siswa Mandiri
            </p>
            <p className="text-[10px] text-gray-600 italic">
              Dokumen Sah Tercatat & Terverifikasi Tata Usaha (TU) Sekolah
            </p>
          </div>

          {/* JUDUL LAPORAN */}
          <div className="text-center mb-4">
            <h3 className="text-sm font-bold uppercase underline">
              LAPORAN REKAPITULASI PERIZINAN SISWA
            </h3>
            <p className="text-xs text-gray-700 mt-1">
              Periode: {startDate ? new Date(startDate).toLocaleDateString("id-ID") : "Awal Semester"} s.d.{" "}
              {endDate ? new Date(endDate).toLocaleDateString("id-ID") : "Hari Ini"}
            </p>
          </div>

          {/* RINGKASAN METRIK */}
          <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="border border-black p-1.5">
              <span className="block font-bold">Total Izin</span>
              <span className="text-sm font-black">{reportData.length}</span>
            </div>
            <div className="border border-black p-1.5">
              <span className="block font-bold">Disetujui</span>
              <span className="text-sm font-black">{approvedCount}</span>
            </div>
            <div className="border border-black p-1.5">
              <span className="block font-bold">Menunggu</span>
              <span className="text-sm font-black">{pendingCount}</span>
            </div>
            <div className="border border-black p-1.5">
              <span className="block font-bold">Ditolak</span>
              <span className="text-sm font-black">{rejectedCount}</span>
            </div>
          </div>

          {/* TABEL DATA REKAP */}
          <table className="w-full text-[11px] border-collapse border border-black mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1.5 text-center w-8">No</th>
                <th className="border border-black p-1.5 text-left">Nama Siswa</th>
                <th className="border border-black p-1.5 text-center w-20">Kelas</th>
                <th className="border border-black p-1.5 text-center w-24">Jenis Izin</th>
                <th className="border border-black p-1.5 text-center w-28">Waktu Diajukan</th>
                <th className="border border-black p-1.5 text-left">Alasan / Keterangan</th>
                <th className="border border-black p-1.5 text-center w-20">Status</th>
                <th className="border border-black p-1.5 text-center w-24">Verifikator</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={item.id} className="align-top">
                  <td className="border border-black p-1 text-center">{index + 1}</td>
                  <td className="border border-black p-1 font-semibold">{item.student.name}</td>
                  <td className="border border-black p-1 text-center">{item.student.class?.name || "-"}</td>
                  <td className="border border-black p-1 text-center">{getTypeLabel(item.type)}</td>
                  <td className="border border-black p-1 text-center">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(item.createdAt))}
                  </td>
                  <td className="border border-black p-1">{item.reason}</td>
                  <td className="border border-black p-1 text-center font-bold">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {item.reviewer?.name || (item.status === "PENDING" ? "-" : "Sistem")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* KOLOM TANDA TANGAN */}
          <div className="flex justify-between items-start text-xs pt-4 px-8 break-inside-avoid">
            <div className="text-center w-56">
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah</p>
              <div className="h-16"></div>
              <p className="font-bold underline">( ............................................ )</p>
              <p className="text-[10px] text-gray-600">NIP. ........................................</p>
            </div>

            <div className="text-center w-56">
              <p>Dicetak pada: {currentDateFormatted}</p>
              <p className="font-bold">Petugas Tata Usaha (TU)</p>
              <div className="h-16"></div>
              <p className="font-bold underline">( ............................................ )</p>
              <p className="text-[10px] text-gray-600">NIP. ........................................</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
