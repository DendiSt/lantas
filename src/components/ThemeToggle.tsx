"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [canAnimate, setCanAnimate] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setCanAnimate(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const isDark = mounted ? (resolvedTheme === "dark" || theme === "dark") : false;

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? "light" : "dark";

    // Gunakan View Transitions API jika didukung oleh browser untuk transisi layar yang mulus
    const doc = typeof document !== "undefined" ? (document as any) : null;
    if (!doc?.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

    const transition = doc.startViewTransition(() => {
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
          duration: 450,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="size-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-300 relative overflow-hidden active:scale-90 cursor-pointer"
      title={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      aria-label="Ubah mode tema"
    >
      <div className="theme-flip-container size-5 flex items-center justify-center">
        <div className={`theme-flip-inner ${canAnimate ? "can-animate" : ""} ${isDark ? "is-dark" : ""}`}>
          {/* Sisi Depan: Matahari (Light Mode) */}
          <div className="theme-flip-front">
            <Sun className="size-4.5 text-amber-500 drop-shadow-xs" />
          </div>

          {/* Sisi Belakang: Bulan (Dark Mode) */}
          <div className="theme-flip-back">
            <Moon className="size-4.5 text-indigo-400 drop-shadow-xs" />
          </div>
        </div>
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
