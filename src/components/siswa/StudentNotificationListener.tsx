"use client";

import { useEffect, useRef } from "react";
import { checkStudentRequestUpdates } from "@/app/actions/notifications";
import { toast } from "sonner";
import { Bell, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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

export function StudentNotificationListener() {
  const router = useRouter();
  const lastCheckedRef = useRef<Date>(new Date());

  useEffect(() => {
    // Polling interval in ms (e.g., 15 seconds)
    const interval = setInterval(async () => {
      const now = new Date();
      const result = await checkStudentRequestUpdates(lastCheckedRef.current);
      
      if (result && result.success && result.data && result.data.length > 0) {
        lastCheckedRef.current = now;
        
        playNotificationSound();
        
        result.data.forEach((req) => {
          const isApproved = req.status === "APPROVED";
          toast.message(`Pengajuan Izin ${isApproved ? "Disetujui" : "Ditolak"}`, {
            description: `Pengajuan ${req.type.replace("IZIN_", "").replace("_", " ")} Anda telah ${isApproved ? "disetujui" : "ditolak"}.`,
            icon: isApproved ? <CheckCircle2 className="size-4 text-emerald-500" /> : <XCircle className="size-4 text-rose-500" />,
            duration: 6000,
            action: {
              label: "Lihat",
              onClick: () => {
                // Refresh data via Next.js router so the status updates immediately
                router.refresh();
                
                setTimeout(() => {
                  const element = document.getElementById('history-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.reload();
                  }
                }, 100);
              },
            }
          });
        });
      }
    }, 15000); // 15 seconds for student to reduce load

    return () => clearInterval(interval);
  }, []);

  return null;
}
