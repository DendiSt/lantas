import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Skeleton Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs shrink-0 w-full">
        <div>
          <Skeleton className="h-6 w-36 rounded-md mb-2" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
      </header>

      {/* Skeleton Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs h-32 space-y-3">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="size-9 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md mb-3" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
          ))}
        </div>

        {/* Additional Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 h-28 space-y-3">
              <Skeleton className="h-4 w-24 rounded-md mb-4" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-[360px] bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
              <Skeleton className="h-4 w-32 rounded-md mb-6" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ))}
        </div>

        <div className="h-[340px] bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
          <Skeleton className="h-4 w-48 rounded-md mb-6" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}
