"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? "light" : "dark";

    if (
      typeof document === "undefined" ||
      !("startViewTransition" in document) ||
      typeof document.startViewTransition !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);

      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath,
        },
        {
          duration: 600,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  const transitionClass = mounted
    ? "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
    : "transition-none";

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={toggleTheme}
      className="relative size-9 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-2xs hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 transition-all duration-300 flex items-center justify-center overflow-hidden active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500/50"
      title={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      aria-label="Ubah mode tema"
    >
      {/* Ambient Halo Behind Icons */}
      <span
        aria-hidden="true"
        className={`absolute inset-1 rounded-lg transition-all duration-500 ease-out pointer-events-none ${
          isDark
            ? "bg-indigo-500/15 scale-100 opacity-100"
            : "bg-amber-400/15 scale-100 opacity-100"
        }`}
      />

      <div className="relative size-5 flex items-center justify-center pointer-events-none">
        {/* Sisi Terang: Matahari */}
        <Sun
          className={`size-4.5 text-amber-500 absolute ${transitionClass} ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]"
          }`}
        />

        {/* Sisi Gelap: Bulan */}
        <Moon
          className={`size-4.5 text-indigo-400 dark:text-indigo-300 absolute ${transitionClass} ${
            isDark
              ? "rotate-0 scale-100 opacity-100 drop-shadow-[0_0_6px_rgba(129,140,248,0.5)]"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
