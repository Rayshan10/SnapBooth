import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { LayoutGrid, Check, ArrowRight, Sparkles, Printer, Plus, Minus, Layers, Tag } from 'lucide-react';

export default function FrameSelectionScreen() {
  const { 
    availableFrames, 
    selectedFrame, 
    handleSelectFrameAndProceed,
    sessionCopies,
    eventSettings 
  } = useBooth();

  const [activeTemplate, setActiveTemplate] = useState(() => selectedFrame || availableFrames[0]);

  // Multi-print config
  const defaultCopies = Math.max(1, Number(eventSettings.defaultPrintCopies) || 2);
  const maxCopies = Math.max(defaultCopies, Number(eventSettings.maxPrintCopies) || 6);
  const allowSelectCopies = eventSettings.allowGuestSelectCopies !== false;
  const isPaidExtra = eventSettings.extraCopyMode === 'paid';
  const extraPricePerCopy = Number(eventSettings.extraCopyPrice) || 10000;

  const [chosenCopies, setChosenCopies] = useState(() => sessionCopies || defaultCopies);

  // Sync if available frames change
  useEffect(() => {
    if (!availableFrames.some(f => f.id === activeTemplate?.id)) {
      setActiveTemplate(availableFrames[0] || selectedFrame);
    }
  }, [availableFrames]);

  const framesToDisplay = availableFrames && availableFrames.length > 0 ? availableFrames : [selectedFrame];

  // Price Calculation for Display
  const basePrice = Number(eventSettings.price) || 35000;
  const extraCopiesCount = Math.max(0, chosenCopies - defaultCopies);
  const extraCost = isPaidExtra ? (extraCopiesCount * extraPricePerCopy) : 0;
  const estimatedTotal = basePrice + extraCost;
  const isFreeMode = eventSettings.eventMode === 'free';

  // Available preset copy options (e.g. 2, 4, 6)
  const presetOptions = [defaultCopies];
  if (defaultCopies * 2 <= maxCopies) presetOptions.push(defaultCopies * 2);
  if (defaultCopies * 3 <= maxCopies) presetOptions.push(defaultCopies * 3);
  if (!presetOptions.includes(maxCopies) && maxCopies > defaultCopies) presetOptions.push(maxCopies);

  return (
    <div className="relative w-full h-screen flex flex-col justify-between items-center p-5 md:p-8 bg-grid-notebook text-slate-900 overflow-hidden select-none">
      
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
      <div className="absolute bottom-20 left-6 sm:left-10 z-0 pointer-events-none animate-float-reverse opacity-80">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#1e2336" transform="translate(4, 5) rotate(-12 50 50)" />
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#fda4af" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" transform="rotate(-12 50 50)" />
        </svg>
      </div>

      {/* 4. 3D Lightning Bolt (Kanan Bawah) */}
      <div className="absolute bottom-20 right-8 sm:right-12 z-0 pointer-events-none animate-float opacity-80">
        <svg className="w-9 h-11 sm:w-11 sm:h-14 overflow-visible" viewBox="0 0 100 120" fill="none">
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#1e2336" transform="translate(4, 4) rotate(8 50 60)" />
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#fde047" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" transform="rotate(8 50 60)" />
        </svg>
      </div>

      {/* ================= TOP HEADER ================= */}
      <div className="w-full max-w-6xl flex justify-between items-center z-20">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-[#272a33] text-white shadow-md">
            <LayoutGrid className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
          </div>
          <div>
            <h2 
              className="text-xl sm:text-2xl md:text-3xl font-black text-[#343a59] leading-tight tracking-tight uppercase"
              style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Fredoka', sans-serif" }}
            >
              PILIH DESAIN FRAME
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Pilih template favorit & tentukan jumlah cetakan fotomu
            </p>
          </div>
        </div>

        {/* Page 02 Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#272a33] text-white shadow-md">
            <span className="text-xs sm:text-sm font-bold tracking-wide font-display pl-1">Page</span>
            <div className="flex items-center justify-center bg-white text-[#272a33] font-black text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-mono-tech">
              02
            </div>
          </div>
        </div>
      </div>

      {/* ================= FRAME CARDS GRID ================= */}
      <div className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 my-auto overflow-y-auto max-h-[50vh] sm:max-h-[52vh] py-2 px-1 z-10">
        {framesToDisplay.map((tmpl) => {
          const isSelected = activeTemplate?.id === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => setActiveTemplate(tmpl)}
              className={`relative rounded-3xl p-3 cursor-pointer transition-all duration-200 flex flex-col items-center text-center bg-white ${
                isSelected 
                  ? 'border-3 border-[#272a33] shadow-[8px_8px_0px_#3b82f6] ring-2 ring-[#3b82f6] scale-[1.03] bg-[#fffef7]' 
                  : 'border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] hover:shadow-[6px_6px_0px_#272a33] hover:scale-[1.01]'
              }`}
            >
              {/* Badge Tag on Top-Left */}
              <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold border border-[#272a33] font-mono-tech ${
                tmpl.isCustom ? 'bg-[#fef08a] text-[#272a33]' : 'bg-[#e4ecfc] text-[#272a33]'
              }`}>
                {tmpl.tag || (tmpl.isCustom ? 'Custom' : 'Preset')}
              </div>

              {/* Selected Checkmark Badge on Top-Right */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#272a33] text-white flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Visual Strip Miniature Mockup */}
              <div 
                className="relative w-18 h-36 sm:w-20 sm:h-38 rounded-xl shadow-md border-2 border-[#272a33] my-2 p-1 flex flex-col justify-between items-center transition-transform overflow-hidden"
                style={{
                  backgroundColor: tmpl.bgColor || '#ffffff',
                  borderColor: tmpl.borderColor || '#272a33'
                }}
              >
                {/* Header mock if no custom overlay */}
                {!tmpl.overlayImage && (
                  <div className="w-10 h-1.5 rounded-full" style={{ backgroundColor: tmpl.textColor || '#1e293b', opacity: 0.6 }} />
                )}

                {/* Photo boxes */}
                {tmpl.type === 'strip-3' && (
                  <div className="w-full flex-1 flex flex-col gap-1 justify-center my-0.5 z-0">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-full h-7 rounded bg-slate-300/70 border border-black/10 flex items-center justify-center text-[7px] font-mono-tech" style={{ color: tmpl.textColor }}>
                        Pose {i}
                      </div>
                    ))}
                  </div>
                )}

                {tmpl.type === 'strip-4' && (
                  <div className="w-full flex-1 flex flex-col gap-0.5 justify-center my-0.5 z-0">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-full h-5 rounded bg-slate-300/70 border border-black/10 flex items-center justify-center text-[6px] font-mono-tech" style={{ color: tmpl.textColor }}>
                        Pose {i}
                      </div>
                    ))}
                  </div>
                )}

                {tmpl.type === 'grid-4' && (
                  <div className="w-full flex-1 grid grid-cols-2 gap-1 my-0.5 p-0.5 z-0">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-full h-9 rounded bg-slate-300/70 border border-black/10 flex items-center justify-center text-[6px] font-mono-tech" style={{ color: tmpl.textColor }}>
                        {i}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer mock if no custom overlay */}
                {!tmpl.overlayImage && (
                  <div className="w-10 h-1 rounded-full" style={{ backgroundColor: tmpl.subtextColor || '#64748b', opacity: 0.5 }} />
                )}

                {/* Custom Overlay Image on Top of Mockup */}
                {tmpl.overlayImage && (
                  <img 
                    src={tmpl.overlayImage} 
                    alt={tmpl.name} 
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" 
                  />
                )}
              </div>

              {/* Template Info */}
              <h3 className="font-display font-extrabold text-xs text-[#343a59] mt-0.5 leading-snug line-clamp-1">
                {tmpl.name}
              </h3>
              <p className="text-[10px] text-slate-600 mt-0.5 font-medium line-clamp-1">
                {tmpl.poses} Pose • {tmpl.theme || 'Custom Event'}
              </p>
              
              {/* Format Badge */}
              <span className="mt-1.5 text-[9px] font-mono-tech font-bold px-2 py-0.5 rounded-full bg-[#f4eedb] border border-[#272a33] text-[#272a33]">
                {tmpl.aspectRatio || (tmpl.type === 'grid-4' ? '4:6' : '2:6')} Inch
              </span>
            </div>
          );
        })}
      </div>

      {/* ================= COPIES & UP-SELLING SELECTOR PANEL ================= */}
      {allowSelectCopies && (
        <div className="w-full max-w-6xl z-20 my-1 bg-white border-2 border-[#272a33] rounded-2xl p-3 shadow-[4px_4px_0px_#272a33] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 border border-purple-300">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-[#272a33] uppercase flex items-center gap-1.5 font-display">
                <span>PILIH JUMLAH CETAK FOTO</span>
                {isPaidExtra && (
                  <span className="text-[10px] font-mono-tech font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Bawaan: {defaultCopies} Lbr
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {isPaidExtra 
                  ? `Paket sudah termasuk ${defaultCopies} lembar cetak. Tambahan: +Rp ${extraPricePerCopy.toLocaleString('id-ID')}/lbr` 
                  : `Tentukan berapa lembar strip foto fisik yang ingin kamu cetak`}
              </p>
            </div>
          </div>

          {/* Quick Preset Buttons & Stepper */}
          <div className="flex items-center gap-2">
            {/* Presets */}
            <div className="flex items-center gap-1.5">
              {presetOptions.map((opt) => {
                const isSelected = chosenCopies === opt;
                const extraForOpt = Math.max(0, opt - defaultCopies);
                const extraPriceOpt = isPaidExtra ? extraForOpt * extraPricePerCopy : 0;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setChosenCopies(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#272a33] text-[#fef08a] border-[#272a33] shadow-[2px_2px_0px_#272a33] scale-105'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span>{opt} Lembar</span>
                    {extraPriceOpt > 0 && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-mono-tech font-bold ${
                        isSelected ? 'bg-amber-300 text-[#272a33]' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        +Rp {(extraPriceOpt / 1000)}k
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Stepper (+ / -) */}
            <div className="flex items-center bg-slate-100 rounded-xl border border-slate-300 p-0.5 ml-1">
              <button
                type="button"
                onClick={() => setChosenCopies(Math.max(1, chosenCopies - 1))}
                disabled={chosenCopies <= 1}
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 font-bold disabled:opacity-30 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-black font-mono-tech text-[#272a33]">
                {chosenCopies}x
              </span>
              <button
                type="button"
                onClick={() => setChosenCopies(Math.min(maxCopies, chosenCopies + 1))}
                disabled={chosenCopies >= maxCopies}
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 font-bold disabled:opacity-30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM ACTION BAR ================= */}
      <div className="w-full max-w-6xl flex justify-between items-center pt-2 sm:pt-3 border-t-2 border-[#272a33]/20 z-20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">
            Frame: <strong className="text-slate-900">{activeTemplate?.name}</strong> ({activeTemplate?.poses} Pose)
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-600 font-medium">
            Cetak: <strong className="text-purple-700 font-black">{chosenCopies} Lembar</strong>
          </span>
        </div>

        <button
          onClick={() => handleSelectFrameAndProceed(activeTemplate, chosenCopies)}
          className="px-8 sm:px-12 py-3 sm:py-3.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-3 border-[#272a33] shadow-[4px_4px_0px_#3b82f6] font-display font-black text-xs sm:text-sm tracking-wide flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isFreeMode ? (
            <>
              <span>Mulai Sesi Foto ({activeTemplate.poses} Pose)</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Lanjut ke Pembayaran • Rp {estimatedTotal.toLocaleString('id-ID')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

