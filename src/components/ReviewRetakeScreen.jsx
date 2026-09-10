import React from 'react';
import { useBooth } from '../context/BoothContext';
import { RotateCcw, Check, AlertCircle, Sparkles, Camera } from 'lucide-react';

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
    <div className="w-full h-screen flex flex-col justify-between items-center p-6 bg-slate-950 text-white select-none">
      {/* Top Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">HASIL POSE {currentPoseIndex + 1} DARI {totalPoses}</h2>
            <p className="text-slate-400 text-sm">Periksa hasil jepretan sebelum lanjut ke sesi berikutnya</p>
          </div>
        </div>

        {/* Retake badge quota */}
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-sm font-mono-tech ${
          canRetake 
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span>Sisa Kesempatan Ulang: {remainingRetakes}x</span>
        </div>
      </div>

      {/* Center Image Preview Box */}
      <div className="relative max-h-[60vh] max-w-2xl w-full my-auto rounded-3xl overflow-hidden glass-panel border-2 border-slate-700/80 shadow-2xl flex items-center justify-center p-3 bg-black/60">
        {photo ? (
          <img 
            src={photo} 
            alt={`Pose ${currentPoseIndex + 1}`} 
            className="max-h-[55vh] w-auto object-contain rounded-2xl shadow-lg"
          />
        ) : (
          <div className="p-12 text-slate-400 text-center">Foto tidak tersedia</div>
        )}
      </div>

      {/* Retake Status Notice if quota exceeded */}
      {!canRetake && (
        <div className="w-full max-w-md py-2.5 px-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-center text-xs font-semibold mb-2 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>Batas 2x foto ulang telah tercapai. Foto ini akan otomatis digunakan.</span>
        </div>
      )}

      {/* Bottom Action Controls */}
      <div className="w-full max-w-2xl flex gap-4 items-center justify-center pt-2">
        {/* Retake Button (Conditional Disabled) */}
        <button
          onClick={handleRetakePose}
          disabled={!canRetake}
          className={`flex-1 py-4 px-6 rounded-2xl font-display font-bold text-base flex items-center justify-center gap-3 transition-all ${
            canRetake
              ? 'glass-card hover:bg-slate-800 border-amber-500/40 text-amber-300 hover:border-amber-500 active:scale-98'
              : 'opacity-40 bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
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
          className="flex-1 py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-display font-bold text-lg shadow-xl shadow-purple-600/30 flex items-center justify-center gap-3 transition-transform transform active:scale-98"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>
            {isLastPose ? 'Selesai & Pilih Filter' : `Lanjut ke Pose ${currentPoseIndex + 2}`}
          </span>
        </button>
      </div>
    </div>
  );
}
