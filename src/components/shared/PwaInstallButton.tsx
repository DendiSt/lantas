"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PwaInstallButton({ className = "" }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if already caught by global script
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    
    const handleReady = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        setIsInstallable(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("deferredpromptready", handleReady);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("deferredpromptready", handleReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  if (!isInstallable || isInstalled) {
    return null; // Don't show button if not installable or already installed
  }

  return (
    <button
      onClick={handleInstallClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full shadow-md shadow-indigo-200/50 dark:shadow-none transition-all active:scale-95 ${className}`}
    >
      <Download className="size-4" />
      <span>Install Aplikasi</span>
    </button>
  );
}

// ============================================================
// Banner versi besar — untuk di atas greeting card siswa
// ============================================================
export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Cek sudah di-dismiss sebelumnya di sesi ini
    if (sessionStorage.getItem("pwa_banner_dismissed") === "1") {
      setIsDismissed(true);
    }

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt);
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleReady = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt);
        setIsInstallable(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("deferredpromptready", handleReady);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("deferredpromptready", handleReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("pwa_banner_dismissed", "1");
  };

  if (!isInstallable || isInstalled || isDismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-700 dark:to-violet-700 rounded-2xl p-4 sm:p-5 shadow-lg shadow-indigo-200/40 dark:shadow-none overflow-hidden">
      {/* Dekorasi latar */}
      <div className="absolute -top-6 -right-6 size-24 rounded-full bg-white/10 blur-xl" />
      <div className="absolute -bottom-4 -left-4 size-16 rounded-full bg-white/10 blur-lg" />

      <div className="relative flex items-center gap-4">
        {/* Ikon */}
        <div className="size-11 sm:size-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
          <Download className="size-5 sm:size-6 text-white" />
        </div>

        {/* Teks */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
            Install LANTAS di HP Kamu
          </h3>
          <p className="text-[11px] sm:text-xs text-indigo-100 mt-0.5 leading-relaxed">
            Akses lebih cepat tanpa buka browser. Langsung dari layar utama!
          </p>
        </div>

        {/* Tombol Install */}
        <button
          onClick={handleInstallClick}
          className="shrink-0 px-4 py-2 bg-white text-indigo-700 text-xs sm:text-sm font-bold rounded-xl hover:bg-indigo-50 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          Install
        </button>
      </div>

      {/* Tombol Tutup (X) */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 size-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
        aria-label="Tutup"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

