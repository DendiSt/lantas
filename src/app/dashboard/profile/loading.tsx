import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function StudentProfileLoading() {
  return (
    <div className="pb-24 max-w-lg mx-auto">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="px-4 py-4 sm:px-6 flex items-center gap-3">
          <div className="p-2 -ml-2 rounded-xl text-slate-400">
            <ArrowLeft className="size-5" />
          </div>
          <Skeleton className="h-7 w-36 rounded-lg" />
        </div>
      </header>

      <main className="p-4 sm:p-6 space-y-6">
        {/* Avatar Upload Skeleton */}
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-xs">
          <Skeleton className="size-28 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>

        {/* Form Fields Skeleton */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-xs">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl mt-4" />
        </div>
      </main>
    </div>
  );
}
