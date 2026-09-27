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
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Film,
  Play
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
    printerStatus,
    sessionCopies,
    selectedFrame
  } = useBooth();

  // Active preview tab: 'photo' | 'motion'
  const [activeTab, setActiveTab] = useState('photo');

  const initialDelay = (!eventSettings.autoResetDelaySec || eventSettings.autoResetDelaySec === 45) 
    ? 90 
    : eventSettings.autoResetDelaySec;
  const [autoResetSeconds, setAutoResetSeconds] = useState(initialDelay);

  // Target copies bought before payment
  const targetCopies = Math.max(1, Number(sessionCopies) || Number(eventSettings.defaultPrintCopies) || 2);
  const [hasPrintedCount, setHasPrintedCount] = useState(0);

  const paperRemaining = printerStatus?.paperRemaining ?? 400;
  const isLowPaper = paperRemaining <= 20;

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
  }, []);

  // Auto-trigger printing on mount for the purchased targetCopies
  useEffect(() => {
    if (finalRenderedPhoto && hasPrintedCount === 0) {
      handleTriggerPrint(targetCopies);
      setHasPrintedCount(targetCopies);
    }
  }, [finalRenderedPhoto]);

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

  const handleReprint = (count = 1) => {
    if (count > paperRemaining) {
      alert(`Sisa kertas di printer hanya ${paperRemaining} lembar.`);
      return;
    }

    handleTriggerPrint(count);
    setHasPrintedCount(prev => prev + count);
  };

  // Determine if layout is a vertical strip (show 2 twin strips like BoxOS / 4R cut)
  const isGrid4R = selectedFrame?.isGrid4R || selectedFrame?.gridType === 'grid2x2';
  const motionVideoSrc = softfileInfo?.motionBlobUrl || softfileInfo?.motionUrl;
  const gifSrc = softfileInfo?.gifDataUrl || softfileInfo?.gifUrl;

  return (
    <div className="relative w-full h-screen max-h-screen flex flex-col justify-between items-center p-3 sm:p-4 md:p-5 bg-grid-notebook text-slate-900 overflow-hidden select-none">
      
      {/* ================= BACKGROUND STICKER ORNAMENTS ================= */}
      {/* 1. Sparkle Star Kuning (Kiri Atas) */}
      <div className="absolute top-4 left-4 sm:left-8 z-0 pointer-events-none animate-float opacity-70">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#1e2336" transform="translate(4, 5)" />
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#fef08a" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 2. Daisy Smiley Flower (Kanan Atas) */}
      <div className="absolute top-4 right-4 sm:right-8 z-0 pointer-events-none animate-float-reverse opacity-70">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 overflow-visible" viewBox="0 0 100 100" fill="none">
          <circle cx="54" cy="54" r="38" fill="#1e2336" />
          <circle cx="50" cy="50" r="38" fill="#fef08a" stroke="#1e2336" strokeWidth="6" />
          <circle cx="50" cy="50" r="20" fill="#e9d5ff" stroke="#1e2336" strokeWidth="5" />
          <circle cx="43" cy="46" r="3" fill="#1e2336" />
          <circle cx="57" cy="46" r="3" fill="#1e2336" />
          <path d="M 42 54 C 45 60 55 60 58 54" stroke="#1e2336" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* 3. 3D Heart Sticker (Kiri Bawah) */}
      <div className="absolute bottom-12 left-4 sm:left-8 z-0 pointer-events-none animate-float-reverse opacity-70">
        <svg className="w-8 h-8 sm:w-10 sm:h-10 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#1e2336" transform="translate(4, 5) rotate(-12 50 50)" />
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#fda4af" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" transform="rotate(-12 50 50)" />
        </svg>
      </div>

      {/* 4. 3D Lightning Bolt (Kanan Bawah) */}
      <div className="absolute bottom-12 right-6 sm:right-10 z-0 pointer-events-none animate-float opacity-70">
        <svg className="w-8 h-10 sm:w-9 sm:h-12 overflow-visible" viewBox="0 0 100 120" fill="none">
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#1e2336" transform="translate(4, 4) rotate(8 50 60)" />
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#fde047" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" transform="rotate(8 50 60)" />
        </svg>
      </div>

      {/* ================= TOP HEADER ================= */}
      <div className="w-full max-w-6xl flex justify-between items-center shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-[#272a33] text-white shadow-md">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#a7f3d0]" />
          </div>
          <div>
            <h2 
              className="text-lg sm:text-xl md:text-2xl font-black text-[#343a59] leading-tight tracking-tight uppercase"
              style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Fredoka', sans-serif" }}
            >
              FOTO KAMU SIAP DIAMBIL & DIUNDUH!
            </h2>
            <p className="text-slate-600 text-[11px] sm:text-xs font-medium">
              Ambil hasil cetak fisikmu di tray printer dan scan QR code untuk softfile HD
            </p>
          </div>
        </div>

        {/* Auto Reset Timer Badge, Low Paper Warning, & Page Badge */}
        <div className="flex items-center gap-2">
          {isLowPaper && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-bold font-mono-tech shadow-sm">
              <AlertTriangle className="w-3 h-3 text-amber-600 animate-pulse" />
              <span>Sisa: {paperRemaining} lbr</span>
            </div>
          )}

          <div className="px-3 py-1 sm:py-1.5 rounded-full bg-white text-[#272a33] border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] flex items-center gap-1.5 text-xs font-bold font-mono-tech whitespace-nowrap shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{autoResetSeconds}s</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full bg-[#272a33] text-white shadow-md shrink-0">
            <span className="text-xs font-bold tracking-wide font-display pl-0.5">Page</span>
            <div className="flex items-center justify-center bg-white text-[#272a33] font-black text-[11px] px-1.5 py-0.5 rounded-full font-mono-tech">
              05
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT (BOXOS STYLE LAYOUT) ================= */}
      <div className="w-full max-w-6xl flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch justify-center my-auto py-1 z-10">
        
        {/* ================= LEFT SECTION: LARGE MEDIA PREVIEW (7 COLS) ================= */}
        <div className="md:col-span-7 flex flex-col items-center justify-between text-center p-3.5 sm:p-4 rounded-3xl bg-white border-3 border-[#272a33] shadow-[6px_6px_0px_#272a33] h-full min-h-0">
          
          {/* Card Top Title & Badge */}
          <div className="w-full flex justify-between items-center px-1 shrink-0">
            <div className="flex items-center gap-2">
              <h3 
                className="text-sm sm:text-base font-black text-[#343a59] uppercase tracking-tight"
                style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
              >
                {activeTab === 'photo' ? 'Hasil Foto' : 'Live Motion Video'}
              </h3>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fde047] text-[#272a33] border border-[#272a33] text-[10px] sm:text-[11px] font-bold font-mono-tech">
              <Sparkles className="w-3 h-3 text-[#272a33]" />
              <span>{isGrid4R ? 'FOTO 4R' : `TWIN STRIP (${targetCopies} LEMBAR)`}</span>
            </div>
          </div>

          {/* Center Large Preview Frame */}
          <div className="flex-1 min-h-0 my-2 flex items-center justify-center w-full">
            <div className="relative h-full max-h-[44vh] sm:max-h-[48vh] w-full p-2 sm:p-3 bg-[#faf6ea] border-2 sm:border-3 border-[#272a33] rounded-2xl shadow-[4px_4px_0px_#272a33] flex items-center justify-center overflow-hidden">
              
              {/* TAB 1: FOTO STRIP PREVIEW (TWIN STRIP LIKE BOXOS) */}
              {activeTab === 'photo' && (
                finalRenderedPhoto ? (
                  <div className="flex items-center justify-center gap-2 sm:gap-4 h-full max-h-[42vh] sm:max-h-[46vh] animate-in fade-in duration-200">
                    {/* Strip 1 */}
                    <img 
                      src={finalRenderedPhoto} 
                      alt="Hasil Foto Strip 1" 
                      className="h-full w-auto max-h-[40vh] sm:max-h-[44vh] object-contain block rounded-lg shadow-md border border-[#272a33]/40 transform hover:scale-101 transition-transform"
                    />
                    
                    {/* Strip 2 (Twin Strip Kembar if vertical strip) */}
                    {!isGrid4R && (
                      <img 
                        src={finalRenderedPhoto} 
                        alt="Hasil Foto Strip 2" 
                        className="h-full w-auto max-h-[40vh] sm:max-h-[44vh] object-contain block rounded-lg shadow-md border border-[#272a33]/40 transform hover:scale-101 transition-transform"
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-32 h-64 bg-slate-800 animate-pulse flex items-center justify-center text-slate-500 text-xs rounded-xl">
                    Memproses Foto...
                  </div>
                )
              )}

              {/* TAB 2: LIVE MOTION VIDEO / GIF PREVIEW */}
              {activeTab === 'motion' && (
                <div className="flex items-center justify-center h-full max-h-[42vh] sm:max-h-[46vh] w-full animate-in fade-in duration-200">
                  {motionVideoSrc ? (
                    <div className="relative h-full max-h-[40vh] sm:max-h-[44vh] flex items-center justify-center">
                      <video 
                        src={motionVideoSrc} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="h-full w-auto max-h-[40vh] sm:max-h-[44vh] object-contain rounded-lg shadow-md border border-[#272a33]/40 block"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center gap-1 shadow-sm font-mono-tech">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        <span>LIVE MOTION</span>
                      </div>
                    </div>
                  ) : gifSrc ? (
                    <div className="relative h-full max-h-[40vh] sm:max-h-[44vh] flex items-center justify-center">
                      <img 
                        src={gifSrc} 
                        alt="GIF Boomerang Preview" 
                        className="h-full w-auto max-h-[40vh] sm:max-h-[44vh] object-contain rounded-lg shadow-md border border-[#272a33]/40 block"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-purple-500 text-white text-[9px] font-bold flex items-center gap-1 shadow-sm font-mono-tech">
                        <span>GIF BOOMERANG</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-xs p-6 bg-white/70 rounded-xl border border-dashed border-slate-300">
                      <Film className="w-8 h-8 text-slate-400 mb-2 animate-bounce" />
                      <span>Membuat Live Motion Video...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Printing Overlay Animation */}
              {isPrinting && (
                <div className="absolute inset-0 bg-[#272a33]/90 backdrop-blur-xs flex flex-col items-center justify-center p-3 animate-in fade-in duration-200 z-30">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-3 border-amber-300 border-t-transparent animate-spin mb-2" />
                  <div className="flex flex-col items-center">
                    <span 
                      className="font-black text-xs sm:text-sm text-amber-300 uppercase tracking-widest leading-tight"
                      style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
                    >
                      SEDANG MENCETAK
                    </span>
                    <span 
                      className="font-bold text-[11px] sm:text-xs text-white uppercase tracking-wider mt-0.5 leading-tight font-mono-tech"
                    >
                      {targetCopies} Lembar Foto Fisik...
                    </span>
                  </div>
                  <p className="text-[9px] sm:text-[10px] text-slate-300 mt-1.5 font-mono-tech px-2 leading-tight text-center">
                    Mengirim ke printer {eventSettings.printerName || 'Kiosk Printer'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 2 TOGGLE BUTTONS (BOXOS STYLE: [ Foto ] & [ GIF / Motion ]) */}
          <div className="inline-flex items-center p-1 bg-[#272a33]/10 border-2 border-[#272a33] rounded-full shadow-[2px_2px_0px_#272a33] gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('photo')}
              className={`px-5 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'photo'
                  ? 'bg-[#272a33] text-[#fde047] shadow-sm font-black'
                  : 'bg-transparent text-[#272a33] hover:bg-white/60 font-semibold'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Foto</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('motion')}
              className={`px-5 sm:px-6 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'motion'
                  ? 'bg-[#272a33] text-[#fde047] shadow-sm font-black'
                  : 'bg-transparent text-[#272a33] hover:bg-white/60 font-semibold'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-purple-600" />
              <span>GIF / Motion</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT SECTION: QR CODE & AUTO-PRINT STATUS (5 COLS) ================= */}
        <div className="md:col-span-5 flex flex-col justify-between p-3.5 sm:p-4 rounded-3xl bg-white border-3 border-[#272a33] shadow-[6px_6px_0px_#272a33] h-full min-h-0 text-center">
          
          {/* Header Info */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#e4ecfc] text-[#272a33] border border-[#272a33] text-[10px] sm:text-[11px] font-bold font-mono-tech mb-1">
              <QrCode className="w-3 h-3 text-blue-600" />
              <span>
                {softfileInfo?.isPublicCloud 
                  ? '🌐 ONLINE 4G/5G AKTIF' 
                  : 'UNDUH SOFTFILE INSTAN'}
              </span>
            </div>

            <h3 
              className="text-sm sm:text-base font-black text-[#343a59] mb-0.5 uppercase tracking-tight"
              style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
            >
              Scan QR Code dengan HP
            </h3>
            <p className="text-slate-600 text-[10px] sm:text-[11px] font-medium max-w-xs leading-tight">
              Unduh Softfile HD: Foto Strip, Live Motion Video, & GIF Boomerang.
            </p>
          </div>

          {/* QR Code Frame */}
          <div className="flex-1 min-h-0 my-1.5 flex items-center justify-center">
            <div className="p-2.5 bg-white rounded-xl sm:rounded-2xl border-2 sm:border-3 border-[#272a33] shadow-[3px_3px_0px_#272a33]">
              {softfileInfo?.qrDataUrl ? (
                <img 
                  src={softfileInfo.qrDataUrl} 
                  alt="Scan to Download Softfile" 
                  className="w-28 h-28 sm:w-36 sm:h-36 max-h-[19vh] object-contain block"
                />
              ) : (
                <div className="w-28 h-28 sm:w-36 sm:h-36 bg-slate-200 animate-pulse rounded-lg" />
              )}
            </div>
          </div>

          {/* Kiosk Download Button */}
          {softfileInfo?.id && (
            <button
              onClick={() => setViewingSoftfileId(softfileInfo.id)}
              className="w-full py-2 px-3 rounded-xl bg-[#e4ecfc] hover:bg-[#d0e0fa] text-[#272a33] border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] font-display font-bold text-[10px] sm:text-[11px] flex items-center justify-center gap-1.5 transition-all transform hover:scale-101 active:scale-98 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Buka Galeri Unduh di Komputer Kiosk</span>
              <ExternalLink className="w-3 h-3 text-blue-600" />
            </button>
          )}

          {/* ================= CLEAN LIVE PRINT STATUS CARD ================= */}
          <div className="w-full mt-2 p-2.5 rounded-xl sm:rounded-2xl bg-[#faf6ea] border-2 border-[#272a33] space-y-1 text-left shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[10px] sm:text-[11px] font-black text-[#272a33] uppercase">
                  Status Cetak Otomatis
                </span>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono-tech border ${
                isPrinting 
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {isPrinting ? '⏳ Proses Cetak...' : `✓ ${hasPrintedCount || targetCopies} Lembar`}
              </span>
            </div>

            <p className="text-[9px] sm:text-[10px] text-slate-600 leading-tight">
              Dicetak <strong>{targetCopies} lembar</strong> di tray printer bagian bawah.
            </p>

            {/* Reprint Operator button */}
            <div className="pt-1 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-[9px] text-slate-500 font-mono-tech">
                Sisa: {paperRemaining} lbr
              </span>
              <button
                type="button"
                disabled={isPrinting || paperRemaining <= 0}
                onClick={() => handleReprint(1)}
                className="px-2 py-0.5 rounded-lg bg-white hover:bg-slate-100 text-[#272a33] border border-slate-300 text-[9px] font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                title="Cetak ulang jika ada kertas macet atau rusak"
              >
                <RefreshCw className="w-2.5 h-2.5 text-purple-600" />
                <span>Cetak Ulang (+1)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM ACTION BAR ================= */}
      <div className="w-full max-w-6xl flex justify-between items-center pt-2 border-t-2 border-[#272a33]/20 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="text-[11px] sm:text-xs text-slate-600 font-medium hidden sm:inline">
            Terima kasih telah berfoto bersama SnapBooth!
          </span>
        </div>

        <button
          onClick={resetToAttract}
          className="px-6 sm:px-10 py-2.5 rounded-full bg-[#272a33] text-[#fde047] hover:bg-[#1a1c22] border-2 sm:border-3 border-[#272a33] shadow-[3px_3px_0px_#272a33] font-display font-black text-xs sm:text-sm tracking-wide flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#fde047]" />
          <span>Selesai & Kembali ke Awal</span>
        </button>
      </div>
    </div>
  );
}
