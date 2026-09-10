import React, { useState } from 'react';
import { useBooth } from '../context/BoothContext';
import { FRAME_TEMPLATES } from '../utils/canvasRenderer';
import { LayoutGrid, Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';

export default function FrameSelectionScreen() {
  const { selectedFrame, handleSelectFrame, setStep, STEPS } = useBooth();
  const [activeTemplate, setActiveTemplate] = useState(selectedFrame || FRAME_TEMPLATES[0]);

  return (
    <div className="w-full h-screen flex flex-col justify-between items-center p-8 bg-slate-950 text-white select-none">
      {/* Top Header */}
      <div className="w-full max-w-5xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">PILIH DESAIN FRAME</h2>
            <p className="text-slate-400 text-sm">Pilih format strip dan gaya warna yang kamu suka</p>
          </div>
        </div>

        <div className="px-4 py-1.5 rounded-full glass-card text-xs text-purple-300 font-mono-tech flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Langkah 2 dari 5</span>
        </div>
      </div>

      {/* Frame Selection Cards Grid */}
      <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-3 gap-6 my-auto overflow-y-auto max-h-[70vh] py-2 px-1">
        {FRAME_TEMPLATES.map((tmpl) => {
          const isSelected = activeTemplate.id === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => setActiveTemplate(tmpl)}
              className={`relative rounded-3xl p-5 cursor-pointer transition-all duration-300 flex flex-col items-center text-center ${
                isSelected 
                  ? 'glass-card-active scale-102 ring-2 ring-blue-500' 
                  : 'glass-card hover:bg-slate-800/80 hover:scale-101'
              }`}
            >
              {/* Badge Tag */}
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {tmpl.tag}
              </div>

              {/* Selected Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}

              {/* Visual Strip Miniature Mockup */}
              <div 
                className="w-24 h-44 rounded-xl shadow-lg border my-3 p-2 flex flex-col justify-between items-center transition-transform transform group-hover:scale-105"
                style={{
                  backgroundColor: tmpl.bgColor,
                  borderColor: tmpl.borderColor
                }}
              >
                {/* Header mock */}
                <div className="w-12 h-2 rounded-full" style={{ backgroundColor: tmpl.textColor, opacity: 0.6 }} />

                {/* Photo boxes */}
                {tmpl.type === 'strip-3' && (
                  <div className="w-full flex-1 flex flex-col gap-1.5 justify-center my-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-full h-8 rounded bg-slate-400/40 border border-black/10 flex items-center justify-center text-[8px] font-mono-tech" style={{ color: tmpl.textColor }}>
                        Pose {i}
                      </div>
                    ))}
                  </div>
                )}

                {tmpl.type === 'strip-4' && (
                  <div className="w-full flex-1 flex flex-col gap-1 justify-center my-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-full h-6 rounded bg-slate-400/40 border border-black/10 flex items-center justify-center text-[7px] font-mono-tech" style={{ color: tmpl.textColor }}>
                        Pose {i}
                      </div>
                    ))}
                  </div>
                )}

                {tmpl.type === 'grid-4' && (
                  <div className="w-full flex-1 grid grid-cols-2 gap-1 my-1 p-0.5">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-full h-11 rounded bg-slate-400/40 border border-black/10 flex items-center justify-center text-[7px] font-mono-tech" style={{ color: tmpl.textColor }}>
                        {i}
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer mock */}
                <div className="w-16 h-2 rounded-full" style={{ backgroundColor: tmpl.subtextColor, opacity: 0.5 }} />
              </div>

              {/* Template Info */}
              <h3 className="font-display font-bold text-lg text-white mt-1">{tmpl.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{tmpl.theme} • {tmpl.poses} Kali Pose</p>
              <span className="mt-2 text-[11px] font-mono-tech font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Format: {tmpl.aspectRatio} Inch
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Confirm Action */}
      <div className="w-full max-w-5xl flex justify-between items-center pt-4 border-t border-slate-800/80">
        <button
          onClick={() => setStep(STEPS.PAYMENT)}
          className="px-6 py-3.5 rounded-2xl glass-card hover:bg-white/10 text-slate-300 font-semibold flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        <button
          onClick={() => handleSelectFrame(activeTemplate)}
          className="px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-display font-bold text-lg shadow-xl shadow-purple-600/30 flex items-center gap-3 transition-all transform active:scale-95"
        >
          <span>Mulai Sesi Foto ({activeTemplate.poses} Pose)</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
