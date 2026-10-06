"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useCallback, type ReactNode } from "react";
import { ArrowDown, Loader2 } from "lucide-react";

interface PullToRefreshProps {
  children: ReactNode;
  threshold?: number;
}

export function PullToRefresh({ children, threshold = 80 }: PullToRefreshProps) {
  const router = useRouter();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Hanya aktif jika di posisi paling atas halaman
    if (window.scrollY === 0 && !isRefreshing) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const deltaY = e.touches[0].clientY - touchStartY.current;

    if (deltaY > 0 && window.scrollY === 0) {
      // Efek "resistance" — makin jauh ditarik, makin berat
      const distance = Math.min(deltaY * 0.5, threshold * 1.8);
      setPullDistance(distance);
    } else {
      isPulling.current = false;
      setPullDistance(0);
    }
  }, [isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;

    if (pullDistance >= threshold) {
      // Trigger refresh
      setIsRefreshing(true);
      setPullDistance(threshold * 0.5); // Tetap tampilkan spinner

      router.refresh();

      // Tunggu sebentar agar data Server Components ter-revalidate
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setIsRefreshing(false);
      setPullDistance(0);
    } else {
      // Snap back
      setPullDistance(0);
    }
  }, [pullDistance, threshold, isRefreshing, router]);

  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 180; // Ikon berputar saat ditarik

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Indikator Pull-to-Refresh */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center z-50 pointer-events-none transition-opacity duration-200"
        style={{
          top: 0,
          height: `${pullDistance}px`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div
          className="size-9 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-slate-200 dark:border-zinc-700 flex items-center justify-center transition-transform duration-150"
          style={{
            transform: `translateY(${Math.max(0, pullDistance - 36)}px)`,
          }}
        >
          {isRefreshing ? (
            <Loader2 className="size-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
          ) : (
            <ArrowDown
              className="size-4 text-slate-600 dark:text-zinc-300 transition-transform duration-200"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          )}
        </div>
      </div>

      {/* Konten halaman — geser ke bawah saat ditarik */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : "none",
          transitionDuration: isPulling.current ? "0ms" : "300ms",
        }}
      >
        {children}
      </div>
    </div>
  );
}
