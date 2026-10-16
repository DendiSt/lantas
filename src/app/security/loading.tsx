import { Skeleton } from "@/components/ui/skeleton";

export default function SecurityLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-3 w-20 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </header>

      {/* Main Skeleton */}
      <main className="flex-1 px-4 py-8 max-w-md w-full mx-auto flex flex-col items-center space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-36 rounded-md" />
        </div>

        {/* QR Scanner Card Skeleton */}
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
          {/* Camera Viewfinder Skeleton */}
          <div className="w-full aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
            <Skeleton className="size-20 rounded-2xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}
