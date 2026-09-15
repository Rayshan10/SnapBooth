import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { getSoftfileById } from '../utils/storageMock';
import { Download, Clock, AlertTriangle, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';

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
    <div className="fixed inset-0 bg-[#272a33]/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white border-3 border-[#272a33] rounded-3xl p-6 shadow-[10px_10px_0px_#272a33] text-slate-900 my-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b-2 border-[#272a33]/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#272a33] text-white shadow-sm">
              <ImageIcon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 
                className="font-black text-lg text-[#343a59] uppercase tracking-tight"
                style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
              >
                UNDUH SOFTFILE FOTO
              </h3>
              <p className="text-xs text-slate-500 font-mono-tech">ID: {viewingSoftfileId}</p>
            </div>
          </div>
          <button
            onClick={() => setViewingSoftfileId(null)}
            className="p-2 rounded-full hover:bg-slate-100 text-[#272a33] border border-[#272a33] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isExpired ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#fda4af] border-2 border-[#272a33] text-[#272a33] flex items-center justify-center mb-4 shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 
              className="font-black text-xl text-[#343a59] mb-1 uppercase"
              style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
            >
              Masa Simpan Telah Habis
            </h4>
            <p className="text-xs text-slate-600 max-w-xs mt-2 leading-relaxed font-medium">
              Sesuai aturan sistem, softfile foto otomatis dihapus setelah 1 jam untuk menjaga privasi tamu.
            </p>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center">
            {/* Expiry Badge */}
            <div className="w-full py-2 px-3.5 rounded-xl bg-[#fef08a] border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] flex items-center justify-between text-xs text-[#272a33] font-mono-tech mb-4 font-bold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Masa Aktif Softfile:</span>
              </span>
              <span>{timeLeftStr}</span>
            </div>

            {/* Photo Strip Image */}
            <div className="max-h-[38vh] overflow-hidden rounded-2xl border-2 border-[#272a33] shadow-md mb-4 bg-slate-50 p-1 flex justify-center">
              <img 
                src={photoData?.renderedPhoto} 
                alt="Softfile Preview" 
                className="max-h-[36vh] w-auto object-contain rounded-xl"
              />
            </div>

            {/* Download Full Strip */}
            <button
              onClick={handleDownloadFull}
              className="w-full py-3.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#3b82f6] font-display font-black text-sm flex items-center justify-center gap-2 mb-3 transition-transform active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Unduh Foto Strip Lengkap (HD)</span>
            </button>

            {/* Individual Poses Download */}
            {photoData?.poses && photoData.poses.length > 0 && (
              <div className="w-full mt-1">
                <p className="text-xs text-slate-600 font-bold mb-2">Unduh Pose Satuan:</p>
                <div className="grid grid-cols-4 gap-2">
                  {photoData.poses.map((poseUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDownloadPose(poseUrl, idx)}
                      className="p-1 rounded-xl bg-white hover:bg-[#fff9db] border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] flex flex-col items-center gap-1 text-[10px] text-[#272a33] font-bold font-mono-tech transition-all cursor-pointer"
                    >
                      <img src={poseUrl} alt={`Pose ${idx + 1}`} className="w-full h-12 object-cover rounded-lg border border-[#272a33]" />
                      <span>Pose {idx + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-3 border-t-2 border-[#272a33]/15 flex justify-end">
          <button
            onClick={() => setViewingSoftfileId(null)}
            className="px-5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-[#272a33] text-[#272a33] text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
