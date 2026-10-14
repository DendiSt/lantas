import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 3, className }: CardSkeletonProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4 ${className || ""}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="size-9 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
