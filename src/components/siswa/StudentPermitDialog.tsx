"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeCanvas } from "qrcode.react";
import { jsPDF } from "jspdf";
import { Printer, Download, CheckCircle2, ShieldCheck, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StudentPermitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: {
    id: string;
    type: string;
    reason: string;
    createdAt: Date;
    startTime?: string | null;
    endTime?: string | null;
    qrToken?: string | null;
    reviewer?: { name: string } | null;
  };
  studentName: string;
  studentClass?: string | null;
  studentNisn?: string | null;
}

export function StudentPermitDialog({
  open,
  onOpenChange,
  request,
  studentName,
  studentClass,
  studentNisn,
}: StudentPermitDialogProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Helper jenis izin
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "SAKIT":
        return "Sakit / Medis";
      case "IZIN_PULANG":
        return "Izin Pulang Mendahului";
      case "IZIN_KELUARGA":
        return "Izin Kepentingan Keluarga";
      case "IZIN_KEGIATAN":
        return "Izin Tugas / Kegiatan Sekolah";
      case "DISPENSASI":
        return "Dispensasi Khusus";
      case "TANPA_KETERANGAN":
        return "Alpha";
      default:
        return "Izin Tertulis";
    }
  };

  const typeLabel = getTypeLabel(request.type);

  // Format tanggal & jam
  const reqDate = new Date(request.createdAt);

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(reqDate);

  const formattedTime = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(reqDate);

  const durationText = request.startTime
    ? `${request.startTime} s/d ${request.endTime === "Pulang" ? "Selesai Pembelajaran" : request.endTime}`
    : "Seharian Penuh (1 Hari)";

  const docNumber = `SIP/${reqDate.getFullYear()}/${String(reqDate.getMonth() + 1).padStart(2, "0")}/${request.id.slice(-6).toUpperCase()}`;
  const qrCanvasId = `qr-permit-${request.id}`;
  const verificationPayload = `LANTAS-VERIFIED|ID:${request.id}|NISN:${studentNisn || "-"}|NAME:${studentName}|TYPE:${request.type}|DATE:${reqDate.toISOString().split("T")[0]}`;

  // Fungsi Cetak Langsung (via hidden print iframe)
  const handlePrint = () => {
    const slipElement = document.getElementById(`permit-slip-content-${request.id}`);

    if (!slipElement) {
      toast.error("Area dokumen cetak tidak ditemukan.");

      return;
    }

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;

    if (!doc) {
      document.body.removeChild(iframe);
      toast.error("Gagal menyiapkan proses cetak dokumen.");

      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>Surat Izin Siswa - ${studentName}</title>
          <style>
            @page {
              size: A5 portrait;
              margin: 10mm;
            }
            * {
              box-sizing: border-box;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            }
            body {
              margin: 0;
              padding: 0;
              color: #0f172a;
              background: #ffffff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .slip-card {
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 16px;
            }
            .header-title {
              font-size: 13pt;
              font-weight: 800;
              text-align: center;
              margin: 0;
              color: #0f172a;
            }
            .header-subtitle {
              font-size: 8.5pt;
              text-align: center;
              color: #475569;
              margin: 2px 0 0 0;
            }
            .header-line {
              border-bottom: 2px solid #0f172a;
              margin: 10px 0 14px 0;
            }
            .doc-title {
              font-size: 11pt;
              font-weight: 700;
              text-align: center;
              margin: 0;
            }
            .doc-number {
              font-size: 8pt;
              text-align: center;
              color: #64748b;
              margin: 2px 0 12px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 8.5pt;
              margin-bottom: 12px;
            }
            td {
              padding: 4px 6px;
              vertical-align: top;
            }
            .td-label {
              width: 32%;
              font-weight: 600;
              color: #475569;
            }
            .td-value {
              font-weight: 500;
              color: #0f172a;
            }
            .box-verify {
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 6px;
              padding: 10px;
              margin-top: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .verify-badge {
              font-size: 8.5pt;
              font-weight: 700;
              color: #166534;
              margin-bottom: 4px;
            }
            .verify-detail {
              font-size: 7.5pt;
              color: #15803d;
              line-height: 1.4;
            }
            .footer-note {
              font-size: 7pt;
              font-style: italic;
              color: #94a3b8;
              text-align: center;
              margin-top: 14px;
              line-height: 1.3;
            }
          </style>
        </head>
        <body>
          ${slipElement.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 400);
  };

  // Fungsi Unduh PDF Berformat Resmi (via jsPDF)
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5", // 148 x 210 mm
      });

      // Header Lembaga
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.setTextColor(15, 23, 42);
      doc.text("LAYANAN TERPADU ADMINISTRASI SEKOLAH (LANTAS)", 74, 14, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Sistem Informasi Presensi & Manajemen Perizinan Siswa Mandiri", 74, 18.5, { align: "center" });
      doc.text("Surat Izin Resmi - Validasi Elektronik Terpadu", 74, 22.5, { align: "center" });

      // Garis Ganda Pembatas Kop
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.6);
      doc.line(12, 26, 136, 26);
      doc.setLineWidth(0.2);
      doc.line(12, 27, 136, 27);

      // Judul Surat & Nomor Dokumen
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("SURAT KETERANGAN IZIN SISWA", 74, 34, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Nomor: ${docNumber}`, 74, 38.5, { align: "center" });

      // Box 1: Identitas Siswa
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(12, 43, 124, 24, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Nama Lengkap", 16, 49);
      doc.text("NISN", 16, 55);
      doc.text("Kelas", 16, 61);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(`: ${studentName}`, 42, 49);
      doc.text(`: ${studentNisn || "-"}`, 42, 55);
      doc.text(`: ${studentClass || "Siswa"}`, 42, 61);

      // Box 2: Detail Perizinan
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(12, 70, 124, 36, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Jenis Izin", 16, 76);
      doc.text("Tanggal Pengajuan", 16, 82);
      doc.text("Waktu / Durasi", 16, 88);
      doc.text("Alasan / Keperluan", 16, 94);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(15, 23, 42);
      doc.text(`: ${typeLabel}`, 42, 76);
      doc.text(`: ${formattedDate} (${formattedTime} WIB)`, 42, 82);
      doc.text(`: ${durationText}`, 42, 88);

      const splitReason = doc.splitTextToSize(`: ${request.reason}`, 78);
      doc.text(splitReason, 42, 94);

      // Box 3: Pengesahan & Validasi Digital
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(187, 247, 208);
      doc.roundedRect(12, 109, 124, 30, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(22, 101, 52);
      doc.text("[TERVERIFIKASI] RESMI DISETUJUI", 16, 115);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(21, 128, 61);
      doc.text(`Diverifikasi Oleh : ${request.reviewer?.name || "Petugas Tata Usaha"}`, 16, 120);
      doc.text(`Waktu Persetujuan: ${formattedDate}, ${formattedTime} WIB`, 16, 125);
      doc.text("Status Validasi  : Sah & Terdaftar di Sistem TU", 16, 130);

      // Embed QR Code Canvas jika ada
      const canvas = document.getElementById(qrCanvasId) as HTMLCanvasElement | null;

      if (canvas) {
        const qrDataUrl = canvas.toDataURL("image/png");
        doc.addImage(qrDataUrl, "PNG", 107, 111.5, 25, 25);
      }

      // Catatan Keabsahan Arsip
      doc.setFont("helvetica", "italic");
      doc.setFontSize(6.8);
      doc.setTextColor(148, 163, 184);
      doc.text("* Dokumen elektronik ini sah dikeluarkan melalui Sistem Informasi Tata Usaha LANTAS.", 74, 146, { align: "center" });
      doc.text("* Barcode QR memuat tanda verifikasi digital keaslian perizinan siswa.", 74, 150, { align: "center" });

      const safeName = studentName.replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `Surat_Izin_${safeName}_${request.id.slice(-6).toUpperCase()}.pdf`;

      doc.save(fileName);
      toast.success("Surat izin berhasil diunduh sebagai PDF!");
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
      toast.error("Terjadi kendala saat mengunduh berkas PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[94vw] p-5 rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-slate-200 dark:border-zinc-800">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <FileText className="size-4 text-emerald-600 dark:text-emerald-400" />
            Bukti Surat Izin Resmi
          </DialogTitle>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Dokumen digital resmi persetujuan perizinan siswa diterbitkan oleh Tata Usaha
          </p>
        </DialogHeader>

        {/* Preview Area (Akan digunakan juga untuk Print HTML) */}
        <div className="py-2">
          <div
            id={`permit-slip-content-${request.id}`}
            className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 text-slate-900 dark:text-zinc-100 shadow-2xs"
          >
            {/* Kop Surat */}
            <div className="text-center pb-2 border-b-2 border-slate-900 dark:border-zinc-300 space-y-0.5">
              <h4 className="text-xs sm:text-sm font-extrabold tracking-tight uppercase">
                Layanan Terpadu Administrasi Sekolah (LANTAS)
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                Sistem Presensi & Perizinan Siswa Mandiri
              </p>
            </div>

            {/* Judul & Nomor */}
            <div className="text-center py-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                Surat Keterangan Izin Siswa
              </p>
              <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                {docNumber}
              </p>
            </div>

            {/* Data Siswa */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-700/60 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Nama Siswa</span>
                <span className="font-semibold text-slate-900 dark:text-white">{studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">NISN</span>
                <span className="font-mono text-slate-700 dark:text-zinc-300">{studentNisn || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Kelas</span>
                <span className="font-semibold text-slate-900 dark:text-white">{studentClass || "-"}</span>
              </div>
            </div>

            {/* Detail Izin */}
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-zinc-400">Kategori Izin</span>
                <Badge variant="outline" className="text-[10px] bg-slate-100 dark:bg-zinc-800 font-medium">
                  {typeLabel}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Tanggal</span>
                <span className="font-medium text-slate-700 dark:text-zinc-300">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Durasi</span>
                <span className="font-medium text-slate-700 dark:text-zinc-300">{durationText}</span>
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-zinc-800">
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Alasan / Keterangan:</p>
                <p className="text-xs text-slate-700 dark:text-zinc-300 italic mt-0.5">&ldquo;{request.reason}&rdquo;</p>
              </div>
            </div>

            {/* Verifikasi Digital & QR Code */}
            <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between gap-3">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-200 font-bold">
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>TERVERIFIKASI RESMI</span>
                </div>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/90">
                  Diverifikasi oleh: <span className="font-semibold">{request.reviewer?.name || "Admin Tata Usaha"}</span>
                </p>
                <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">
                  Waktu: {formattedDate}, {formattedTime} WIB
                </p>
              </div>

              {/* QR Code Canvas */}
              <div className="p-1 rounded-md bg-white border border-emerald-200 shadow-2xs shrink-0">
                <QRCodeCanvas
                  id={qrCanvasId}
                  value={verificationPayload}
                  size={64}
                  level="M"
                />
              </div>
            </div>

            {/* Catatan Keabsahan Arsip */}
            <p className="text-[9px] text-center text-slate-400 dark:text-zinc-500 italic leading-tight pt-1">
              * Dokumen ini sah dan tercatat secara digital di sistem Tata Usaha LANTAS sebagai bukti arsip perizinan siswa.
            </p>
          </div>
        </div>

        {/* Action Buttons: Cetak, Download PDF, Tutup */}
        <div className="pt-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>Dokumen sah digital LANTAS</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial h-8 text-xs gap-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <Printer className="size-3.5" />
              <span>Cetak</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-initial h-8 text-xs gap-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 cursor-pointer shadow-xs"
            >
              {isGeneratingPdf ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              <span>Unduh PDF</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

