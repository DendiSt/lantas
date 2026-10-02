"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

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
