import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRequestsLoading() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
        <div>
          <Skeleton className="h-6 w-48 rounded-md mb-2" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Quick Filter Badges Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-xl shrink-0" />
          ))}
        </div>

        <TableSkeleton rowCount={5} columnCount={6} showHeaderSearch={true} />
      </main>
    </div>
  );
}
