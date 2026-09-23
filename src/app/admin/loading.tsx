import { LayoutDashboard } from "lucide-react";

export default function AdminLoading() {
  return (
    <>
        {/* Skeleton Header */}
        <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 lg:px-8 py-4 lg:py-0 lg:h-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutDashboard className="size-5 text-slate-400 dark:text-zinc-500 animate-pulse" /> 
                <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md animate-pulse"></div>
              </h1>
            </div>
            <div className="h-4 w-64 bg-slate-200 dark:bg-zinc-800 rounded-md animate-pulse mt-2"></div>
          </div>
        </header>

        {/* Skeleton Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs h-32 animate-pulse">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
                  <div className="size-9 bg-slate-200 dark:bg-zinc-800 rounded-xl"></div>
                </div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-zinc-800 rounded-md mb-3"></div>
                <div className="h-3 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
              </div>
            ))}
          </div>

          {/* Additional Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 h-28 animate-pulse">
                <div className="h-4 w-24 bg-slate-200 dark:bg-zinc-800 rounded-md mb-4"></div>
                <div className="h-8 w-16 bg-slate-200 dark:bg-zinc-800 rounded-md"></div>
              </div>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-[350px] bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 animate-pulse">
                <div className="h-4 w-32 bg-slate-200 dark:bg-zinc-800 rounded-md mb-6"></div>
                <div className="h-full w-full bg-slate-100 dark:bg-zinc-800/50 rounded-xl"></div>
              </div>
            ))}
          </div>
        </main>
    </>
  );
}
