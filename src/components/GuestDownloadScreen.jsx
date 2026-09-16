import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Film, 
  Image as ImageIcon, 
  Video, 
  FileArchive, 
  ArrowDownToLine, 
  Share2, 
  Layers, 
  Eye,
  Check
} from 'lucide-react';

export default function GuestDownloadScreen({ photoId }) {
  const [activeTab, setActiveTab] = useState('strip'); // 'strip' | 'video' | 'gif' | 'poses'
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [hasVideo, setHasVideo] = useState(true);
  const [hasGif, setHasGif] = useState(true);
  const [poses, setPoses] = useState([]);

  const stripUrl = `/uploads/${photoId}.jpg`;
  const videoMp4Url = `/uploads/${photoId}_motion.mp4`;
  const videoWebmUrl = `/uploads/${photoId}_motion.webm`;
  const gifUrl = `/uploads/${photoId}_boomerang.gif`;
  const zipUrl = `/uploads/${photoId}_bundle.zip`;

  useEffect(() => {
    // Check available pose files (up to 4)
    const list = [1, 2, 3, 4].map(idx => `/uploads/${photoId}_pose_${idx}.jpg`);
    setPoses(list);
  }, [photoId]);

  // Generic direct file download trigger
  const triggerDownload = async (url, filename, statusLabel = 'File') => {
    setDownloading(true);
    setDownloadStatus(`Mengunduh ${statusLabel}...`);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadStatus(`✅ Berhasil mengunduh ${statusLabel}!`);
      setTimeout(() => setDownloadStatus(''), 4000);
    } catch (err) {
      console.warn('Direct blob download failed, opening url in new tab:', err);
      window.open(url, '_blank');
      setDownloadStatus(`✅ Mengunduh ${statusLabel}...`);
      setTimeout(() => setDownloadStatus(''), 4000);
    } finally {
      setDownloading(false);
    }
  };

  // Download All Assets in 1-Click ZIP
  const handleDownloadZipBundle = () => {
    triggerDownload(zipUrl, `SnapBooth_Paket_Lengkap_${photoId}.zip`, 'Paket Lengkap (.ZIP)');
  };

  // Download Main Strip
  const handleDownloadStrip = () => {
    triggerDownload(stripUrl, `SnapBooth_PhotoStrip_${photoId}.jpg`, 'Foto Strip HD');
  };

  // Download Live Motion Video (MP4)
  const handleDownloadVideo = () => {
    triggerDownload(videoMp4Url, `SnapBooth_LiveMotion_${photoId}.mp4`, 'Live Motion Video (MP4)');
  };

  // Download GIF Boomerang
  const handleDownloadGif = () => {
    triggerDownload(gifUrl, `SnapBooth_Boomerang_${photoId}.gif`, 'GIF Boomerang');
  };

  // Download Pose Satuan
  const handleDownloadPose = (poseUrl, index) => {
    triggerDownload(poseUrl, `SnapBooth_Pose_${index + 1}_${photoId}.jpg`, `Foto Pose ke-${index + 1}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#f3edd9] bg-grid-notebook text-slate-900 p-4 sm:p-6 flex flex-col items-center justify-between selection:bg-amber-200">
      
      {/* Decorative Stickers */}
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
      <header className="w-full max-w-md text-center pt-2 pb-3 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#272a33] text-white text-xs font-mono-tech font-bold mb-2 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>SNAPBOOTH PHOTOBOOTH</span>
        </div>
        
        <h1 
          className="text-2xl sm:text-3xl font-black text-[#343a59] leading-tight uppercase tracking-tight"
          style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
        >
          PAKET LENGKAP SOFTFILE
        </h1>
        <p className="text-slate-600 text-xs mt-1 font-medium">
          Unduh Foto Strip, Video Gerak, GIF Boomerang, & Pose Satuan
        </p>

        {/* 1-Hour TTL notice */}
        <div className="mt-2.5 py-1 px-3 rounded-xl bg-[#fef08a] border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] inline-flex items-center gap-2 text-xs font-bold font-mono-tech text-[#272a33]">
          <Clock className="w-3.5 h-3.5" />
          <span>Masa aktif softfile: 1 Jam</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md flex flex-col items-center z-10 my-2">

        {/* 1-CLICK ALL-IN-ONE ZIP DOWNLOAD BUTTON */}
        <div className="w-full mb-4">
          <button
            onClick={handleDownloadZipBundle}
            disabled={downloading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#38bdf8] text-[#1e2336] hover:bg-[#0284c7] hover:text-white border-3 border-[#272a33] shadow-[4px_4px_0px_#272a33] font-display font-black text-sm sm:text-base tracking-wide flex items-center justify-center gap-3 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <FileArchive className="w-5 h-5 stroke-[2.5]" />
            <div className="text-left leading-tight">
              <span className="block font-black text-xs sm:text-sm uppercase">📥 Download Semua Sekaligus (.ZIP)</span>
              <span className="block text-[10px] font-mono-tech opacity-80">Isi: Strip HD + Live Video + GIF + Poses</span>
            </div>
          </button>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="w-full grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] mb-3">
          <button
            onClick={() => setActiveTab('strip')}
            className={`py-2 px-1 rounded-xl text-xs font-bold font-mono-tech flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'strip'
                ? 'bg-[#272a33] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-[10px]">Foto Strip</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`py-2 px-1 rounded-xl text-xs font-bold font-mono-tech flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'bg-[#272a33] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4" />
            <span className="text-[10px]">Live Video</span>
          </button>

          <button
            onClick={() => setActiveTab('gif')}
            className={`py-2 px-1 rounded-xl text-xs font-bold font-mono-tech flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'gif'
                ? 'bg-[#272a33] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Film className="w-4 h-4" />
            <span className="text-[10px]">GIF Boomerang</span>
          </button>

          <button
            onClick={() => setActiveTab('poses')}
            className={`py-2 px-1 rounded-xl text-xs font-bold font-mono-tech flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'poses'
                ? 'bg-[#272a33] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span className="text-[10px]">Pose Satuan</span>
          </button>
        </div>

        {/* Download Status Notification */}
        {downloadStatus && (
          <div className="w-full mb-3 py-2 px-3 rounded-xl bg-[#a7f3d0] border-2 border-[#272a33] text-[#272a33] text-xs font-bold font-mono-tech flex items-center justify-center gap-2 animate-bounce-subtle">
            <CheckCircle2 className="w-4 h-4 text-emerald-800" />
            <span>{downloadStatus}</span>
          </div>
        )}

        {/* Tab Card Container */}
        <div className="w-full p-4 rounded-3xl bg-white border-3 border-[#272a33] shadow-[6px_6px_0px_#272a33] flex flex-col items-center">
          
          {/* TAB 1: FOTO STRIP HD */}
          {activeTab === 'strip' && (
            <div className="w-full flex flex-col items-center">
              <div className="relative max-h-[46vh] overflow-hidden rounded-2xl border-2 border-[#272a33] shadow-md bg-slate-50 flex items-center justify-center p-1">
                <img 
                  src={stripUrl} 
                  alt="SnapBooth Strip" 
                  className="max-h-[43vh] w-auto object-contain rounded-xl"
                  onError={(e) => { e.target.onerror = null; }}
                />
              </div>

              <button
                onClick={handleDownloadStrip}
                disabled={downloading}
                className="w-full mt-4 py-3.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#3b82f6] font-display font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <ArrowDownToLine className="w-4 h-4 text-amber-300 stroke-[3]" />
                <span>Unduh Foto Strip (JPG HD)</span>
              </button>
            </div>
          )}

          {/* TAB 2: LIVE MOTION VIDEO */}
          {activeTab === 'video' && (
            <div className="w-full flex flex-col items-center">
              <div className="relative max-h-[46vh] w-full max-w-[280px] overflow-hidden rounded-2xl border-2 border-[#272a33] shadow-md bg-black flex items-center justify-center">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  controls
                  preload="auto"
                  className="max-h-[43vh] w-full object-contain rounded-xl"
                  onError={() => setHasVideo(false)}
                >
                  <source src={videoMp4Url} type="video/mp4" />
                  <source src={videoWebmUrl} type="video/webm" />
                  Browser kamu tidak mendukung pemutaran video langsung.
                </video>
              </div>

              <button
                onClick={handleDownloadVideo}
                disabled={downloading}
                className="w-full mt-4 py-3.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#ec4899] font-display font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <ArrowDownToLine className="w-4 h-4 text-rose-300 stroke-[3]" />
                <span>Unduh Live Motion Video (.MP4)</span>
              </button>
            </div>
          )}

          {/* TAB 3: BOOMERANG GIF */}
          {activeTab === 'gif' && (
            <div className="w-full flex flex-col items-center">
              <div className="relative max-h-[46vh] max-w-[280px] overflow-hidden rounded-2xl border-2 border-[#272a33] shadow-md bg-slate-50 flex items-center justify-center p-1">
                <img 
                  src={gifUrl} 
                  alt="SnapBooth GIF Boomerang" 
                  className="max-h-[43vh] w-auto object-contain rounded-xl"
                  onError={() => setHasGif(false)}
                />
              </div>

              <button
                onClick={handleDownloadGif}
                disabled={downloading}
                className="w-full mt-4 py-3.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#10b981] font-display font-black text-sm tracking-wide flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <ArrowDownToLine className="w-4 h-4 text-emerald-300 stroke-[3]" />
                <span>Unduh GIF Boomerang (Animasi)</span>
              </button>
            </div>
          )}

          {/* TAB 4: INDIVIDUAL POSES */}
          {activeTab === 'poses' && (
            <div className="w-full flex flex-col items-center">
              <div className="w-full grid grid-cols-2 gap-2.5 max-h-[46vh] overflow-y-auto pr-1">
                {poses.map((poseUrl, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center p-2 rounded-2xl bg-slate-50 border-2 border-[#272a33] shadow-sm group hover:border-amber-400 transition-all"
                  >
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-[#272a33]/20 mb-2">
                      <img 
                        src={poseUrl} 
                        alt={`Pose ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                    </div>
                    <button
                      onClick={() => handleDownloadPose(poseUrl, idx)}
                      className="w-full py-1.5 px-2 rounded-lg bg-[#272a33] text-white hover:bg-slate-800 text-[11px] font-bold font-mono-tech flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      <ArrowDownToLine className="w-3 h-3 text-amber-300" />
                      <span>Pose #{idx + 1}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Helpful Mobile Tip */}
          <div className="w-full mt-3 p-2.5 rounded-xl bg-[#f4eedb] border border-[#272a33]/30 text-[#272a33] text-[11px] leading-relaxed text-center font-medium">
            💡 <strong>Tips Simpan di Galeri:</strong> Jika download tidak otomatis, tekan & tahan foto/video di atas lalu pilih <strong>"Simpan ke Foto"</strong>.
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
