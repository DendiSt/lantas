"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateRequestDialog } from "./CreateRequestDialog";
import { deletePermissionRequest } from "@/app/actions/requests";
import { QRCodeSVG } from "qrcode.react";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Thermometer,
  LogOut,
  FileQuestion,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Trash2,
  Loader2,
  ShieldCheck,
  Download,
  AlertCircle,
} from "lucide-react";

interface RequestCardProps {
  request: {
    id: string;
    type: string;
    reason: string;
    attachmentUrl: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionNote: string | null;
    createdAt: Date;
    reviewer?: { name: string } | null;
    qrToken?: string | null;
    scannedAt?: Date | null;
    security?: { name: string } | null;
    startTime?: string | null;
    qrExpiresAt?: Date | null;
    departureStatus?: "PENDING" | "FROM_SCHOOL" | "FROM_HOME";
  };
  studentId: string;
  studentName: string;
}

export function RequestCard({ request, studentId, studentName }: RequestCardProps) {
  const [showAttachment, setShowAttachment] = useState(false);
  const [isPending, startTransition] = useTransition();
  const qrRef = useRef<HTMLDivElement>(null);

  // Cek apakah QR sudah kadaluarsa (berdasarkan qrExpiresAt)
  const isQrExpired = (() => {
    if (!request.qrToken || request.scannedAt) return false;
    if (request.qrExpiresAt) {
      return new Date() > new Date(request.qrExpiresAt);
    }
    return false;
  })();

  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 50, 50, 300, 300);
      URL.revokeObjectURL(url);
      
      const link = document.createElement("a");
      const dateStr = new Date(request.createdAt).toISOString().split("T")[0];
      link.download = `izin_qr_${dateStr}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = url;
  }, [request.createdAt]);

  const handleDelete = async () => {
    await deletePermissionRequest(request.id);
  };

  // Helper jenis izin
  const getTypeInfo = (type: string) => {
    switch (type) {
      case "SAKIT":
        return {
          label: "Sakit",
          icon: <Thermometer className="size-3.5 text-slate-600 dark:text-slate-400" />,
        };
      case "IZIN_PULANG":
        return {
          label: "Izin Pulang",
          icon: <LogOut className="size-3.5 text-slate-600 dark:text-slate-400" />,
        };
      case "IZIN_KELUARGA":
      case "IZIN_KEGIATAN":
      case "DISPENSASI":
        return {
          label: type.replace("IZIN_", "").toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
          icon: <FileText className="size-3.5 text-slate-600 dark:text-slate-400" />,
        };
      case "TANPA_KETERANGAN":
        return {
          label: "Alpha",
          icon: <XCircle className="size-3.5 text-slate-600 dark:text-slate-400" />,
        };
      default:
        return {
          label: "Lainnya",
          icon: <FileQuestion className="size-3.5 text-slate-600 dark:text-slate-400" />,
        };
    }
  };

  // Helper status badge sesuai acuan wireframe
  const getStatusBadge = (status: string, reviewerName?: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80 font-medium text-xs gap-1 py-0.5 px-2.5 rounded-full"
          >
            <Clock className="size-3 text-amber-600" />
            <span>PENDING</span>
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 font-medium text-xs gap-1 py-0.5 px-2.5 rounded-full"
          >
            <CheckCircle2 className="size-3 text-emerald-600" />
            <span>APPROVED</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 font-medium text-xs gap-1 py-0.5 px-2.5 rounded-full"
          >
            <XCircle className="size-3 text-rose-600" />
            <span>REJECTED</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  const typeInfo = getTypeInfo(request.type);

  // Format tanggal bahasa Indonesia
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(request.createdAt));

  return (
    <>
      <Card className="rounded-xl border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 transition-all bg-white dark:bg-zinc-900 overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-3">
          {/* Baris Atas: Label Jenis Izin (Neutral Gray Pill) & Status Badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
              {typeInfo.icon}
              <span>{typeInfo.label}</span>
            </div>

            <div>{getStatusBadge(request.status, request.reviewer?.name)}</div>
          </div>

          {/* Isi Alasan Izin */}
          <div className="space-y-2">
            <p className="text-sm text-foreground leading-relaxed font-normal">
              &ldquo;{request.reason}&rdquo;
            </p>
            {request.status === "REJECTED" && request.rejectionNote && (
              <div className="bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/50">
                <p className="text-[11px] font-semibold text-rose-800 dark:text-rose-400 mb-0.5">Alasan Penolakan:</p>
                <p className="text-xs text-rose-700 dark:text-rose-300 italic">&ldquo;{request.rejectionNote}&rdquo;</p>
              </div>
            )}
            {request.reviewer && request.status !== "PENDING" && (
              <div className="bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-700/50 mt-1.5 flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-500" />
                <p className="text-xs text-slate-600 dark:text-zinc-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Diproses oleh Admin:</span> {request.reviewer.name}
                </p>
              </div>
            )}

            {/* QR Code Section */}
            {request.qrToken && !request.scannedAt && !isQrExpired && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-3 mt-4">
                <p className="text-xs font-bold text-slate-800 text-center uppercase tracking-wide">
                  Tunjukkan QR ini ke Satpam
                </p>
                <div ref={qrRef}>
                  <QRCodeSVG value={request.qrToken} size={150} level="M" />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    Simpan QR
                  </button>
                </div>
                {request.qrExpiresAt && (
                  <p className="text-[10px] text-slate-400 text-center">
                    Berlaku sampai pukul {new Date(request.qrExpiresAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </p>
                )}
              </div>
            )}

            {(() => {
              // Jika sudah discan, atau berstatus keluar gerbang, atau (expired & belum discan)
              if (
                request.scannedAt || 
                request.departureStatus === "FROM_SCHOOL" || 
                request.departureStatus === "FROM_HOME" ||
                (request.qrToken && !request.scannedAt && isQrExpired)
              ) {
                const isFullDay = !request.startTime || request.startTime === "";
                const isFromHome = request.departureStatus === "FROM_HOME" || 
                  (isQrExpired && !request.scannedAt && (request.type === "DISPENSASI" || request.type === "IZIN_KEGIATAN") && isFullDay);
                
                if (isFromHome) {
                  return (
                    <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-200 dark:border-zinc-700/50 mt-4 flex items-center gap-3">
                      <div className="size-8 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="size-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Berangkat dari Rumah / Luar</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Siswa tercatat berangkat langsung dari luar area sekolah.
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/50 mt-4 flex items-center gap-3">
                      <div className="size-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                        <ShieldCheck className="size-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300">Telah Keluar Gerbang</p>
                        <p className="text-[10px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">
                          {request.scannedAt ? `Dikonfirmasi oleh Satpam: ${request.security?.name || "Satpam"}` : "Status dikonfirmasi otomatis (Batas waktu QR Habis)."}
                        </p>
                      </div>
                    </div>
                  );
                }
              }
              return null;
            })()}
          </div>

          {/* Baris Bawah: Waktu & Tombol Lampiran */}
          <div className="pt-2 border-t border-border flex items-start justify-between text-xs text-muted-foreground">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>{formattedDate} WIB</span>
              </div>
              <div className="flex items-center gap-1.5">
                {request.startTime !== null && request.startTime !== undefined ? (
                  <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {request.startTime} s/d {request.endTime === "Pulang" ? 'Pulang' : request.endTime}
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    Seharian Penuh
                  </span>
                )}
              </div>
            </div>

            {request.attachmentUrl && (
              <button
                type="button"
                onClick={() => setShowAttachment(true)}
                className="inline-flex items-center gap-1 font-medium text-slate-900 dark:text-slate-200 hover:text-slate-700 dark:hover:text-white hover:underline cursor-pointer"
              >
                <FileText className="size-3.5" />
                <span>Lihat Bukti</span>
              </button>
            )}
          </div>

          {/* Tombol Aksi untuk PENDING */}
          {request.status === "PENDING" && (
            <div className="pt-3 mt-1 border-t border-border flex items-center justify-end gap-2">
              <ConfirmDeleteDialog
                title="Batalkan Pengajuan Izin?"
                description="Pengajuan izin ini akan dihapus secara permanen dan tidak bisa dikembalikan."
                onConfirm={handleDelete}
                trigger={
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Batalkan
                  </Button>
                }
              />
              <CreateRequestDialog
                studentId={studentId}
                studentName={studentName}
                requestId={request.id}
                initialType={request.type as any}
                initialReason={request.reason}
                initialDate={new Date(request.createdAt).toISOString().split("T")[0]}
                initialAttachmentUrl={request.attachmentUrl}
                initialStartTime={request.startTime}
                initialEndTime={request.endTime}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Preview Lampiran */}
      {request.attachmentUrl && (
        <Dialog open={showAttachment} onOpenChange={setShowAttachment}>
          <DialogContent className="max-w-md w-[92vw] p-5 rounded-2xl">
            <DialogHeader className="pb-2 border-b border-border">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="size-4 text-slate-800 dark:text-slate-200" />
                Lampiran Bukti Pengajuan
              </DialogTitle>
            </DialogHeader>
            <div className="py-2 flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={request.attachmentUrl}
                alt="Bukti Lampiran Izin"
                className="max-h-72 w-full object-contain rounded-xl border border-border bg-black/5"
              />
              <div className="w-full text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                <p className="font-semibold text-foreground mb-0.5">Alasan Terkait:</p>
                <p>{request.reason}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
