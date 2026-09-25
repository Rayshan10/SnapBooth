import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { QrCode, ArrowLeft, CheckCircle2, Clock, ShieldCheck, Loader2, Ticket, Sparkles, X, Gift, Crown, ArrowRight } from 'lucide-react';
import QRCode from 'qrcode';

export default function PaymentScreen() {
  const { 
    eventSettings, 
    handlePaymentSuccess, 
    resetToAttract,
    appliedVoucher,
    validateAndApplyVoucher,
    removeAppliedVoucher
  } = useBooth();

  const [qrisQrUrl, setQrisQrUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes payment countdown
  const [isProcessing, setIsProcessing] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherMessage, setVoucherMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [showVoucherForm, setShowVoucherForm] = useState(false);

  const effectivePrice = appliedVoucher ? appliedVoucher.finalPrice : Number(eventSettings.price) || 35000;
  const isVipFree = appliedVoucher?.isFree || effectivePrice === 0;

  // Generate Dynamic QRIS visual
  useEffect(() => {
    if (isVipFree) return; // No need to generate QRIS if free

    const qrisPayload = `00020101021226590014ID.LINKAJA.WWW01189360091438257891230215ID10200238495010303UME51440014ID.CO.QRIS.WWW0215ID10200238495010303UME520458125303360540${effectivePrice}5802ID5914SNAPBOOTH CORP6007JAKARTA61051295062210517SNAP${Date.now()}6304`;
    
    QRCode.toDataURL(qrisPayload, {
      width: 280,
      margin: 1,
      color: {
        dark: '#272a33',
        light: '#ffffff'
      }
    }).then(url => setQrisQrUrl(url));
  }, [effectivePrice, isVipFree, eventSettings.title]);

  // Timer Countdown
  useEffect(() => {
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
  }, [resetToAttract]);

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      handlePaymentSuccess();
    }, 1000);
  };

  const handleApplyVoucher = (e) => {
    if (e) e.preventDefault();
    if (!voucherCodeInput.trim()) {
      setVoucherMessage({ type: 'error', text: 'Ketik kode voucher / kupon terlebih dahulu.' });
      return;
    }

    const result = validateAndApplyVoucher(voucherCodeInput, eventSettings.price);
    if (result.success) {
      setVoucherMessage({ 
        type: 'success', 
        text: `Kupon "${result.voucher.code}" berhasil dipakai! (${result.voucher.description})` 
      });
      setVoucherCodeInput('');
    } else {
      setVoucherMessage({ type: 'error', text: result.message });
    }
  };

  const handleRemoveVoucher = () => {
    removeAppliedVoucher();
    setVoucherMessage(null);
    setVoucherCodeInput('');
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative w-full h-screen flex flex-col justify-between items-center p-6 md:p-10 bg-grid-notebook text-slate-900 overflow-y-auto select-none">
      
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
          <rect x="15" y="30" width="70" height="50" rx="12" fill="#1e2336" transform="translate(4, 5) rotate(-6 50 50)" />
          <rect x="15" y="30" width="70" height="50" rx="12" fill="#bdd2f5" stroke="#1e2336" strokeWidth="6" transform="rotate(-6 50 50)" />
          <rect x="35" y="18" width="30" height="15" rx="5" fill="#bdd2f5" stroke="#1e2336" strokeWidth="5" transform="rotate(-6 50 50)" />
          <circle cx="50" cy="55" r="16" fill="#1e2336" transform="rotate(-6 50 50)" />
          <circle cx="50" cy="55" r="9" fill="#e4ecfc" transform="rotate(-6 50 50)" />
          <circle cx="47" cy="52" r="3" fill="#ffffff" transform="rotate(-6 50 50)" />
        </svg>
      </div>

      {/* 4. Retro 3D Daisy Smiley Flower (Kanan Atas) */}
      <div className="absolute top-20 sm:top-24 right-10 sm:right-16 md:right-24 z-0 pointer-events-none animate-float-reverse">
        <svg className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 overflow-visible" viewBox="0 0 100 100" fill="none">
          <circle cx="54" cy="54" r="38" fill="#1e2336" />
          <circle cx="50" cy="50" r="38" fill="#fef08a" stroke="#1e2336" strokeWidth="6" />
          <circle cx="50" cy="50" r="20" fill="#e9d5ff" stroke="#1e2336" strokeWidth="5" />
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

      {/* ================= CENTER PAYMENT & VOUCHER CARD ================= */}
      <div className="w-full max-w-lg bg-white border-3 border-[#272a33] shadow-[8px_8px_0px_#272a33] p-5 sm:p-7 rounded-3xl flex flex-col items-center text-center my-auto z-10 transition-all max-h-[88vh] overflow-y-auto">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e4ecfc] border border-[#272a33] text-[#272a33] text-xs font-bold font-mono-tech mb-2">
          {isVipFree ? (
            <>
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>AKSES VIP KHUSUS</span>
            </>
          ) : (
            <>
              <QrCode className="w-3.5 h-3.5 text-[#343a59]" />
              <span>PEMBAYARAN QRIS RESMI</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 
          className="text-xl sm:text-2xl font-black text-[#343a59] mb-1 leading-tight tracking-tight"
          style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Fredoka', sans-serif" }}
        >
          {isVipFree ? 'VOUCHER VIP BERHASIL DIAKTIFKAN!' : 'SCAN QRIS UNTUK MULAI'}
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm mb-4 font-medium">
          {isVipFree 
            ? 'Sesi foto ini gratis untuk panitia / tamu undangan VIP.'
            : 'Bisa gunakan GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dll.'
          }
        </p>

        {/* QR Code OR VIP Golden Box */}
        {isVipFree ? (
          <div className="w-full bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 p-6 rounded-3xl border-3 border-[#272a33] shadow-[4px_4px_0px_#272a33] flex flex-col items-center gap-3 my-2 animate-bounce-subtle">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] flex items-center justify-center text-[#272a33]">
              <Crown className="w-9 h-9 text-[#272a33]" />
            </div>
            <div>
              <span className="text-[11px] font-mono-tech font-black tracking-widest text-amber-900 uppercase">
                VIP ALL-ACCESS PASS
              </span>
              <h3 className="text-lg font-black text-[#272a33] font-display">
                {appliedVoucher?.description || 'Tamu VIP / Panitia Event'}
              </h3>
              <p className="text-xs text-amber-800 font-semibold mt-0.5">
                Kode Kupon: <span className="font-mono-tech font-black underline">{appliedVoucher?.code}</span>
              </p>
            </div>
            
            <div className="px-4 py-1.5 rounded-full bg-[#272a33] text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Biaya Sesi: Rp 0 (100% GRATIS)</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#fcfbf7] p-3 sm:p-4 rounded-2xl border-2 border-[#272a33] shadow-inner flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-1.5 px-1 border-b border-slate-300 pb-1">
              <span className="text-[11px] font-black text-[#272a33] tracking-wider">QRIS</span>
              <span className="text-[10px] font-bold text-slate-600">GPN</span>
            </div>

            {qrisQrUrl ? (
              <img src={qrisQrUrl} alt="QRIS Code" className="w-44 h-44 sm:w-48 sm:h-48 object-contain" />
            ) : (
              <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-600 animate-spin" />
              </div>
            )}

            <div className="w-full text-center mt-1.5 border-t border-slate-300 pt-1">
              <span className="text-[10px] font-bold text-[#272a33] tracking-wide font-mono-tech">
                SNAPBOOTH • {eventSettings.title}
              </span>
            </div>
          </div>
        )}

        {/* Total Price & Applied Voucher Info Box */}
        <div className="mt-3.5 w-full py-2.5 px-4 rounded-2xl bg-[#f4eedb] border-2 border-[#272a33] flex justify-between items-center">
          <div className="text-left">
            <span className="text-xs font-bold text-slate-700 block">Total Tagihan:</span>
            {appliedVoucher && (
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                <Ticket className="w-3 h-3" />
                <span>Kupon {appliedVoucher.code} ({appliedVoucher.type === 'free' ? 'Gratis' : `Hemat Rp ${appliedVoucher.discountAmount.toLocaleString('id-ID')}`})</span>
              </span>
            )}
          </div>

          <div className="text-right">
            {appliedVoucher && appliedVoucher.discountAmount > 0 && (
              <span className="text-xs text-slate-400 line-through font-mono-tech block font-semibold">
                Rp {Number(eventSettings.price).toLocaleString('id-ID')}
              </span>
            )}
            <span className={`text-base sm:text-lg font-black font-mono-tech ${isVipFree ? 'text-emerald-700' : 'text-[#343a59]'}`}>
              {isVipFree ? 'GRATIS (Rp 0)' : `Rp ${effectivePrice.toLocaleString('id-ID')}`}
            </span>
          </div>
        </div>

        {/* ================= VOUCHER INPUT ACCORDION / BOX ================= */}
        <div className="w-full mt-3">
          {appliedVoucher ? (
            <div className="p-2.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 flex items-center justify-between gap-2 shadow-sm text-left">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="p-1.5 rounded-xl bg-emerald-500 text-white shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-black text-emerald-900 font-mono-tech truncate">
                    {appliedVoucher.code} • {appliedVoucher.description}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    {appliedVoucher.isFree ? '100% Bebas Biaya' : `Potongan Rp ${appliedVoucher.discountAmount.toLocaleString('id-ID')}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveVoucher}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-[11px] font-bold shrink-0 cursor-pointer transition-all flex items-center gap-1"
                title="Batalkan Voucher"
              >
                <X className="w-3.5 h-3.5" />
                <span>Batal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {!showVoucherForm ? (
                <button
                  type="button"
                  onClick={() => setShowVoucherForm(true)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-dashed border-slate-300 hover:border-amber-400 text-slate-700 hover:text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Ticket className="w-3.5 h-3.5 text-amber-600" />
                  <span>Punya Kode Kupon / Voucher VIP Panitia? (Tap Di Sini)</span>
                </button>
              ) : (
                <form onSubmit={handleApplyVoucher} className="p-3 rounded-2xl bg-slate-50 border-2 border-[#272a33] text-left space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-pink-600" />
                      <span>Masukkan Kode Kupon / Voucher VIP</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowVoucherForm(false);
                        setVoucherMessage(null);
                      }}
                      className="text-slate-400 hover:text-slate-700 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCodeInput}
                      onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                      placeholder="Contoh: VIPFREE / PANITIA"
                      className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-[#272a33] text-xs font-black tracking-wider text-slate-900 font-mono-tech placeholder:text-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-amber-400"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#272a33] text-amber-300 hover:bg-[#1a1c22] font-black text-xs border-2 border-[#272a33] shadow-[2px_2px_0px_#fde047] cursor-pointer transition-all shrink-0 active:scale-95"
                    >
                      Pakai
                    </button>
                  </div>

                  {voucherMessage && (
                    <p className={`text-[11px] font-bold flex items-center gap-1 ${
                      voucherMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      <span>{voucherMessage.type === 'success' ? '✓' : '⚠'} {voucherMessage.text}</span>
                    </p>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Button (VIP Free vs QRIS simulator) */}
        <div className="w-full mt-4 flex flex-col gap-1.5">
          {isVipFree ? (
            <button
              onClick={() => handlePaymentSuccess()}
              className="w-full py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-[#272a33] border-3 border-[#272a33] shadow-[4px_4px_0px_#272a33] font-display font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all transform hover:scale-102 active:scale-98 cursor-pointer"
            >
              <span>Lanjut Pilih Frame (Akses VIP)</span>
              <ArrowRight className="w-5 h-5 text-[#272a33]" />
            </button>
          ) : (
            <button
              disabled={isProcessing}
              onClick={handleSimulatePayment}
              className="w-full py-3 sm:py-3.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[4px_4px_0px_#10b981] font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Memverifikasi Pembayaran...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Simulasi Bayar Berhasil (Tap Di Sini)</span>
                </>
              )}
            </button>
          )}
          <span className="text-[10px] text-slate-500 font-medium">
            {isVipFree ? '*Sesi langsung dimulai tanpa pembayaran' : '*Sistem otomatis mendeteksi saat uang masuk dari QRIS'}
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
