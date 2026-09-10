import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { 
  Printer, 
  QrCode, 
  Clock, 
  Download, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Share2, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PrintAndShareScreen() {
  const { 
    finalRenderedPhoto, 
    softfileInfo, 
    eventSettings, 
    isPrinting, 
    handleTriggerPrint, 
    resetToAttract,
    setViewingSoftfileId
  } = useBooth();

  const [autoResetSeconds, setAutoResetSeconds] = useState(eventSettings.autoResetDelaySec || 45);

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti not available', e);
    }

    // Auto trigger initial print
    handleTriggerPrint();
  }, []);

  // Auto reset countdown timer to return to start screen
  useEffect(() => {
    const timer = setInterval(() => {
      setAutoResetSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          resetToAttract();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resetToAttract]);

  return (
    <div className="w-full h-screen flex flex-col justify-between items-center p-6 bg-slate-950 text-white select-none overflow-y-auto">
      {/* Top Banner */}
      <div className="w-full max-w-5xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              FOTO KAMU SIAP DICETAK & DIUNDUH!
            </h2>
            <p className="text-slate-400 text-sm">Ambil cetakan fisik di bawah printer dan scan QR untuk softfile.</p>
          </div>
        </div>

        {/* Auto Reset Timer Badge */}
        <button
          onClick={resetToAttract}
          className="px-4 py-2 rounded-2xl glass-card hover:bg-white/10 text-slate-300 flex items-center gap-2 text-xs font-mono-tech transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Kembali ke Awal ({autoResetSeconds}s)</span>
        </button>
      </div>

      {/* Main Content: Left Frame Preview & Right QR Download Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 my-auto items-center py-4">
        
        {/* Left: Rendered Strip Showcase with Print Animation */}
        <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl">
          <div className="relative max-h-[58vh] overflow-hidden rounded-xl shadow-2xl border-4 border-white/20">
            {finalRenderedPhoto ? (
              <img 
                src={finalRenderedPhoto} 
                alt="Rendered Photo Strip" 
                className="max-h-[55vh] w-auto object-contain rounded-lg"
              />
            ) : (
              <div className="w-48 h-96 bg-slate-800 animate-pulse rounded-lg" />
            )}

            {/* Printing Progress Overlay */}
            {isPrinting && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                <Printer className="w-12 h-12 text-blue-400 animate-bounce mb-3" />
                <h4 className="font-display font-bold text-lg text-white">Sedang Mencetak...</h4>
                <p className="text-xs text-slate-300 mt-1">Mengirim data ke {eventSettings.printerName}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleTriggerPrint}
              disabled={isPrinting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Mencetak...' : 'Cetak Ulang (Print Again)'}</span>
            </button>
          </div>
        </div>

        {/* Right: Big QR Code Softfile Download */}
        <div className="flex flex-col items-center text-center p-6 rounded-3xl glass-panel border border-purple-500/30 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            <QrCode className="w-3.5 h-3.5" />
            <span>UNDUH SOFTFILE INSTAN</span>
          </div>

          <h3 className="font-display text-xl font-bold text-white mb-1">
            Scan QR Code dengan Kamera HP
          </h3>
          <p className="text-slate-400 text-xs mb-4">
            Buka kamera smartphone kamu dan arahkan ke kode QR di bawah untuk mengunduh softfile foto HD.
          </p>

          {/* QR Code Frame */}
          <div className="p-3 bg-white rounded-2xl shadow-xl border-4 border-purple-500/40">
            {softfileInfo?.qrDataUrl ? (
              <img 
                src={softfileInfo.qrDataUrl} 
                alt="Scan to Download Softfile" 
                className="w-56 h-56 object-contain"
              />
            ) : (
              <div className="w-56 h-56 bg-slate-200 animate-pulse rounded-xl" />
            )}
          </div>

          {/* 1-Hour Expiry Alert Badge (Rule 10) */}
          <div className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 text-amber-300 text-xs font-medium">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Softfile foto <strong>hanya tersimpan 1 jam</strong> di sistem sebelum otomatis terhapus.
            </span>
          </div>

          {/* Simulated Direct Preview Link */}
          {softfileInfo?.id && (
            <button
              onClick={() => setViewingSoftfileId(softfileInfo.id)}
              className="mt-4 text-xs text-purple-400 hover:text-purple-300 underline flex items-center gap-1 font-mono-tech"
            >
              <span>Uji tampilan unduhan tamu (Preview Softfile Page)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Bottom Completion Action */}
      <div className="w-full max-w-5xl flex justify-center items-center pt-2 border-t border-slate-800/80">
        <button
          onClick={resetToAttract}
          className="px-10 py-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-display font-bold text-lg shadow-xl shadow-teal-600/30 flex items-center gap-3 transition-transform transform active:scale-95"
        >
          <CheckCircle2 className="w-6 h-6" />
          <span>Selesai & Kembali ke Halaman Utama</span>
        </button>
      </div>
    </div>
  );
}
