"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateRequestStatus } from "@/app/actions/requests";
import { RequestStatus } from "@prisma/client";
import {
  Check,
  X,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Thermometer,
  LogOut,
  FileQuestion,
  Loader2,
  Calendar,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface RequestWithStudent {
  id: string;
  type: "SAKIT" | "PULANG" | "LAINNYA";
  reason: string;
  attachmentUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  student: {
    id: string;
    name: string;
    classId: string | null;
  };
}

interface AdminRequestsTableProps {
  initialRequests: RequestWithStudent[];
}

export function AdminRequestsTable({ initialRequests }: AdminRequestsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [selectedAttachment, setSelectedAttachment] = useState<{
    id: string;
    studentName: string;
    classId: string | null;
    reason: string;
    url: string;
    status: RequestStatus;
  } | null>(null);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleStatusUpdate = (requestId: string, newStatus: RequestStatus) => {
    setLoadingId(requestId);
    startTransition(async () => {
      await updateRequestStatus(requestId, newStatus);
      setLoadingId(null);
      if (selectedAttachment && selectedAttachment.id === requestId) {
        setSelectedAttachment((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    });
  };

  // Filter requests
  const filteredRequests = initialRequests.filter((req) => {
    if (statusFilter !== "ALL" && req.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && req.type !== typeFilter) return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const nameMatch = req.student.name.toLowerCase().includes(q);
      const classMatch = (req.student.classId || "").toLowerCase().includes(q);
      const reasonMatch = req.reason.toLowerCase().includes(q);
      return nameMatch || classMatch || reasonMatch;
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pendingCount = initialRequests.filter((r) => r.status === "PENDING").length;

  // Type tag: Subtle neutral gray pill (bg-slate-100 text-slate-700 text-xs)
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SAKIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
            <Thermometer className="size-3 text-slate-600 dark:text-slate-400" />
            <span>Sakit</span>
          </span>
        );
      case "PULANG":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
            <LogOut className="size-3 text-slate-600 dark:text-slate-400" />
            <span>Pulang Awal</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/60 dark:border-zinc-700">
            <FileQuestion className="size-3 text-slate-600 dark:text-slate-400" />
            <span>Lainnya</span>
          </span>
        );
    }
  };

  // Status badges: PENDING (Amber), APPROVED (Emerald), REJECTED (Rose)
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-medium text-xs gap-1 py-0.5 px-2.5 rounded-full"
          >
            <Clock className="size-3 text-amber-600" />
            <span>PENDING</span>
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-medium text-xs gap-1 py-0.5 px-2.5 rounded-full"
          >
            <CheckCircle2 className="size-3 text-emerald-600" />
            <span>APPROVED</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-medium text-xs gap-1 py-0.5 px-2.5 rounded-full"
          >
            <XCircle className="size-3 text-rose-600" />
            <span>REJECTED</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Filter Tabs, Type Select & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl border border-slate-200/80 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ALL");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Semua ({initialRequests.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("PENDING");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "PENDING"
                ? "bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-300 shadow-xs font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Perlu Verifikasi</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("APPROVED");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === "APPROVED"
                ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 shadow-xs font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Disetujui
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("REJECTED");
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              statusFilter === "REJECTED"
                ? "bg-white dark:bg-zinc-900 text-rose-700 dark:text-rose-300 shadow-xs font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Ditolak
          </button>
        </div>

        {/* Filter Dropdown & Search Box */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter jenis izin"
            className="h-9 px-3 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:border-slate-900 outline-none cursor-pointer"
          >
            <option value="ALL">Semua Jenis Izin</option>
            <option value="SAKIT">Sakit</option>
            <option value="PULANG">Pulang Awal</option>
            <option value="LAINNYA">Lainnya</option>
          </select>

          <div className="relative flex-1 sm:w-60">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <Input
              type="text"
              placeholder="Cari nama, kelas, alasan..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 text-xs h-9 rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 focus:border-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[190px] font-bold text-xs text-slate-700 dark:text-zinc-300">Siswa / Kelas</TableHead>
                <TableHead className="w-[120px] font-bold text-xs text-slate-700 dark:text-zinc-300">Jenis Izin</TableHead>
                <TableHead className="min-w-[220px] font-bold text-xs text-slate-700 dark:text-zinc-300">Alasan Keterangan</TableHead>
                <TableHead className="w-[120px] font-bold text-xs text-center text-slate-700 dark:text-zinc-300">Lampiran</TableHead>
                <TableHead className="w-[150px] font-bold text-xs text-slate-700 dark:text-zinc-300">Waktu Pengajuan</TableHead>
                <TableHead className="w-[130px] font-bold text-xs text-slate-700 dark:text-zinc-300">Status</TableHead>
                <TableHead className="w-[160px] font-bold text-xs text-right pr-4 text-slate-700 dark:text-zinc-300">Aksi TU</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((req) => {
                  const isLoading = loadingId === req.id;
                  const formattedDate = new Intl.DateTimeFormat("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(req.createdAt));

                  return (
                    <TableRow key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors border-b border-slate-100 dark:border-zinc-800">
                      {/* Siswa & Kelas */}
                      <TableCell className="align-middle py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {req.student.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                              {req.student.name}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">
                              {req.student.classId || "Siswa"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Jenis Izin */}
                      <TableCell className="align-middle py-3">
                        {getTypeBadge(req.type)}
                      </TableCell>

                      {/* Alasan */}
                      <TableCell className="align-middle py-3">
                        <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-2 max-w-sm leading-relaxed" title={req.reason}>
                          &ldquo;{req.reason}&rdquo;
                        </p>
                      </TableCell>

                      {/* Lampiran */}
                      <TableCell className="align-middle py-3 text-center">
                        {req.attachmentUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSelectedAttachment({
                                id: req.id,
                                studentName: req.student.name,
                                classId: req.student.classId,
                                reason: req.reason,
                                url: req.attachmentUrl!,
                                status: req.status,
                              })
                            }
                            className="h-7 px-2.5 text-xs rounded-lg gap-1 border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
                          >
                            <Eye className="size-3 text-slate-600 dark:text-zinc-400" />
                            <span>Lihat Bukti</span>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500 italic">
                            Tanpa Bukti
                          </span>
                        )}
                      </TableCell>

                      {/* Waktu Pengajuan */}
                      <TableCell className="align-middle py-3">
                        <div className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                          <Calendar className="size-3 text-slate-400 dark:text-zinc-500 shrink-0" />
                          <span>{formattedDate} WIB</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="align-middle py-3">
                        {getStatusBadge(req.status)}
                      </TableCell>

                      {/* Tombol Aksi Permohonan */}
                      <TableCell className="align-middle py-3 text-right pr-4">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {req.status === "PENDING" ? (
                            <>
                              {/* Tombol Setujui (Approve) */}
                              <Button
                                size="sm"
                                disabled={isLoading}
                                onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                                className="h-7 px-2.5 text-xs bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-lg gap-1 shadow-xs transition-all cursor-pointer font-medium"
                                title="Setujui Izin"
                              >
                                {isLoading ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <Check className="size-3.5 stroke-[2.5]" />
                                )}
                                <span>Setujui</span>
                              </Button>

                              {/* Tombol Tolak (Reject) */}
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                                className="h-7 px-2.5 text-xs border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg gap-1 transition-all cursor-pointer"
                                title="Tolak Izin"
                              >
                                {isLoading ? (
                                  <Loader2 className="size-3 animate-spin" />
                                ) : (
                                  <X className="size-3.5 stroke-[2.5]" />
                                )}
                                <span>Tolak</span>
                              </Button>
                            </>
                          ) : req.status === "APPROVED" ? (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="size-3" /> Selesai
                              </span>
                              <Button
                                variant="ghost"
                                size="xs"
                                disabled={isLoading}
                                onClick={() => handleStatusUpdate(req.id, "REJECTED")}
                                className="text-[10px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md"
                              >
                                Batalkan
                              </Button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                                <XCircle className="size-3" /> Ditolak
                              </span>
                              <Button
                                variant="ghost"
                                size="xs"
                                disabled={isLoading}
                                onClick={() => handleStatusUpdate(req.id, "APPROVED")}
                                className="text-[10px] text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md"
                              >
                                Ubah Setuju
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center py-8">
                    <div className="flex flex-col items-center justify-center space-y-1.5 text-slate-400 dark:text-zinc-500">
                      <AlertCircle className="size-6 text-slate-300 dark:text-zinc-600" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Tidak ada pengajuan izin yang sesuai filter
                      </p>
                      <p className="text-[11px]">
                        Ubah kata kunci pencarian atau kategori filter di atas.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="px-4 py-3 bg-slate-50/70 dark:bg-zinc-800/40 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-zinc-400">
          <p>
            Menampilkan <span className="font-semibold text-slate-900 dark:text-white">
              {filteredRequests.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredRequests.length)}
            </span> dari <span className="font-semibold text-slate-900 dark:text-white">{filteredRequests.length}</span> pengajuan
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 text-xs rounded-lg gap-1 border-slate-200 dark:border-zinc-700 cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
              <span>Sebelumnya</span>
            </Button>

            <span className="px-3 py-1 font-medium text-slate-700 dark:text-zinc-300">
              Halaman {currentPage} dari {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 text-xs rounded-lg gap-1 border-slate-200 dark:border-zinc-700 cursor-pointer disabled:opacity-40"
            >
              <span>Berikutnya</span>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Pratinjau Lampiran Bukti */}
      {selectedAttachment && (
        <Dialog
          open={!!selectedAttachment}
          onOpenChange={(open) => !open && setSelectedAttachment(null)}
        >
          <DialogContent className="max-w-md sm:max-w-lg w-[95vw] p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <DialogHeader className="pb-2 border-b border-slate-200 dark:border-zinc-800">
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="size-4 text-slate-700 dark:text-zinc-300" />
                <span>Pratinjau Lampiran Bukti</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-1">
              <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedAttachment.studentName}</p>
                  <p className="text-slate-500 dark:text-zinc-400">{selectedAttachment.classId || "Siswa"}</p>
                </div>
                <div>{getStatusBadge(selectedAttachment.status)}</div>
              </div>

              <div className="relative rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden bg-black/5 flex items-center justify-center min-h-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedAttachment.url}
                  alt="Bukti Lampiran Siswa"
                  className="max-h-80 w-full object-contain rounded-lg"
                />
              </div>

              <div className="text-xs text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800">
                <p className="font-semibold text-slate-900 dark:text-white mb-0.5">Alasan Terkait:</p>
                <p className="italic">&ldquo;{selectedAttachment.reason}&rdquo;</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAttachment(null)}
                  className="rounded-xl text-xs border-slate-200 dark:border-zinc-700 cursor-pointer"
                >
                  Tutup
                </Button>
                {selectedAttachment.status !== "REJECTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={loadingId === selectedAttachment.id}
                    onClick={() => handleStatusUpdate(selectedAttachment.id, "REJECTED")}
                    className="border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs gap-1 cursor-pointer"
                  >
                    <X className="size-3.5" />
                    <span>Tolak Izin</span>
                  </Button>
                )}
                {selectedAttachment.status !== "APPROVED" && (
                  <Button
                    size="sm"
                    disabled={loadingId === selectedAttachment.id}
                    onClick={() => handleStatusUpdate(selectedAttachment.id, "APPROVED")}
                    className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl text-xs gap-1 cursor-pointer font-medium"
                  >
                    <Check className="size-3.5" />
                    <span>Setujui Izin</span>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
