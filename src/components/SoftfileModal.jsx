import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { getSoftfileById } from '../utils/storageMock';
import { Download, Clock, AlertTriangle, CheckCircle2, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';

export default function SoftfileModal() {
  const { viewingSoftfileId, setViewingSoftfileId } = useBooth();
  const [photoData, setPhotoData] = useState(null);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!viewingSoftfileId) return;

    const data = getSoftfileById(viewingSoftfileId);
    if (!data) {
      setIsExpired(true);
      return;
    }

    setPhotoData(data);
    setIsExpired(false);

    const updateRemaining = () => {
      const remainingMs = data.expiresAt - Date.now();
      if (remainingMs <= 0) {
        setIsExpired(true);
        setTimeLeftStr('00:00 (Kedaluwarsa)');
      } else {
        const mins = Math.floor(remainingMs / (60 * 1000));
        const secs = Math.floor((remainingMs % (60 * 1000)) / 1000);
        setTimeLeftStr(`${mins} menit ${secs < 10 ? '0' : ''}${secs} detik`);
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [viewingSoftfileId]);

  if (!viewingSoftfileId) return null;

  const handleDownloadFull = () => {
    if (!photoData?.renderedPhoto) return;
    const link = document.createElement('a');
    link.href = photoData.renderedPhoto;
    link.download = `SnapBooth_${photoData.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPose = (poseSrc, index) => {
    const link = document.createElement('a');
    link.href = poseSrc;
    link.download = `SnapBooth_Pose_${index + 1}_${photoData.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-white my-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/30 text-purple-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">UNDUH SOFTFILE FOTO</h3>
              <p className="text-xs text-slate-400 font-mono-tech">ID: {viewingSoftfileId}</p>
            </div>
          </div>
          <button
            onClick={() => setViewingSoftfileId(null)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isExpired ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="font-display font-bold text-xl text-white mb-1">Masa Simpan Telah Habis</h4>
            <p className="text-sm text-slate-400 max-w-xs">
              Sesuai aturan sistem, softfile foto otomatis dihapus setelah 1 jam untuk menjaga privasi tamu.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center">
            {/* Expiry Badge */}
            <div className="w-full py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 font-mono-tech mb-4">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Masa Aktif Softfile:</span>
              </span>
              <span className="font-bold">{timeLeftStr}</span>
            </div>

            {/* Photo Strip Image */}
            <div className="max-h-[40vh] overflow-hidden rounded-xl border border-white/20 shadow-xl mb-4 bg-slate-950 flex justify-center">
              <img 
                src={photoData?.renderedPhoto} 
                alt="Softfile Preview" 
                className="max-h-[38vh] w-auto object-contain rounded-lg"
              />
            </div>

            {/* Download Full Strip */}
            <button
              onClick={handleDownloadFull}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 text-white font-display font-bold text-base shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mb-3 transition-transform active:scale-98"
            >
              <Download className="w-5 h-5" />
              <span>Unduh Foto Strip Lengkap (HD)</span>
            </button>

            {/* Individual Poses Download */}
            {photoData?.poses && photoData.poses.length > 0 && (
              <div className="w-full mt-2">
                <p className="text-xs text-slate-400 font-medium mb-2">Unduh Pose Satuan:</p>
                <div className="grid grid-cols-4 gap-2">
                  {photoData.poses.map((poseUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDownloadPose(poseUrl, idx)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex flex-col items-center gap-1 text-[10px] text-slate-300 transition-colors"
                    >
                      <img src={poseUrl} alt={`Pose ${idx + 1}`} className="w-full h-12 object-cover rounded" />
                      <span>Pose {idx + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setViewingSoftfileId(null)}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
