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
        dark: '#0f172a',
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
    }, 1200);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full h-screen flex flex-col justify-between items-center p-8 bg-slate-950 text-white select-none">
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center">
        <button 
          onClick={resetToAttract}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card hover:bg-white/10 transition-colors text-slate-300 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Batal</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono-tech">
          <Clock className="w-4 h-4" />
          <span>Batas Waktu: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
        </div>
      </div>

      {/* Center Payment Card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl border border-white/10 my-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold mb-4">
          <QrCode className="w-3.5 h-3.5" />
          <span>PEMBAYARAN QRIS RESMI</span>
        </div>

        <h2 className="font-display text-2xl font-bold mb-1">Scan QRIS Untuk Memulai</h2>
        <p className="text-slate-400 text-sm mb-6">Bisa gunakan GoPay, OVO, Dana, ShopeePay, BCA, Mandiri, dll.</p>

        {/* QR Box with Standard QRIS Header & Footer */}
        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2 px-1 border-b border-slate-200 pb-1">
            <span className="text-[10px] font-bold text-slate-800 tracking-wider">QRIS</span>
            <span className="text-[9px] font-semibold text-slate-500">GPN</span>
          </div>

          {qrisQrUrl ? (
            <img src={qrisQrUrl} alt="QRIS Code" className="w-56 h-56 object-contain" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
          )}

          <div className="w-full text-center mt-2 border-t border-slate-200 pt-1">
            <span className="text-[11px] font-bold text-slate-900 tracking-wide font-mono-tech">
              SNAPBOOTH • {eventSettings.title}
            </span>
          </div>
        </div>

        {/* Total Price */}
        <div className="mt-6 w-full py-3 px-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
          <span className="text-sm text-slate-400">Total Tagihan:</span>
          <span className="text-xl font-display font-black text-emerald-400">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(eventSettings.price)}
          </span>
        </div>

        {/* Test Simulator Button for Booth Operator / Testing */}
        <div className="w-full mt-6 flex flex-col gap-2">
          <button
            disabled={isProcessing}
            onClick={handleSimulatePayment}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memverifikasi Pembayaran...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Simulasi Bayar Berhasil (Tap Di Sini)</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-slate-500">
            *Otomatis mendeteksi saat uang masuk dari QRIS
          </span>
        </div>
      </div>

      {/* Safety Badge */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Transaksi aman & terverifikasi otomatis</span>
      </div>
    </div>
  );
}
