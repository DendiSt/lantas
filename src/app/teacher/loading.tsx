import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherLoading() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-slate-200 dark:bg-zinc-800" />
        <Skeleton className="h-4 w-96 bg-slate-200 dark:bg-zinc-800" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-zinc-800" />
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-[400px] rounded-3xl bg-slate-200 dark:bg-zinc-800" />
          <Skeleton className="h-[300px] rounded-3xl bg-slate-200 dark:bg-zinc-800" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[250px] rounded-3xl bg-slate-200 dark:bg-zinc-800" />
          <Skeleton className="h-[400px] rounded-3xl bg-slate-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}
