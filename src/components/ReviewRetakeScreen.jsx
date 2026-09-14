import React from 'react';
import { useBooth } from '../context/BoothContext';
import { RotateCcw, Check, AlertCircle, Sparkles, Camera, ArrowRight } from 'lucide-react';

export default function ReviewRetakeScreen() {
  const { 
    currentPoseIndex, 
    capturedPhotos, 
    selectedFrame, 
    retakeCounts, 
    handleRetakePose, 
    handleAcceptPose 
  } = useBooth();

  const photo = capturedPhotos[currentPoseIndex];
  const retakesUsed = retakeCounts[currentPoseIndex] || 0;
  const maxRetakes = 2;
  const remainingRetakes = Math.max(0, maxRetakes - retakesUsed);
  const canRetake = remainingRetakes > 0;
  const totalPoses = selectedFrame.poses;
  const isLastPose = currentPoseIndex + 1 >= totalPoses;

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
      <div className="w-full max-w-4xl flex justify-between items-center z-20">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#272a33] text-white shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 
              className="text-2xl md:text-3xl font-black text-[#343a59] leading-tight tracking-tight uppercase"
              style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Fredoka', sans-serif" }}
            >
              HASIL POSE {currentPoseIndex + 1} DARI {totalPoses}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Periksa hasil jepretan foto sebelum lanjut ke sesi berikutnya
            </p>
          </div>
        </div>

        {/* Retake badge quota */}
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-full border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] flex items-center gap-2 text-xs font-bold font-mono-tech ${
            canRetake 
              ? 'bg-[#fef08a] text-[#272a33]' 
              : 'bg-[#fda4af] text-[#272a33]'
          }`}>
            <AlertCircle className="w-4 h-4" />
            <span>Sisa Ulang: {remainingRetakes}x</span>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#272a33] text-white shadow-md">
            <span className="text-sm font-bold tracking-wide font-display pl-1">Page</span>
            <div className="flex items-center justify-center bg-white text-[#272a33] font-black text-xs px-2.5 py-0.5 rounded-full font-mono-tech">
              04
            </div>
          </div>
        </div>
      </div>

      {/* ================= CENTER IMAGE PREVIEW BOX ================= */}
      <div className="relative max-h-[58vh] max-w-2xl w-full my-auto rounded-3xl overflow-hidden bg-white border-3 border-[#272a33] shadow-[8px_8px_0px_#272a33] flex items-center justify-center p-3.5 z-10">
        {photo ? (
          <img 
            src={photo} 
            alt={`Pose ${currentPoseIndex + 1}`} 
            className="max-h-[52vh] w-auto object-contain rounded-2xl border-2 border-[#272a33] shadow-md"
          />
        ) : (
          <div className="p-12 text-slate-500 font-bold text-center">Foto tidak tersedia</div>
        )}
      </div>

      {/* Retake Status Notice if quota exceeded */}
      {!canRetake && (
        <div className="w-full max-w-md py-2 px-4 rounded-xl bg-[#fda4af] border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] text-[#272a33] text-center text-xs font-bold mb-2 flex items-center justify-center gap-2 z-20">
          <AlertCircle className="w-4 h-4 text-[#272a33]" />
          <span>Batas 2x foto ulang telah tercapai. Foto ini otomatis digunakan.</span>
        </div>
      )}

      {/* ================= BOTTOM ACTION CONTROLS ================= */}
      <div className="w-full max-w-2xl flex gap-4 items-center justify-center pt-2 z-20">
        {/* Retake Button */}
        <button
          onClick={handleRetakePose}
          disabled={!canRetake}
          className={`flex-1 py-4 px-6 rounded-full font-display font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all cursor-pointer border-3 border-[#272a33] ${
            canRetake
              ? 'bg-white text-[#272a33] shadow-[4px_4px_0px_#272a33] hover:bg-[#fff9db] hover:scale-105 active:scale-95'
              : 'opacity-40 bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          <span>
            {canRetake ? `Foto Ulang (${remainingRetakes}x Sisa)` : 'Foto Ulang Habis (0x)'}
          </span>
        </button>

        {/* Accept & Next Button */}
        <button
          onClick={handleAcceptPose}
          className="flex-1 py-4 px-8 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-3 border-[#272a33] shadow-[4px_4px_0px_#3b82f6] font-display font-black text-sm sm:text-base flex items-center justify-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>
            {isLastPose ? 'Selesai & Pilih Filter' : `Lanjut ke Pose ${currentPoseIndex + 2}`}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
