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
  ExternalLink,
  Check,
  AlertTriangle
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
    setViewingSoftfileId,
    printerStatus
  } = useBooth();

  const initialDelay = (!eventSettings.autoResetDelaySec || eventSettings.autoResetDelaySec === 45) 
    ? 90 
    : eventSettings.autoResetDelaySec;
  const [autoResetSeconds, setAutoResetSeconds] = useState(initialDelay);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0) {
      return `${m}m ${s < 10 ? '0' : ''}${s}s`;
    }
    return `${s}s`;
  };

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#3b82f6', '#fde047', '#fda4af', '#a7f3d0', '#c084fc']
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

  const isLowPaper = (printerStatus?.paperRemaining ?? 400) <= 20;

  return (
    <div className="relative w-full h-screen flex flex-col justify-between items-center p-6 md:p-8 bg-grid-notebook text-slate-900 overflow-hidden select-none">
      
      {/* ================= BACKGROUND STICKER ORNAMENTS ================= */}
      {/* 1. Sparkle Star Kuning (Kiri Atas) */}
      <div className="absolute top-8 left-6 sm:left-10 z-0 pointer-events-none animate-float opacity-80">
        <svg className="w-9 h-9 sm:w-11 sm:h-11 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#1e2336" transform="translate(4, 5)" />
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#fef08a" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 2. Daisy Smiley Flower (Kanan Atas) */}
      <div className="absolute top-8 right-6 sm:right-10 z-0 pointer-events-none animate-float-reverse opacity-80">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 overflow-visible" viewBox="0 0 100 100" fill="none">
          <circle cx="54" cy="54" r="38" fill="#1e2336" />
          <circle cx="50" cy="50" r="38" fill="#fef08a" stroke="#1e2336" strokeWidth="6" />
          <circle cx="50" cy="50" r="20" fill="#e9d5ff" stroke="#1e2336" strokeWidth="5" />
          <circle cx="43" cy="46" r="3" fill="#1e2336" />
          <circle cx="57" cy="46" r="3" fill="#1e2336" />
          <path d="M 42 54 C 45 60 55 60 58 54" stroke="#1e2336" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* 3. 3D Heart Sticker (Kiri Bawah) */}
      <div className="absolute bottom-16 left-6 sm:left-10 z-0 pointer-events-none animate-float-reverse opacity-80">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#1e2336" transform="translate(4, 5) rotate(-12 50 50)" />
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#fda4af" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" transform="rotate(-12 50 50)" />
        </svg>
      </div>

      {/* 4. 3D Lightning Bolt (Kanan Bawah) */}
      <div className="absolute bottom-16 right-8 sm:right-12 z-0 pointer-events-none animate-float opacity-80">
        <svg className="w-9 h-11 sm:w-11 sm:h-14 overflow-visible" viewBox="0 0 100 120" fill="none">
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#1e2336" transform="translate(4, 4) rotate(8 50 60)" />
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#fde047" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" transform="rotate(8 50 60)" />
        </svg>
      </div>

      {/* ================= TOP HEADER ================= */}
      <div className="w-full max-w-5xl flex justify-between items-center z-20">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#272a33] text-white shadow-md">
            <CheckCircle2 className="w-6 h-6 text-[#a7f3d0]" />
          </div>
          <div>
            <h2 
              className="text-2xl md:text-3xl font-black text-[#343a59] leading-tight tracking-tight uppercase"
              style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Fredoka', sans-serif" }}
            >
              FOTO KAMU SIAP DICETAK & DIUNDUH!
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Ambil cetakan fisik di printer dan scan QR code di samping untuk softfile
            </p>
          </div>
        </div>

        {/* Auto Reset Timer Badge, Low Paper Warning, & Page Badge */}
        <div className="flex items-center gap-2.5">
          {/* Low Paper Warning for Crew */}
          {isLowPaper && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-mono-tech shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Sisa Kertas: {printerStatus?.paperRemaining ?? 0} lbr</span>
            </div>
          )}

          <div className="px-4 py-2 rounded-full bg-white text-[#272a33] border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] flex items-center gap-2 text-xs font-bold font-mono-tech whitespace-nowrap shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="whitespace-nowrap">Sisa Waktu: {autoResetSeconds}s</span>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#272a33] text-white shadow-md shrink-0">
            <span className="text-sm font-bold tracking-wide font-display pl-1">Page</span>
            <div className="flex items-center justify-center bg-white text-[#272a33] font-black text-xs px-2.5 py-0.5 rounded-full font-mono-tech">
              06
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT (2 COLUMNS) ================= */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 my-auto items-center py-2 z-10">
        
        {/* Left Column: Photo Strip Preview & Print Status */}
        <div className="relative flex flex-col items-center justify-center p-5 rounded-3xl bg-white border-3 border-[#272a33] shadow-[8px_8px_0px_#272a33]">
          <div className="relative max-h-[50vh] overflow-hidden rounded-2xl shadow-md border-2 border-[#272a33] bg-slate-100 flex items-center justify-center p-1">
            {finalRenderedPhoto ? (
              <img 
                src={finalRenderedPhoto} 
                alt="Rendered Photo Strip" 
                className="max-h-[47vh] w-auto object-contain rounded-xl"
              />
            ) : (
              <div className="w-48 h-80 bg-slate-200 animate-pulse rounded-xl" />
            )}

            {/* Printing Progress Overlay */}
            {isPrinting && (
              <div className="absolute inset-0 bg-[#272a33]/92 rounded-2xl backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center z-20">
                <Printer className="w-9 h-9 text-amber-300 animate-bounce mb-1.5" />
                <div className="flex flex-col items-center justify-center">
                  <span 
                    className="font-black text-[11px] text-amber-300 uppercase tracking-widest leading-tight"
                    style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
                  >
                    SEDANG
                  </span>
                  <span 
                    className="font-black text-xs text-white uppercase tracking-wider mt-0.5 leading-tight"
                    style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
                  >
                    MENCETAK...
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 mt-1.5 font-mono-tech px-1 leading-tight text-center">
                  Mengirim data foto ke {eventSettings.printerName}
                </p>
              </div>
            )}
          </div>

          {/* Print Again Button */}
          <div className="mt-3.5 flex gap-3">
            <button
              onClick={handleTriggerPrint}
              disabled={isPrinting}
              className="px-6 py-2.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#fde047] font-bold text-xs flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>{isPrinting ? 'Mencetak...' : 'Cetak Ulang (Print Again)'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: QR Code Softfile Download */}
        <div className="flex flex-col items-center text-center p-5 rounded-3xl bg-white border-3 border-[#272a33] shadow-[8px_8px_0px_#272a33]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e4ecfc] text-[#272a33] border border-[#272a33] text-xs font-bold font-mono-tech mb-2">
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {softfileInfo?.isPublicCloud 
                ? '🌐 ONLINE 4G/5G AKTIF' 
                : 'UNDUH SOFTFILE INSTAN'}
            </span>
          </div>

          <h3 
            className="text-lg sm:text-xl font-black text-[#343a59] mb-1 uppercase tracking-tight"
            style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
          >
            Scan QR Code dengan Kamera HP
          </h3>
          <p className="text-slate-600 text-xs mb-3 font-medium max-w-sm">
            Scan untuk mengunduh <strong>Paket Lengkap Softfile</strong>: Foto Strip HD, Live Video, GIF Boomerang, & Pose Satuan.
          </p>

          {/* QR Code Frame */}
          <div className="p-3 bg-white rounded-2xl border-3 border-[#272a33] shadow-[4px_4px_0px_#272a33]">
            {softfileInfo?.qrDataUrl ? (
              <img 
                src={softfileInfo.qrDataUrl} 
                alt="Scan to Download Softfile" 
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
              />
            ) : (
              <div className="w-48 h-48 bg-slate-200 animate-pulse rounded-xl" />
            )}
          </div>

          {/* 1-Hour Expiry Alert Badge */}
          <div className="mt-3 w-full py-2 px-3.5 rounded-xl bg-[#fef08a] border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] flex items-center justify-center gap-2 text-[#272a33] text-xs font-bold font-mono-tech">
            <Clock className="w-4 h-4 text-[#272a33] shrink-0" />
            <span>
              Softfile foto <strong>tersimpan 1 jam</strong> di sistem sebelum otomatis terhapus.
            </span>
          </div>

          {/* Simulated Direct Preview Link */}
          {softfileInfo?.id && (
            <button
              onClick={() => {
                if (softfileInfo.downloadUrl) {
                  window.open(softfileInfo.downloadUrl, '_blank');
                } else {
                  setViewingSoftfileId(softfileInfo.id);
                }
              }}
              className="mt-3 text-xs text-[#272a33] hover:text-blue-600 underline font-bold flex items-center gap-1 font-mono-tech cursor-pointer transition-colors"
            >
              <span>Uji tampilan unduhan tamu (Buka Halaman Tamu)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* ================= BOTTOM COMPLETION ACTION ================= */}
      <div className="w-full max-w-5xl flex justify-center items-center pt-2 border-t-2 border-[#272a33]/20 z-20">
        <button
          onClick={resetToAttract}
          className="px-10 sm:px-14 py-3.5 sm:py-4 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-3 border-[#272a33] shadow-[4px_4px_0px_#22c55e] font-display font-black text-sm sm:text-base tracking-wide flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-[#a7f3d0]" />
          <span>Selesai & Kembali ke Halaman Utama</span>
        </button>
      </div>
    </div>
  );
}
