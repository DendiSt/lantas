"use client";

import { useState } from "react";
import { RequestCard } from "./RequestCard";
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";

interface RequestItem {
  id: string;
  type: string;
  reason: string;
  attachmentUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionNote: string | null;
  createdAt: Date;
  qrToken?: string | null;
  scannedAt?: Date | null;
  security?: { name: string } | null;
}

interface RequestHistoryListProps {
  requests: RequestItem[];
  studentId: string;
  studentName: string;
}

export function RequestHistoryList({ requests, studentId, studentName }: RequestHistoryListProps) {
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PROCESSED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleFilterChange = (newFilter: "ALL" | "PENDING" | "PROCESSED") => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset page on filter change
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "PENDING") return req.status === "PENDING";
    if (filter === "PROCESSED") return req.status === "APPROVED" || req.status === "REJECTED";
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3.5">
      {/* Header Riwayat & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Riwayat Pengajuan Izin</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 font-semibold text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
            {requests.length}
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-xs font-medium border border-slate-200/80 dark:border-zinc-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleFilterChange("ALL")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === "ALL"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("PENDING")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === "PENDING"
                ? "bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-300 shadow-xs font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <span>Menunggu</span>
            {pendingCount > 0 && (
              <span className="size-1.5 rounded-full bg-amber-500 inline-block" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange("PROCESSED")}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === "PROCESSED"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {/* List Kartu Riwayat */}
      {paginatedRequests.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {paginatedRequests.map((request) => (
              <RequestCard 
                key={request.id} 
                request={request} 
                studentId={studentId}
                studentName={studentName}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRequests.length)} dari {filteredRequests.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-xs font-medium px-2 text-slate-700 dark:text-zinc-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 rounded-2xl border border-dashed border-border bg-card/50 text-center flex flex-col items-center justify-center space-y-2.5 my-4">
          <div className="p-3 rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-6 text-muted-foreground/70" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {filter === "ALL"
                ? "Belum ada pengajuan izin"
                : filter === "PENDING"
                ? "Tidak ada izin yang sedang menunggu"
                : "Belum ada riwayat izin yang selesai"}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {filter === "ALL"
                ? "Gunakan tombol '+ Ajukan Izin Baru' di atas untuk membuat perizinan pertama Anda."
                : "Semua pengajuan pada kategori ini sudah diperbarui."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
