import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export default function AdminReportsLoading() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs shrink-0 w-full">
        <div>
          <Skeleton className="h-6 w-40 rounded-md mb-2" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="space-y-6">
          {/* Trend Chart Card Skeleton */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="h-4 w-60 rounded-md" />
            </div>
            <div className="h-64 w-full bg-slate-50 dark:bg-zinc-800/40 rounded-xl flex items-center justify-center">
              <Skeleton className="h-48 w-[90%] rounded-lg" />
            </div>
          </div>

          {/* Student Absence Table Card Skeleton */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="size-5 rounded-md" />
              <Skeleton className="h-4 w-52 rounded-md" />
            </div>
            <TableSkeleton rowCount={6} columnCount={5} showHeaderSearch={true} />
          </div>
        </div>
      </main>
    </div>
  );
}

