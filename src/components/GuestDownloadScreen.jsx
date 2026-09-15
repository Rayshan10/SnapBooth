import React, { useState, useEffect } from 'react';
import { Download, Clock, Sparkles, CheckCircle2, Image as ImageIcon, Heart, ArrowDownToLine, Share2 } from 'lucide-react';

export default function GuestDownloadScreen({ photoId }) {
  const [photoUrl, setPhotoUrl] = useState(`/uploads/${photoId}.jpg`);
  const [poses, setPoses] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    // Check if pose files exist
    const poseList = [1, 2, 3, 4].map(idx => `/uploads/${photoId}_pose_${idx}.jpg`);
    setPoses(poseList);
  }, [photoId]);

  // Direct trigger download on mobile
  const handleDownloadMain = async () => {
    setDownloading(true);
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `SnapBooth_${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      // Direct navigation fallback
      window.location.href = photoUrl;
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSinglePose = async (poseUrl, index) => {
    try {
      const response = await fetch(poseUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `SnapBooth_Pose_${index + 1}_${photoId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(poseUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f3edd9] bg-grid-notebook text-slate-900 p-4 sm:p-6 flex flex-col items-center justify-between selection:bg-amber-200">
      
      {/* Background Stickers */}
      <div className="absolute top-4 left-4 z-0 pointer-events-none opacity-80">
        <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#fef08a" stroke="#1e2336" strokeWidth="6" />
        </svg>
      </div>

      <div className="absolute top-4 right-4 z-0 pointer-events-none opacity-80">
        <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="38" fill="#fda4af" stroke="#1e2336" strokeWidth="6" />
        </svg>
      </div>

      {/* Header */}
      <header className="w-full max-w-md text-center pt-2 pb-4 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#272a33] text-white text-xs font-mono-tech font-bold mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>SNAPBOOTH PHOTOBOOTH</span>
        </div>
        
        <h1 
          className="text-2xl sm:text-3xl font-black text-[#343a59] leading-tight uppercase tracking-tight"
          style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
        >
          UNDUH SOFTFILE HD
        </h1>
        <p className="text-slate-600 text-xs mt-1 font-medium">
          Foto kamu siap disimpan langsung ke Galeri HP
        </p>

        {/* 1-Hour TTL notice */}
        <div className="mt-3 py-1.5 px-3 rounded-xl bg-[#fef08a] border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] inline-flex items-center gap-2 text-xs font-bold font-mono-tech text-[#272a33]">
          <Clock className="w-3.5 h-3.5" />
          <span>Masa aktif foto: 1 Jam</span>
        </div>
      </header>

      {/* Main Card: Photo Strip Preview */}
      <main className="w-full max-w-sm flex flex-col items-center z-10 my-2">
        <div className="w-full p-4 rounded-3xl bg-white border-3 border-[#272a33] shadow-[8px_8px_0px_#272a33] flex flex-col items-center">
          
          {/* Photo Frame */}
          <div className="relative max-h-[52vh] overflow-hidden rounded-2xl border-2 border-[#272a33] shadow-md bg-slate-50 flex items-center justify-center p-1">
            <img 
              src={photoUrl} 
              alt="SnapBooth Strip" 
              className="max-h-[49vh] w-auto object-contain rounded-xl"
              onError={(e) => {
                // Fallback to direct url
                e.target.onerror = null;
              }}
            />
          </div>

          {/* Success Download Alert */}
          {downloadSuccess && (
            <div className="w-full mt-3 py-2 px-3 rounded-xl bg-[#a7f3d0] border-2 border-[#272a33] text-[#272a33] text-xs font-bold font-mono-tech flex items-center justify-center gap-2 animate-bounce-subtle">
              <CheckCircle2 className="w-4 h-4 text-emerald-800" />
              <span>Foto berhasil diunduh ke HP kamu!</span>
            </div>
          )}

          {/* Big Download Button */}
          <button
            onClick={handleDownloadMain}
            disabled={downloading}
            className="w-full mt-4 py-4 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-3 border-[#272a33] shadow-[4px_4px_0px_#3b82f6] font-display font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-3 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <ArrowDownToLine className="w-5 h-5 text-amber-300 stroke-[3]" />
            <span>{downloading ? 'Mengunduh...' : 'Simpan / Download Foto HD'}</span>
          </button>

          {/* Helpful Mobile Tip */}
          <div className="mt-3 p-2.5 rounded-xl bg-[#f4eedb] border border-[#272a33]/30 text-[#272a33] text-[11px] leading-relaxed text-center font-medium">
            💡 <strong>Tips iPhone & Android:</strong> Jika foto tidak otomatis terunduh, tekan & tahan foto di atas lalu pilih <strong>"Simpan ke Foto"</strong> (Save Image).
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-3 z-10">
        <p className="text-[11px] text-slate-500 font-mono-tech">
          © {new Date().getFullYear()} SnapBooth • All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
