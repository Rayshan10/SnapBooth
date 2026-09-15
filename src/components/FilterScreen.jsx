import React, { useState } from 'react';
import { useBooth } from '../context/BoothContext';
import { FILTERS } from '../utils/filterEngine';
import { Wand2, Sparkles, Check, ArrowRight, Loader2, RotateCcw } from 'lucide-react';

export default function FilterScreen() {
  const { 
    capturedPhotos, 
    activeFilter, 
    handleFinishFilters, 
    selectedFrame 
  } = useBooth();

  const [selectedFilterId, setSelectedFilterId] = useState(activeFilter || 'normal');
  const [isCompositing, setIsCompositing] = useState(false);

  const activeFilterObj = FILTERS.find(f => f.id === selectedFilterId) || FILTERS[0];

  const handleConfirm = async () => {
    setIsCompositing(true);
    await handleFinishFilters(selectedFilterId);
  };

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
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 
              className="text-2xl md:text-3xl font-black text-[#343a59] leading-tight tracking-tight uppercase"
              style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Fredoka', sans-serif" }}
            >
              PILIH FILTER FOTO
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Sesuaikan tone warna foto agar makin aesthetic (Opsional)
            </p>
          </div>
        </div>

        {/* Page 05 Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#272a33] text-white shadow-md">
            <span className="text-sm font-bold tracking-wide font-display pl-1">Page</span>
            <div className="flex items-center justify-center bg-white text-[#272a33] font-black text-xs px-2.5 py-0.5 rounded-full font-mono-tech">
              05
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN PREVIEW GRID ================= */}
      <div className="w-full max-w-4xl my-auto flex flex-col items-center z-10">
        <div className="w-full p-4 sm:p-5 rounded-3xl bg-white border-3 border-[#272a33] shadow-[8px_8px_0px_#272a33] flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 max-h-[38vh] overflow-hidden w-full">
            {capturedPhotos.map((photoSrc, idx) => (
              <div 
                key={idx} 
                className="relative rounded-2xl overflow-hidden aspect-[3/4] max-h-[34vh] bg-slate-100 shadow-md border-2 border-[#272a33] flex-1 max-w-[180px]"
              >
                <img
                  src={photoSrc}
                  alt={`Pose ${idx + 1}`}
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{
                    filter: activeFilterObj.cssFilter !== 'none' ? activeFilterObj.cssFilter : undefined
                  }}
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-[#272a33] text-white text-[9px] sm:text-[10px] font-mono-tech font-bold shadow">
                  Pose {idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Active Filter Info Tag */}
          <div className="mt-3 px-4 py-1.5 rounded-full bg-[#f4eedb] border border-[#272a33] text-[#272a33] text-xs font-mono-tech flex items-center gap-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Filter: <strong className="text-[#343a59] font-bold">{activeFilterObj.name}</strong> • {activeFilterObj.description}
            </span>
          </div>
        </div>
      </div>

      {/* ================= FILTER PRESETS SELECTOR ================= */}
      <div className="w-full max-w-4xl grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 py-1 z-10">
        {FILTERS.map((f) => {
          const isSelected = selectedFilterId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFilterId(f.id)}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all duration-200 flex flex-col items-center text-center cursor-pointer bg-white ${
                isSelected 
                  ? 'border-3 border-[#272a33] shadow-[4px_4px_0px_#3b82f6] ring-2 ring-[#3b82f6] scale-105 bg-[#fffef7]' 
                  : 'border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] hover:shadow-[5px_5px_0px_#272a33] hover:scale-102'
              }`}
            >
              {/* Color Swatch Dot */}
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mb-1.5 flex items-center justify-center border-2 border-[#272a33] shadow-xs"
                style={{ backgroundColor: f.previewColor }}
              >
                {isSelected && <Check className="w-4 h-4 text-[#272a33] stroke-[3]" />}
              </div>

              <h4 className="font-display font-black text-xs sm:text-sm text-[#343a59] line-clamp-1">{f.name}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium line-clamp-1">{f.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* ================= BOTTOM ACTIONS ================= */}
      <div className="w-full max-w-4xl flex justify-between items-center pt-3 border-t-2 border-[#272a33]/20 z-20">
        <button
          onClick={() => setSelectedFilterId('normal')}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#272a33] border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] hover:bg-[#fff9db] hover:scale-105 active:scale-95 transition-all font-bold text-xs sm:text-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset ke Normal</span>
        </button>

        <button
          disabled={isCompositing}
          onClick={handleConfirm}
          className="px-8 sm:px-12 py-3.5 sm:py-4 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-3 border-[#272a33] shadow-[4px_4px_0px_#3b82f6] font-display font-black text-sm sm:text-base tracking-wide flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isCompositing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
              <span>Memproses & Render Frame...</span>
            </>
          ) : (
            <>
              <span>Cetak & Buat Softfile QR</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
