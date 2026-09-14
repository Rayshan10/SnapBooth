import React, { useState } from 'react';
import { useBooth } from '../context/BoothContext';

export default function AttractScreen() {
  const { startNewSession, setIsAdminOpen } = useBooth();
  const [adminTapCount, setAdminTapCount] = useState(0);

  // Hidden admin gesture: tap "Page 01" badge 3 times
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
      className="relative w-full h-screen flex flex-col justify-between items-center p-6 md:p-10 bg-grid-notebook text-slate-900 overflow-hidden cursor-pointer select-none"
    >
      {/* Top Bar with "Page 01" Badge (Top Right) */}
      <div className="w-full flex justify-end items-center z-20">
        <button 
          onClick={handleAdminTap}
          className="group relative flex items-center gap-2.5 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-[#272a33] text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          title="Mode Admin (Ketuk 3x)"
        >
          <span className="text-sm md:text-base font-bold tracking-wide font-display pl-1">
            {adminTapCount > 0 ? `Admin ${adminTapCount}/3` : 'Page'}
          </span>
          <div className="flex items-center justify-center bg-white text-[#272a33] font-black text-xs md:text-sm px-2.5 py-0.5 rounded-full font-mono-tech">
            01
          </div>
        </button>
      </div>

      {/* Main Center Typography & 3D Artwork (Dead Center in Screen) */}
      <div className="w-full flex-1 flex items-center justify-center my-auto z-10">
        
        {/* Central Anchor Block */}
        <div className="relative inline-flex flex-col items-center justify-center text-center">
          
          {/* ================= 3D DONUT (POJOK KIRI ATAS HURUF 'S') ================= */}
          <div className="absolute -top-4 sm:-top-6 md:-top-9 left-4 sm:left-6 md:left-8 z-20 pointer-events-none animate-float">
            <svg 
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 overflow-visible" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 3D Bottom Shadow */}
              <circle cx="53" cy="53" r="36" fill="#1e2336" />
              {/* Outer Ring */}
              <circle cx="48" cy="48" r="36" fill="#e4ecfc" stroke="#1e2336" strokeWidth="6.5" />
              {/* Inner Hole with 3D shadow */}
              <circle cx="53" cy="53" r="15" fill="#1e2336" />
              <circle cx="48" cy="48" r="15" fill="#f3edd9" stroke="#1e2336" strokeWidth="6.5" />
              {/* White Highlight */}
              <path 
                d="M 28 34 A 24 24 0 0 1 58 24" 
                stroke="#ffffff" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />
            </svg>
          </div>

          {/* ================= 3D CROSS / PLUS (POJOK KANAN BAWAH HURUF 'H') ================= */}
          <div className="absolute -bottom-4 md:-bottom-7 -right-5 md:-right-8 z-20 pointer-events-none animate-float-reverse">
            <svg 
              className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 overflow-visible" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* 3D Extrusion Shadow */}
              <path
                d="M 34 12 L 66 12 L 66 34 L 88 34 L 88 66 L 66 66 L 66 88 L 34 88 L 34 66 L 12 66 L 12 34 L 34 34 Z"
                fill="#1e2336"
                transform="translate(5, 5) rotate(18 50 50)"
              />
              {/* Plus Body */}
              <path
                d="M 34 12 L 66 12 L 66 34 L 88 34 L 88 66 L 66 66 L 66 88 L 34 88 L 34 66 L 12 66 L 12 34 L 34 34 Z"
                fill="#bdd2f5"
                stroke="#1e2336"
                strokeWidth="6.5"
                strokeLinejoin="round"
                transform="rotate(18 50 50)"
              />
              {/* White Highlight */}
              <path
                d="M 40 22 L 60 22"
                stroke="#ffffff"
                strokeWidth="3.5"
                strokeLinecap="round"
                transform="rotate(18 50 50)"
              />
            </svg>
          </div>

          {/* Typography Container */}
          <div 
            className="flex flex-col items-center justify-center text-[#343a59] leading-[0.88] tracking-[-0.04em] uppercase select-none"
            style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Titan One', sans-serif" }}
          >
            {/* Row 1: SNAP */}
            <div className="text-[17vw] sm:text-[15vw] md:text-[145px] lg:text-[180px] font-black scale-y-95">
              SNAP
            </div>

            {/* Row 2: BOOTH */}
            <div className="text-[17vw] sm:text-[15vw] md:text-[145px] lg:text-[180px] font-black scale-y-95">
              BOOTH
            </div>
          </div>

          {/* ================= TILTED "Click to Start" BUTTON (DIGESER KE BAWAH) ================= */}
          <div className="absolute -bottom-6 sm:-bottom-8 md:-bottom-10 left-1/2 transform -translate-x-1/2 -rotate-[6.5deg] z-30">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startNewSession();
              }}
              className="px-8 sm:px-12 md:px-16 py-3 sm:py-4 md:py-4.5 rounded-full bg-[#272a33] text-white font-['Fredoka','Plus_Jakarta_Sans',sans-serif] font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-wide shadow-2xl shadow-slate-950/40 hover:bg-[#1a1c22] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-slate-700/40 cursor-pointer"
            >
              <span className="whitespace-nowrap select-none drop-shadow-sm">
                Click to Start
              </span>
            </button>
          </div>

        </div>

      </div>

      {/* Bottom Left: Instagram Handle */}
      <div className="w-full flex justify-between items-end z-20">
        <div className="flex items-center gap-2.5 md:gap-3">
          {/* Instagram Logo */}
          <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center p-1 md:p-1.5 shadow-sm">
            <svg 
              className="w-full h-full text-white fill-none stroke-current stroke-2" 
              viewBox="0 0 24 24" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </div>

          <span className="font-display font-extrabold text-sm sm:text-base md:text-lg text-[#272a33] tracking-wide">
            snapbooth.id
          </span>
        </div>

        {/* Subtle touch indicator for kiosk guests */}
        <div className="text-xs text-slate-500 font-mono-tech hidden sm:block font-medium">
          Sentuh layar untuk memulai sesi foto
        </div>
      </div>
    </div>
  );
}
