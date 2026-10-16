import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function StudentHistoryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 pb-24 md:pb-8">
        {/* Header Skeleton */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 -ml-2 rounded-full text-slate-400">
              <ArrowLeft className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-xl" />
              <Skeleton className="h-7 w-40 rounded-lg" />
            </div>
          </div>
          <Skeleton className="size-9 rounded-xl" />
        </header>

        {/* Filter Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* History List Skeleton */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3 shadow-xs">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
