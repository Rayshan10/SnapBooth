import React, { useState } from 'react';
import { useBooth } from '../context/BoothContext';
import { Camera, Sparkles, QrCode, Printer, Heart, ShieldCheck, Zap } from 'lucide-react';

export default function AttractScreen() {
  const { startNewSession, eventSettings, setIsAdminOpen } = useBooth();
  const [adminTapCount, setAdminTapCount] = useState(0);

  // Hidden admin gesture: tap top-right 3 times
  const handleAdminTap = (e) => {
    e.stopPropagation();
    const nextCount = adminTapCount + 1;
    if (nextCount >= 3) {
      setIsAdminOpen(true);
      setAdminTapCount(0);
    } else {
      setAdminTapCount(nextCount);
      setTimeout(() => setAdminTapCount(0), 1200);
    }
  };

  return (
    <div 
      onClick={startNewSession}
      className="relative w-full h-screen flex flex-col justify-between items-center p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 overflow-hidden cursor-pointer select-none"
    >
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />

      {/* Top Bar with Event Header & Hidden Admin Trigger */}
      <div className="w-full flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white tracking-wide">SNAPBOOTH</h3>
            <p className="text-xs text-slate-400 font-mono-tech">{eventSettings.location}</p>
          </div>
        </div>

        {/* Hidden Admin Trigger (Top Right) */}
        <button 
          onClick={handleAdminTap}
          className="p-3 rounded-full hover:bg-white/5 transition-all text-slate-500 text-xs font-mono-tech"
          title="Admin Mode (Tap 3x)"
        >
          {adminTapCount > 0 ? `TAP ${adminTapCount}/3` : 'v1.0'}
        </button>
      </div>

      {/* Main Center Call-to-Action */}
      <div className="flex flex-col items-center text-center z-10 max-w-2xl my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-blue-400 text-sm font-medium mb-6 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{eventSettings.title}</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight leading-none mb-6">
          CAPTURE THE <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 glow-text">
            MOMENT
          </span>
        </h1>

        <p className="text-slate-300 text-lg md:text-xl font-light mb-10 max-w-lg">
          {eventSettings.subtitle} • Cetak foto instan & unduh softfile langsung ke smartphone kamu!
        </p>

        {/* Start Button */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-500 animate-pulse-slow"></div>
          <button className="relative px-12 py-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-display font-bold text-2xl tracking-wider shadow-2xl flex items-center gap-4 transition-transform transform group-hover:scale-105 active:scale-95">
            <Zap className="w-7 h-7 text-amber-300 fill-amber-300" />
            <span>SENTUH UNTUK MEMULAI</span>
          </button>
        </div>

        <p className="text-slate-400 text-sm font-mono-tech mt-6 flex items-center gap-2">
          <span>Tarif Sesi:</span>
          <span className="text-emerald-400 font-bold text-base">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(eventSettings.price)}
          </span>
          <span className="text-slate-500">• Pembayaran via QRIS</span>
        </p>
      </div>

      {/* Feature Highlights Footer */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-4 z-10">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">QRIS Instan</h4>
            <p className="text-xs text-slate-400">Semua e-wallet & bank</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Cetak Otomatis</h4>
            <p className="text-xs text-slate-400">Foto strip tajam & glossy</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Softfile QR</h4>
            <p className="text-xs text-slate-400">Scan & unduh ke HP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
