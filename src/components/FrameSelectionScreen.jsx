import React, { useState } from 'react';
import { useBooth } from '../context/BoothContext';
import { FRAME_TEMPLATES } from '../utils/canvasRenderer';
import { LayoutGrid, Check, ArrowRight } from 'lucide-react';

export default function FrameSelectionScreen() {
  const { selectedFrame, handleSelectFrame } = useBooth();
  const [activeTemplate, setActiveTemplate] = useState(selectedFrame || FRAME_TEMPLATES[0]);

  return (
    <div className="relative w-full h-screen flex flex-col justify-between items-center p-6 md:p-10 bg-grid-notebook text-slate-900 overflow-hidden select-none">
      
      {/* ================= BACKGROUND STICKER ORNAMENTS ================= */}
      {/* 1. Sparkle Star Kuning (Kiri Atas) */}
      <div className="absolute top-10 left-6 sm:left-10 z-0 pointer-events-none animate-float opacity-80">
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
      <div className="w-full max-w-6xl flex justify-between items-center z-20">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#272a33] text-white shadow-md">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h2 
              className="text-2xl md:text-3xl font-black text-[#343a59] leading-tight tracking-tight uppercase"
              style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Fredoka', sans-serif" }}
            >
              PILIH DESAIN FRAME
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Pilih format strip dan gaya warna yang kamu suka
            </p>
          </div>
        </div>

        {/* Page 03 Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#272a33] text-white shadow-md">
            <span className="text-sm font-bold tracking-wide font-display pl-1">Page</span>
            <div className="flex items-center justify-center bg-white text-[#272a33] font-black text-xs px-2.5 py-0.5 rounded-full font-mono-tech">
              03
            </div>
          </div>
        </div>
      </div>

      {/* ================= FRAME CARDS GRID ================= */}
      <div className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 my-auto overflow-y-auto max-h-[66vh] py-3 px-1 z-10">
        {FRAME_TEMPLATES.map((tmpl) => {
          const isSelected = activeTemplate.id === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => setActiveTemplate(tmpl)}
              className={`relative rounded-3xl p-3.5 cursor-pointer transition-all duration-200 flex flex-col items-center text-center bg-white ${
                isSelected 
                  ? 'border-3 border-[#272a33] shadow-[8px_8px_0px_#3b82f6] ring-2 ring-[#3b82f6] scale-[1.03] bg-[#fffef7]' 
                  : 'border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] hover:shadow-[6px_6px_0px_#272a33] hover:scale-[1.01]'
              }`}
            >
              {/* Badge Tag on Top-Left */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e4ecfc] text-[#272a33] border border-[#272a33] font-mono-tech">
                {tmpl.tag}
              </div>

              {/* Selected Checkmark Badge on Top-Right */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#272a33] text-white flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              {/* Visual Strip Miniature Mockup */}
              <div 
                className="w-20 h-40 rounded-xl shadow-md border-2 border-[#272a33] my-3 p-1.5 flex flex-col justify-between items-center transition-transform"
                style={{
                  backgroundColor: tmpl.bgColor,
                  borderColor: tmpl.borderColor || '#272a33'
                }}
              >
                {/* Header mock */}
                <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: tmpl.textColor, opacity: 0.6 }} />

                {/* Photo boxes */}
                {tmpl.type === 'strip-3' && (
                  <div className="w-full flex-1 flex flex-col gap-1 justify-center my-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-full h-8 rounded bg-slate-300/60 border border-black/10 flex items-center justify-center text-[7px] font-mono-tech" style={{ color: tmpl.textColor }}>
                        Pose {i}
                      </div>
                    ))}
                  </div>
                )}

                {tmpl.type === 'strip-4' && (
                  <div className="w-full flex-1 flex flex-col gap-1 justify-center my-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-full h-6 rounded bg-slate-300/60 border border-black/10 flex items-center justify-center text-[6.5px] font-mono-tech" style={{ color: tmpl.textColor }}>
                        Pose {i}
                      </div>
                    ))}
                  </div>
                )}

                {tmpl.type === 'grid-4' && (
                  <div className="w-full flex-1 grid grid-cols-2 gap-1 my-1 p-0.5">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-full h-11 rounded bg-slate-300/60 border border-black/10 flex items-center justify-center text-[6.5px] font-mono-tech" style={{ color: tmpl.textColor }}>
                        {i}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer mock */}
                <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: tmpl.subtextColor, opacity: 0.5 }} />
              </div>

              {/* Template Info */}
              <h3 className="font-display font-extrabold text-xs sm:text-sm text-[#343a59] mt-0.5 leading-snug line-clamp-1">
                {tmpl.name}
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                {tmpl.poses} Pose • {tmpl.theme}
              </p>
              
              {/* Format Badge */}
              <span className="mt-2 text-[10px] font-mono-tech font-bold px-2 py-0.5 rounded-full bg-[#f4eedb] border border-[#272a33] text-[#272a33]">
                {tmpl.aspectRatio} Inch
              </span>
            </div>
          );
        })}
      </div>

      {/* ================= BOTTOM ACTION BAR ================= */}
      <div className="w-full max-w-6xl flex justify-center items-center pt-3 border-t-2 border-[#272a33]/20 z-20">
        <button
          onClick={() => handleSelectFrame(activeTemplate)}
          className="px-10 sm:px-16 py-3.5 sm:py-4 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-3 border-[#272a33] shadow-[4px_4px_0px_#3b82f6] font-display font-black text-sm sm:text-base tracking-wide flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Mulai Sesi Foto ({activeTemplate.poses} Pose)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
