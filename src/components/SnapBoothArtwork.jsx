import React from 'react';

export default function SnapBoothArtwork({ onStartClick }) {
  const navyColor = '#343a57';
  const strokeColor = '#23283b';
  const gridBgColor = '#f3edd9';

  return (
    <div className="relative w-full max-w-[940px] flex flex-col items-center justify-center select-none">
      <svg 
        viewBox="0 0 920 490" 
        className="w-full h-auto overflow-visible drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle 3D Shadows for Cutout/Lettering */}
          <filter id="shadow-3d" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="4" dy="5" stdDeviation="0" floodColor="#212638" />
          </filter>
        </defs>

        {/* ================= SNAP (TOP LINE) ================= */}
        <g fill={navyColor}>
          {/* S */}
          <path 
            d="M 125 150 
               C 120 185, 145 210, 205 210 
               C 275 210, 290 180, 290 155 
               C 290 120, 255 105, 185 90 
               C 135 80, 115 65, 115 45 
               C 115 20, 145 5, 200 5 
               C 255 5, 280 25, 285 55 
               L 215 60 
               C 212 42, 198 35, 180 35 
               C 160 35, 145 45, 145 60 
               C 145 80, 175 90, 230 102 
               C 285 115, 315 135, 315 170 
               C 315 215, 270 238, 200 238 
               C 130 238, 95 205, 95 155 
               Z" 
          />

          {/* N */}
          <path 
            d="M 335 15 
               L 395 15 
               L 485 160 
               L 485 15 
               L 540 15 
               L 540 230 
               L 480 230 
               L 390 85 
               L 390 230 
               L 335 230 
               Z" 
          />

          {/* A */}
          <path 
            d="M 625 15 
               L 690 15 
               L 775 230 
               L 710 230 
               L 690 175 
               L 625 175 
               L 605 230 
               L 540 230 
               Z 
               M 640 130 
               L 675 130 
               L 658 65 
               Z" 
          />

          {/* P */}
          <path 
            d="M 785 15 
               L 890 15 
               C 940 15, 965 45, 965 90 
               C 965 135, 935 165, 875 165 
               L 845 165 
               L 845 230 
               L 785 230 
               Z 
               M 845 65 
               L 870 65 
               C 895 65, 905 75, 905 90 
               C 905 105, 895 115, 870 115 
               L 845 115 
               Z" 
          />
        </g>

        {/* ================= BOOTH (BOTTOM LINE) ================= */}
        <g fill={navyColor}>
          {/* B */}
          <path 
            d="M 70 245 
               L 185 245 
               C 225 245, 245 268, 245 295 
               C 245 315, 235 330, 215 338 
               C 240 348, 252 368, 252 395 
               C 252 435, 220 460, 175 460 
               L 70 460 
               Z" 
          />
          {/* Top Slit in B */}
          <rect x="125" y="278" width="18" height="42" rx="9" fill={gridBgColor} />
          {/* Bottom Slit in B */}
          <rect x="125" y="365" width="18" height="44" rx="9" fill={gridBgColor} />

          {/* O (First) */}
          <rect x="270" y="245" width="180" height="215" rx="80" fill={navyColor} />
          {/* Slit in First O */}
          <rect x="350" y="295" width="20" height="115" rx="10" fill={gridBgColor} />

          {/* O (Second) */}
          <rect x="475" y="245" width="180" height="215" rx="80" fill={navyColor} />
          {/* Slit in Second O */}
          <rect x="555" y="295" width="20" height="115" rx="10" fill={gridBgColor} />

          {/* T */}
          <path 
            d="M 680 245 
               L 820 245 
               L 820 300 
               L 780 300 
               L 780 460 
               L 720 460 
               L 720 300 
               L 680 300 
               Z" 
          />

          {/* H */}
          <path 
            d="M 835 245 
               L 895 245 
               L 895 325 
               L 950 325 
               L 950 245 
               L 1010 245 
               L 1010 460 
               L 950 460 
               L 950 380 
               L 895 380 
               L 895 460 
               L 835 460 
               Z" 
          />
        </g>

        {/* ================= 3D DONUT (TOP LEFT OVER 'S') ================= */}
        <g className="animate-float" transform="translate(60, 20)">
          {/* 3D Drop Shadow */}
          <circle cx="56" cy="56" r="44" fill="#212638" />
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="44" fill="#e2ebfc" stroke={strokeColor} strokeWidth="8" />
          {/* Inner Cutout with 3D shadow */}
          <circle cx="56" cy="56" r="19" fill="#212638" />
          <circle cx="50" cy="50" r="19" fill={gridBgColor} stroke={strokeColor} strokeWidth="8" />
          {/* Highlight Glint */}
          <path 
            d="M 28 35 A 30 30 0 0 1 65 22" 
            stroke="#ffffff" 
            strokeWidth="5" 
            strokeLinecap="round" 
          />
        </g>

        {/* ================= 3D CROSS / PLUS (BOTTOM RIGHT OVER 'H') ================= */}
        <g className="animate-float-reverse" transform="translate(860, 310)">
          {/* 3D Extrusion Layer */}
          <path
            d="M 32 6 L 68 6 L 68 32 L 94 32 L 94 68 L 68 68 L 68 94 L 32 94 L 32 68 L 6 68 L 6 32 L 32 32 Z"
            fill="#212638"
            transform="translate(6, 7) rotate(18 50 50)"
          />
          {/* Main Plus Body */}
          <path
            d="M 32 6 L 68 6 L 68 32 L 94 32 L 94 68 L 68 68 L 68 94 L 32 94 L 32 68 L 6 68 L 6 32 L 32 32 Z"
            fill="#b9d0f3"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinejoin="round"
            transform="rotate(18 50 50)"
          />
          {/* Highlight */}
          <path
            d="M 38 18 L 62 18"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            transform="rotate(18 50 50)"
          />
        </g>
      </svg>

      {/* ================= TILTED "Click to Start" BUTTON ================= */}
      <div className="absolute bottom-[2%] left-1/2 transform -translate-x-1/2 -rotate-[6.5deg] z-30 group cursor-pointer">
        <button
          onClick={onStartClick}
          className="px-10 sm:px-14 md:px-16 py-3.5 sm:py-4 md:py-5 rounded-full bg-[#272a33] text-white font-display font-black text-2xl sm:text-3xl md:text-4xl tracking-wide shadow-2xl shadow-slate-950/50 hover:bg-[#1a1c22] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-slate-700/50 flex items-center justify-center"
        >
          <span className="whitespace-nowrap select-none drop-shadow-sm">
            Click to Start
          </span>
        </button>
      </div>
    </div>
  );
}
