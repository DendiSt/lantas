"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getScanDetails, confirmStudentExit } from "@/app/actions/requests";
import { Loader2, ShieldCheck, UserCheck, XCircle } from "lucide-react";
import { toast } from "sonner";

export function QRScanner({ initialHistory = [] }: { initialHistory?: any[] }) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<any[]>(initialHistory);
  const [isPending, startTransition] = useTransition();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanDialogOpen = useRef(false);

  useEffect(() => {
    isScanDialogOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    let html5QrCode: Html5Qrcode;
    let isMounted = true;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" }, // Prefer back camera
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText, decodedResult) => {
            if (isMounted) onScanSuccess(decodedText, decodedResult);
          },
          (errorMessage) => {
            // ignore scan failures
          }
        );
      } catch (err) {
        console.error("Failed to start scanner:", err);
      }
    };

    // Timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanner();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        }).catch(err => console.error("Stop failed", err));
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScanSuccess = (decodedText: string, decodedResult: any) => {
    // Prevent scanning if already processing one
    if (isScanDialogOpen.current) return;

    setScanResult(decodedText);
    setIsOpen(true);
    fetchDetails(decodedText);
  };

  const fetchDetails = async (token: string) => {
    setErrorMsg(null);
    setRequestDetails(null);
    
    const res = await getScanDetails(token);
    if (res.success) {
      setRequestDetails(res.data);
    } else {
      setErrorMsg(res.error || "Gagal mengambil data");
    }
  };

  const handleConfirm = () => {
    if (!scanResult) return;
    
    startTransition(async () => {
      const res = await confirmStudentExit(scanResult);
      if (res.success) {
        toast.success(res.message);
        setHistory((prev) => [{...requestDetails, scannedAt: new Date()}, ...prev]);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Gagal memproses konfirmasi");
      }
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setScanResult(null);
    setRequestDetails(null);
    setErrorMsg(null);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full">
      <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden relative">
        <h2 className="text-center font-bold text-slate-800 mb-4 text-sm">Arahkan Kamera ke QR Code Siswa</h2>
        <div id="qr-reader" className="w-full rounded-2xl overflow-hidden [&>video]:object-cover" />
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-md w-[90vw] rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-slate-900 dark:text-white">
              Hasil Scan QR Code
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 flex flex-col items-center justify-center">
            {!requestDetails && !errorMsg && (
              <div className="flex flex-col items-center justify-center space-y-2 text-slate-500">
                <Loader2 className="size-8 animate-spin text-indigo-600" />
                <p className="text-sm">Memeriksa data ke server...</p>
              </div>
            )}

            {errorMsg && (
              <div className="flex flex-col items-center justify-center space-y-3 text-center">
                <div className="size-16 rounded-full bg-rose-100 flex items-center justify-center">
                  <XCircle className="size-8 text-rose-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">Akses Ditolak</p>
                  <p className="text-rose-600 text-sm mt-1">{errorMsg}</p>
                </div>
              </div>
            )}

            {requestDetails && (
              <div className="w-full space-y-4 text-left">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-4 flex items-start gap-3">
                  <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/80 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-emerald-50 text-lg leading-tight">Izin Valid!</h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">Siswa ini diizinkan untuk meninggalkan area sekolah.</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-xl p-4 border border-slate-100 dark:border-zinc-700/50 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">Nama Siswa</p>
                    <p className="font-bold text-slate-900 dark:text-white">{requestDetails.student.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">Kelas</p>
                      <p className="font-medium text-slate-800 dark:text-zinc-200">{requestDetails.student.class?.name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">Tipe Izin</p>
                      <p className="font-medium text-slate-800 dark:text-zinc-200">{requestDetails.type.replace("IZIN_", "")}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-zinc-400 tracking-wider">Alasan</p>
                    <p className="font-medium text-slate-800 dark:text-zinc-200 text-sm line-clamp-2">&ldquo;{requestDetails.reason}&rdquo;</p>
                  </div>
                </div>

                {requestDetails.attachmentUrl && (
                  <a href={requestDetails.attachmentUrl} target="_blank" rel="noreferrer" className="block w-full text-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                    Lihat Bukti Lampiran (Opsional)
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 dark:text-white" onClick={handleClose}>
              Batal
            </Button>
            {requestDetails && !errorMsg && (
              <Button type="button" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleConfirm} disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin mr-2" /> : <UserCheck className="size-4 mr-2" />}
                Konfirmasi
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* HISTORY SECTION */}
      <div className="w-full mt-8 space-y-4">
        <h3 className="font-bold text-slate-400 border-b border-slate-800 pb-2 flex justify-between items-center">
          <span>Riwayat Scan Hari Ini</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md">{history.length} Siswa</span>
        </h3>
        
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white">{item.student?.name}</p>
                    <p className="text-xs text-slate-400">{item.student?.class?.name || "-"}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold px-2 py-1 rounded-md flex items-center gap-1">
                    <ShieldCheck className="size-3" /> Selesai
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  <p><strong>Izin:</strong> {item.type.replace("IZIN_", "")}</p>
                  <p className="line-clamp-1"><strong>Alasan:</strong> {item.reason}</p>
                  <p className="text-[10px] mt-2 text-slate-500">
                    Waktu Keluar: {new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(item.scannedAt))} WIB
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <UserCheck className="size-8 text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">Belum ada riwayat siswa keluar hari ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
