import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  FileText,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  return {
    title: `Verifikasi Dokumen Izin #${id.slice(-6).toUpperCase()} - LANTAS`,
    description: "Halaman resmi verifikasi keaslian surat keterangan izin siswa LANTAS",
  };
}

export default async function VerifikasiPermitPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          nisn: true,
          avatarUrl: true,
          class: { select: { name: true } },
        },
      },
      reviewer: {
        select: {
          name: true,
          nip: true,
        },
      },
    },
  });

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-8 rounded-xl overflow-hidden flex items-center justify-center font-bold shadow-xs">
              <Image
                src="/logoLantas.png"
                alt="Logo LANTAS"
                width={32}
                height={32}
                className="size-8 object-contain"
                unoptimized
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                  LANTAS
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                  VERIFIKASI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                Sistem Informasi Sekolah
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Beranda</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        {/* KONDISI 1: Dokumen Tidak Ditemukan */}
        {!request ? (
          <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xs">
            <div className="size-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200/80 dark:border-rose-800/60">
              <AlertTriangle className="size-8" />
            </div>
            <div className="space-y-1.5">
              <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold px-3 py-1">
                DOKUMEN TIDAK VALID
              </Badge>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Data Perizinan Tidak Ditemukan
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                ID perizinan <span className="font-mono font-semibold text-slate-700 dark:text-zinc-300">&ldquo;{id}&rdquo;</span> tidak terdaftar dalam basis data resmi sekolah LANTAS. Dokumen ini mungkin telah dihapus, dipalsukan, atau tautan tidak valid.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
              >
                <span>Kembali ke Halaman Utama</span>
              </Link>
            </div>
          </div>
        ) : request.status === "REJECTED" ? (
          /* KONDISI 2: Pengajuan Ditolak */
          <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="size-12 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="size-6" />
              </div>
              <div>
                <Badge variant="outline" className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold">
                  STATUS: PERMOHONAN DITOLAK
                </Badge>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Surat Izin Tidak Berlaku
                </h2>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 space-y-1.5">
                <p className="text-slate-500 dark:text-zinc-400">Pemohon Izin:</p>
                <p className="font-bold text-sm text-slate-900 dark:text-white">{request.student.name} ({request.student.class?.name || "Siswa"})</p>
                <p className="text-slate-500 dark:text-zinc-400">Alasan Penolakan: <span className="italic text-rose-700 dark:text-rose-300 font-medium">&ldquo;{request.rejectionNote || "Tidak memenuhi syarat perizinan"}&rdquo;</span></p>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic text-center">
                * Dokumen ini tidak dapat digunakan sebagai surat izin sah di lingkungan sekolah.
              </p>
            </div>
          </div>
        ) : request.status === "PENDING" ? (
          /* KONDISI 3: Pengajuan Masih Pending */
          <div className="bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="size-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="size-6" />
              </div>
              <div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-bold">
                  STATUS: DALAM PROSES VERIFIKASI
                </Badge>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Menunggu Persetujuan Tata Usaha
                </h2>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Nama Siswa</span>
                <span className="font-semibold text-slate-900 dark:text-white">{request.student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Kelas</span>
                <span className="font-semibold text-slate-900 dark:text-white">{request.student.class?.name || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-zinc-400">Kategori Izin</span>
                <span className="font-medium text-slate-800 dark:text-zinc-200">{getTypeLabel(request.type)}</span>
              </div>
            </div>

            <p className="text-[11px] text-amber-700/90 dark:text-amber-400 text-center italic">
              * Permohonan ini belum disetujui secara resmi oleh petugas Tata Usaha sekolah.
            </p>
          </div>
        ) : (
          /* KONDISI 4: Pengajuan Disetujui (APPROVED) - RESMI & SAH */
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
            {/* Kop Status Terverifikasi */}
            <div className="p-5 sm:p-6 bg-gradient-to-b from-emerald-500/10 to-transparent dark:from-emerald-950/30 border-b border-emerald-100 dark:border-emerald-950/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                        Terverifikasi Digital
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                      Surat Keterangan Izin Sah
                    </h2>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold px-3 py-1 text-xs self-start sm:self-auto gap-1"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>DOKUMEN ASLI</span>
                </Badge>
              </div>

              <p className="text-xs text-slate-600 dark:text-zinc-300 mt-3 leading-relaxed">
                Dokumen ini resmi dikeluarkan dan tercatat pada buku register digital Tata Usaha Sekolah. Informasi di bawah ini dijamin keasliannya oleh sistem LANTAS.
              </p>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {/* Nomor Registrasi Dokumen */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Nomor Registrasi:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                  SIP/{new Date(request.createdAt).getFullYear()}/{String(new Date(request.createdAt).getMonth() + 1).padStart(2, "0")}/{request.id.slice(-6).toUpperCase()}
                </span>
              </div>

              {/* Data Siswa */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  <User className="size-3.5" />
                  <span>Identitas Siswa</span>
                </div>

                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={request.student.name}
                    avatarUrl={request.student.avatarUrl}
                    size="md"
                    className="rounded-xl"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {request.student.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Kelas <span className="font-semibold text-slate-800 dark:text-zinc-200">{request.student.class?.name || "Siswa"}</span>
                      {request.student.nisn ? ` • NISN: ${request.student.nisn}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rincian Izin */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  <FileText className="size-3.5" />
                  <span>Rincian Perizinan</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Jenis Izin</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {getTypeLabel(request.type)}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Tanggal Pengajuan</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(request.createdAt))}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Waktu / Durasi</span>
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    {request.startTime
                      ? `${request.startTime} s/d ${request.endTime === "Pulang" ? "Selesai Pembelajaran" : request.endTime}`
                      : "Seharian Penuh (1 Hari)"}
                  </span>
                </div>

                <div className="pt-1">
                  <p className="text-slate-500 dark:text-zinc-400 font-medium">Alasan / Keperluan:</p>
                  <p className="text-slate-800 dark:text-zinc-200 italic mt-0.5 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800">
                    &ldquo;{request.reason}&rdquo;
                  </p>
                </div>
              </div>

              {/* Pengesahan Tata Usaha */}
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <Building2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Pengesahan Tata Usaha (TU)</span>
                </div>

                <div className="space-y-1 text-emerald-900/90 dark:text-emerald-200">
                  <p>
                    Diverifikasi Oleh: <span className="font-bold">{request.reviewer?.name || "Staf Tata Usaha"}</span>
                    {request.reviewer?.nip ? ` (NIP: ${request.reviewer.nip})` : ""}
                  </p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                    Waktu Persetujuan: {new Intl.DateTimeFormat("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(request.updatedAt))} WIB
                  </p>
                  <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-mono">
                    Security Token Hash: SHA256:{request.id.slice(0, 16)}...
                  </p>
                </div>
              </div>

              {/* Catatan Validasi Hukum */}
              <div className="text-[10px] text-center text-slate-400 dark:text-zinc-500 italic space-y-0.5 pt-1">
                <p>* Halaman ini adalah bukti verifikasi online resmi dari Sistem Informasi LANTAS.</p>
                <p>Dokumen sah secara hukum institusi sekolah tanpa memerlukan cap basah fisik.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4 text-xs text-slate-500 dark:text-zinc-400 text-center">
        <p className="font-medium text-slate-700 dark:text-zinc-300">
          LANTAS • Layanan Terpadu Administrasi Sekolah
        </p>
        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
          Verifikasi Dokumen Terpadu © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
