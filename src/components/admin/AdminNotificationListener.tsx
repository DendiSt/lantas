"use client";

import { useEffect, useRef } from "react";
import { checkNewAdminRequests } from "@/app/actions/notifications";
import { toast } from "sonner";
import { Bell } from "lucide-react";

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Nice pleasant ping sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export function AdminNotificationListener() {
  const lastCheckedRef = useRef<Date>(new Date());

  useEffect(() => {
    // Polling interval in ms (e.g., 10 seconds)
    const interval = setInterval(async () => {
      const now = new Date();
      const result = await checkNewAdminRequests(lastCheckedRef.current);
      
      if (result && result.success && result.data && result.data.length > 0) {
        // Update lastChecked BEFORE showing toasts so we don't repeat
        lastCheckedRef.current = now;
        
        // Play sound once for the batch
        playNotificationSound();
        
        // Show toasts
        result.data.forEach((req) => {
          toast.message("Pengajuan Izin Baru Masuk!", {
            description: `${req.student.name} (${req.student.class?.name || "-"}) - ${req.type.replace("IZIN_", "").replace("_", " ")}`,
            icon: <Bell className="size-4 text-amber-500" />,
            duration: 5000,
            action: {
              label: "Lihat",
              onClick: () => window.location.href = "/admin/requests",
            }
          });
        });
      }
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything visibly
}
