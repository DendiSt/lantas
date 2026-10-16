import * as XLSX from "xlsx-js-style";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";
import { getRequestsForReport } from "@/app/actions/requests";

interface ExportFilterParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  q?: string;
}

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

const getStatusLabel = (s: string) => {
  switch (s) {
    case "APPROVED":
      return "Disetujui";
    case "PENDING":
      return "Menunggu";
    case "REJECTED":
      return "Ditolak";
    default:
      return s;
  }
};

async function fetchExportData(filters: ExportFilterParams) {
  const res = await getRequestsForReport({
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    status: filters.status || undefined,
    type: filters.type || undefined,
    q: filters.q || undefined,
  });

  if (!res.success || !res.data) {
    toast.error(res.error || "Gagal mengambil data dari server");
    return null;
  }

  if (res.data.length === 0) {
    toast.warning("Tidak ada data perizinan yang sesuai dengan filter saat ini.");
    return null;
  }

  return res.data;
}

export async function exportRequestsToExcel(filters: ExportFilterParams) {
  const data = await fetchExportData(filters);
  if (!data) return false;

  const { startDate, endDate, status = "ALL", type = "ALL" } = filters;
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

  // Format Style Seluruh Sel
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
      continue;
    }

    if (row === 5) continue; // Spasi kosong

    let horizontal = "center";
    let bold = false;
    let fill: any = null;

    if (row === 6) {
      // Table Header
      bold = true;
      fill = { fgColor: { rgb: "E2E8F0" } };
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
  return true;
}

export async function exportRequestsToPdf(filters: ExportFilterParams) {
  const data = await fetchExportData(filters);
  if (!data) return false;

  const { startDate, endDate, status = "ALL", type = "ALL" } = filters;

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
  doc.text(
    `${metaPeriod}  |  Status: ${status === "ALL" ? "Semua Status" : getStatusLabel(status)}  |  Total Data: ${data.length} pengajuan`,
    40,
    56
  );
  doc.text(
    `Diunduh pada: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full", timeStyle: "short" })}`,
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
      fillColor: [226, 232, 240], // #E2E8F0
      textColor: [15, 23, 42],
      fontStyle: "bold",
      halign: "center",
      lineColor: [203, 213, 225],
      lineWidth: 0.5,
    },
    bodyStyles: {
      lineColor: [203, 213, 225],
      lineWidth: 0.5,
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 26 },
      1: { halign: "center", cellWidth: 60 },
      2: { halign: "left", cellWidth: 120 },
      3: { halign: "center", cellWidth: 65 },
      4: { halign: "center", cellWidth: 70 },
      5: { halign: "center", cellWidth: 90 },
      6: { halign: "left" }, // Alasan auto-width
      7: { halign: "center", cellWidth: 65 },
      8: { halign: "center", cellWidth: 90 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 40, right: 40, bottom: 40 },
    didDrawPage: (dataObj) => {
      // Footer nomor halaman
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      const str = `Halaman ${dataObj.pageNumber} dari ${doc.getNumberOfPages()}`;
      doc.text(str, doc.internal.pageSize.width - 90, doc.internal.pageSize.height - 20);
      doc.text(
        "LANTAS - Layanan Terpadu Administrasi Sekolah",
        40,
        doc.internal.pageSize.height - 20
      );
    },
  });

  const dateTag = new Date().toISOString().split("T")[0];
  doc.save(`Rekap_Perizinan_Siswa_${dateTag}.pdf`);

  toast.success("File PDF berhasil diunduh!");
  return true;
}
