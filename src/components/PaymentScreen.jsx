import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { QrCode, ArrowLeft, CheckCircle2, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';

export default function PaymentScreen() {
  const { eventSettings, handlePaymentSuccess, resetToAttract } = useBooth();
  const [qrisQrUrl, setQrisQrUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes payment countdown
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate Dynamic QRIS visual
  useEffect(() => {
    const qrisPayload = `00020101021226590014ID.LINKAJA.WWW01189360091438257891230215ID10200238495010303UME51440014ID.CO.QRIS.WWW0215ID10200238495010303UME520458125303360540${eventSettings.price}5802ID5914SNAPBOOTH CORP6007JAKARTA61051295062210517SNAP${Date.now()}6304`;
    
    QRCode.toDataURL(qrisPayload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#272a33',
        light: '#ffffff'
      }
    }).then(url => setQrisQrUrl(url));

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          resetToAttract();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [eventSettings.price, resetToAttract]);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      handlePaymentSuccess();
    }, 1000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative w-full h-screen flex flex-col justify-between items-center p-6 md:p-10 bg-grid-notebook text-slate-900 overflow-hidden select-none">
      
      {/* ================= BACKGROUND STICKER ORNAMENTS ================= */}
      {/* 1. Sparkle Star Kuning (Kiri Atas) */}
      <div className="absolute top-24 sm:top-28 left-8 sm:left-12 md:left-16 z-0 pointer-events-none animate-float">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#1e2336" transform="translate(4, 5)" />
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#fef08a" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="7" fill="#ffffff" />
        </svg>
      </div>

      {/* 2. Retro 3D Heart Sticker (Kiri Tengah) */}
      <div className="absolute top-[52%] left-6 sm:left-10 md:left-14 z-0 pointer-events-none animate-float-reverse">
        <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#1e2336" transform="translate(5, 5) rotate(-12 50 50)" />
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#fda4af" stroke="#1e2336" strokeWidth="6.5" strokeLinejoin="round" transform="rotate(-12 50 50)" />
          <path d="M 28 26 C 24 34 26 44 32 50" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" transform="rotate(-12 50 50)" />
        </svg>
      </div>

      {/* 3. Retro 3D Camera Sticker (Kiri Bawah) */}
      <div className="absolute bottom-20 left-10 sm:left-16 md:left-24 z-0 pointer-events-none animate-float">
        <svg className="w-11 h-11 sm:w-13 sm:h-13 md:w-16 md:h-16 overflow-visible" viewBox="0 0 100 100" fill="none">
          {/* Shadow */}
          <rect x="15" y="30" width="70" height="50" rx="12" fill="#1e2336" transform="translate(4, 5) rotate(-6 50 50)" />
          {/* Camera Body */}
          <rect x="15" y="30" width="70" height="50" rx="12" fill="#bdd2f5" stroke="#1e2336" strokeWidth="6" transform="rotate(-6 50 50)" />
          {/* Camera Top Bump */}
          <rect x="35" y="18" width="30" height="15" rx="5" fill="#bdd2f5" stroke="#1e2336" strokeWidth="5" transform="rotate(-6 50 50)" />
          {/* Lens */}
          <circle cx="50" cy="55" r="16" fill="#1e2336" transform="rotate(-6 50 50)" />
          <circle cx="50" cy="55" r="9" fill="#e4ecfc" transform="rotate(-6 50 50)" />
          <circle cx="47" cy="52" r="3" fill="#ffffff" transform="rotate(-6 50 50)" />
        </svg>
      </div>

      {/* 4. Retro 3D Daisy Smiley Flower (Kanan Atas dekat Timer) */}
      <div className="absolute top-20 sm:top-24 right-10 sm:right-16 md:right-24 z-0 pointer-events-none animate-float-reverse">
        <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 overflow-visible" viewBox="0 0 100 100" fill="none">
          {/* Shadow */}
          <circle cx="54" cy="54" r="38" fill="#1e2336" />
          {/* Petals Body */}
          <circle cx="50" cy="50" r="38" fill="#fef08a" stroke="#1e2336" strokeWidth="6" />
          {/* Inner Face */}
          <circle cx="50" cy="50" r="20" fill="#e9d5ff" stroke="#1e2336" strokeWidth="5" />
          {/* Eyes & Smile */}
          <circle cx="43" cy="46" r="3" fill="#1e2336" />
          <circle cx="57" cy="46" r="3" fill="#1e2336" />
          <path d="M 42 54 C 45 60 55 60 58 54" stroke="#1e2336" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* 5. 3D Lightning Bolt (Kanan Tengah) */}
      <div className="absolute top-[42%] right-6 sm:right-10 md:right-16 z-0 pointer-events-none animate-float">
        <svg className="w-10 h-12 sm:w-12 sm:h-16 md:w-14 md:h-18 overflow-visible" viewBox="0 0 100 120" fill="none">
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#1e2336" transform="translate(4, 5) rotate(8 50 60)" />
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#fde047" stroke="#1e2336" strokeWidth="6.5" strokeLinejoin="round" transform="rotate(8 50 60)" />
          <path d="M 50 16 L 28 58" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" transform="rotate(8 50 60)" />
        </svg>
      </div>

      {/* 6. Sparkle Biru Pastel (Kanan Bawah) */}
      <div className="absolute bottom-16 right-10 sm:right-16 md:right-24 z-0 pointer-events-none animate-float-reverse">
        <svg className="w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#1e2336" transform="translate(4, 4)" />
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#bfdbfe" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" />
        </svg>
      </div>

      {/* 7. Mini Sparkle Mint Green (Tengah Atas) */}
      <div className="absolute top-6 left-[28%] z-0 pointer-events-none animate-float">
        <svg className="w-6 h-6 sm:w-8 sm:h-8 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#1e2336" transform="translate(3, 4)" />
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#a7f3d0" stroke="#1e2336" strokeWidth="6" />
        </svg>
      </div>

      {/* ================= TOP BAR ================= */}
      <div className="w-full flex justify-between items-center z-20">
        {/* Tombol Batal */}
        <button 
          onClick={resetToAttract}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#272a33] text-white shadow-md hover:bg-[#1a1c22] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Batal</span>
        </button>

        {/* Right Info: Countdown & Page Badge */}
        <div className="flex items-center gap-3">
          {/* Batas Waktu Timer */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#272a33] text-amber-300 font-mono-tech text-xs sm:text-sm font-bold shadow-md">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Waktu: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </div>

          {/* Page 02 Badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#272a33] text-white shadow-md">
            <span className="text-sm font-bold tracking-wide font-display pl-1">Page</span>
            <div className="flex items-center justify-center bg-white text-[#272a33] font-black text-xs px-2.5 py-0.5 rounded-full font-mono-tech">
              02
            </div>
          </div>
        </div>
      </div>

      {/* ================= CENTER PAYMENT CARD ================= */}
      <div className="w-full max-w-md bg-white border-2 border-[#272a33] shadow-[8px_8px_0px_#272a33] p-6 sm:p-8 rounded-3xl flex flex-col items-center text-center my-auto z-10 transition-transform">
        
        {/* QRIS Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e4ecfc] border border-[#272a33] text-[#272a33] text-xs font-bold font-mono-tech mb-3">
          <QrCode className="w-3.5 h-3.5 text-[#343a59]" />
          <span>PEMBAYARAN QRIS RESMI</span>
        </div>

        {/* Title */}
        <h2 
          className="text-2xl sm:text-3xl font-black text-[#343a59] mb-1 leading-tight tracking-tight"
          style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Fredoka', sans-serif" }}
        >
          SCAN QRIS UNTUK MULAI
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-5 font-medium">
          Bisa gunakan GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dll.
        </p>

        {/* QR Code Paper Box */}
        <div className="bg-[#fcfbf7] p-4 rounded-2xl border-2 border-[#272a33] shadow-inner flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2 px-1 border-b border-slate-300 pb-1">
            <span className="text-[11px] font-black text-[#272a33] tracking-wider">QRIS</span>
            <span className="text-[10px] font-bold text-slate-600">GPN</span>
          </div>

          {qrisQrUrl ? (
            <img src={qrisQrUrl} alt="QRIS Code" className="w-52 h-52 sm:w-56 sm:h-56 object-contain" />
          ) : (
            <div className="w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
            </div>
          )}

          <div className="w-full text-center mt-2 border-t border-slate-300 pt-1">
            <span className="text-[11px] font-bold text-[#272a33] tracking-wide font-mono-tech">
              SNAPBOOTH • {eventSettings.title}
            </span>
          </div>
        </div>

        {/* Total Price Box */}
        <div className="mt-5 w-full py-2.5 px-4 rounded-2xl bg-[#f4eedb] border-2 border-[#272a33] flex justify-between items-center">
          <span className="text-xs sm:text-sm font-bold text-slate-700">Total Tagihan:</span>
          <span className="text-lg sm:text-xl font-black text-[#343a59] font-mono-tech">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(eventSettings.price)}
          </span>
        </div>

        {/* Test Simulator Button */}
        <div className="w-full mt-4 flex flex-col gap-1.5">
          <button
            disabled={isProcessing}
            onClick={handleSimulatePayment}
            className="w-full py-3.5 sm:py-4 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[4px_4px_0px_#10b981] font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Memverifikasi Pembayaran...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Simulasi Bayar Berhasil (Tap Di Sini)</span>
              </>
            )}
          </button>
          <span className="text-[10px] text-slate-500 font-medium">
            *Sistem otomatis mendeteksi saat uang masuk dari QRIS
          </span>
        </div>
      </div>

      {/* ================= BOTTOM FOOTER ================= */}
      <div className="w-full flex justify-between items-end z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center p-1 shadow-sm">
            <svg className="w-full h-full text-white fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>
          <span className="font-display font-extrabold text-sm sm:text-base text-[#272a33] tracking-wide">
            snapbooth.id
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium hidden sm:flex">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Transaksi aman & terverifikasi otomatis</span>
        </div>
      </div>
    </div>
  );
}
