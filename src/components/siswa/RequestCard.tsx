"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";

interface RequestCardProps {
  request: {
    id: string;
    type: "SAKIT" | "PULANG" | "LAINNYA";
    reason: string;
    attachmentUrl: string | null;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
  };
}

export function RequestCard({ request }: RequestCardProps) {
  const [showAttachment, setShowAttachment] = useState(false);

  // Helper jenis izin
  const getTypeInfo = (type: string) => {
    switch (type) {
      case "SAKIT":
        return {
          label: "Sakit",
          icon: <Thermometer className="size-3.5 text-slate-600 dark:text-slate-400" />,
        };
      case "PULANG":
        return {
          label: "Izin Pulang",
          icon: <LogOut className="size-3.5 text-slate-600 dark:text-slate-400" />,
        };
      default:
        return {
          label: "Lainnya",
          icon: <FileQuestion className="size-3.5 text-slate-600 dark:text-slate-400" />,
        };
    }
  };

  // Helper status badge sesuai acuan wireframe
  const getStatusBadge = (status: string) => {
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

            <div>{getStatusBadge(request.status)}</div>
          </div>

          {/* Isi Alasan Izin */}
          <p className="text-sm text-foreground leading-relaxed font-normal">
            &ldquo;{request.reason}&rdquo;
          </p>

          {/* Baris Bawah: Waktu & Tombol Lampiran */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              <span>{formattedDate} WIB</span>
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
