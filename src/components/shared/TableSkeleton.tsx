import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  showHeaderSearch?: boolean;
}

export function TableSkeleton({
  rowCount = 5,
  columnCount = 5,
  showHeaderSearch = true,
}: TableSkeletonProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs overflow-hidden">
      {showHeaderSearch && (
        <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-64 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl hidden sm:block" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
              {Array.from({ length: columnCount }).map((_, idx) => (
                <th key={idx} className="p-4 font-medium">
                  <Skeleton className="h-4 w-20 rounded-md" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {Array.from({ length: rowCount }).map((_, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-50/40 dark:hover:bg-zinc-800/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-9 rounded-full shrink-0" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32 rounded-md" />
                      <Skeleton className="h-3 w-20 rounded-md" />
                    </div>
                  </div>
                </td>
                {Array.from({ length: columnCount - 1 }).map((_, cIdx) => (
                  <td key={cIdx} className="p-4">
                    <Skeleton
                      className={`h-4 rounded-md ${
                        cIdx === columnCount - 2
                          ? "w-16 rounded-full h-6"
                          : cIdx % 2 === 0
                          ? "w-28"
                          : "w-20"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
        <Skeleton className="h-4 w-36 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
