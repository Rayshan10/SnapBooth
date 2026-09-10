import React, { useState } from 'react';
import { useBooth } from '../context/BoothContext';
import { FILTERS } from '../utils/filterEngine';
import { Wand2, Sparkles, Check, ArrowRight, Loader2 } from 'lucide-react';

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
    <div className="w-full h-screen flex flex-col justify-between items-center p-6 bg-slate-950 text-white select-none">
      {/* Top Header */}
      <div className="w-full max-w-5xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-500/20 text-pink-400">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">PILIH FILTER FOTO (OPSIONAL)</h2>
            <p className="text-slate-400 text-sm">Sesuaikan tone warna foto agar makin aesthetic</p>
          </div>
        </div>

        <div className="px-4 py-1.5 rounded-full glass-card text-xs text-pink-300 font-mono-tech flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Langkah 4 dari 5</span>
        </div>
      </div>

      {/* Main Preview Grid of All Poses with Active Filter */}
      <div className="w-full max-w-4xl my-auto flex flex-col items-center">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl glass-panel border border-slate-700/80 shadow-2xl max-h-[44vh] overflow-hidden">
          {capturedPhotos.map((photoSrc, idx) => (
            <div 
              key={idx} 
              className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-slate-900 shadow-md border border-white/10"
            >
              <img
                src={photoSrc}
                alt={`Pose ${idx + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
                style={{
                  filter: activeFilterObj.cssFilter !== 'none' ? activeFilterObj.cssFilter : undefined
                }}
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono-tech font-bold text-white">
                Pose {idx + 1}
              </span>
            </div>
          ))}
        </div>

        <p className="text-slate-400 text-xs font-mono-tech mt-3">
          Filter Terpilih: <span className="text-pink-400 font-bold">{activeFilterObj.name}</span> — {activeFilterObj.description}
        </p>
      </div>

      {/* Filter Presets Carousel / Selector */}
      <div className="w-full max-w-4xl flex items-center justify-center gap-3 overflow-x-auto py-2 px-1">
        {FILTERS.map((f) => {
          const isSelected = selectedFilterId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFilterId(f.id)}
              className={`flex-1 min-w-[130px] p-3 rounded-2xl transition-all duration-200 flex flex-col items-center text-center cursor-pointer ${
                isSelected 
                  ? 'glass-card-active border-2 border-pink-500 scale-105 ring-2 ring-pink-500/40 shadow-lg shadow-pink-500/20' 
                  : 'glass-card hover:bg-slate-800'
              }`}
            >
              {/* Color Swatch / Dot */}
              <div 
                className="w-8 h-8 rounded-full mb-2 flex items-center justify-center border-2 border-white/20 shadow-sm"
                style={{ backgroundColor: f.previewColor }}
              >
                {isSelected && <Check className="w-4 h-4 text-slate-900 stroke-[3]" />}
              </div>

              <h4 className="font-display font-bold text-sm text-white">{f.name}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">{f.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="w-full max-w-4xl flex justify-between items-center pt-4 border-t border-slate-800/80">
        <button
          onClick={() => setSelectedFilterId('normal')}
          className="px-6 py-3.5 rounded-2xl glass-card hover:bg-white/10 text-slate-300 font-semibold text-sm"
        >
          Reset ke Normal (Tanpa Filter)
        </button>

        <button
          disabled={isCompositing}
          onClick={handleConfirm}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 hover:from-pink-500 hover:to-blue-500 text-white font-display font-bold text-lg shadow-xl shadow-purple-600/30 flex items-center gap-3 transition-transform transform active:scale-95 disabled:opacity-50"
        >
          {isCompositing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Memproses & Render Frame...</span>
            </>
          ) : (
            <>
              <span>Cetak & Buat Softfile QR</span>
              <ArrowRight className="w-6 h-6" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
