import React, { useState, useEffect, useRef } from 'react';
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
  Check,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X
} from 'lucide-react';

const TABS = ['strip', 'video', 'gif', 'poses'];

export default function GuestDownloadScreen({ photoId }) {
  const [activeTab, setActiveTab] = useState('strip'); // 'strip' | 'video' | 'gif' | 'poses'
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [hasVideo, setHasVideo] = useState(true);
  const [hasGif, setHasGif] = useState(true);
  const [poses, setPoses] = useState([]);
  const [isChecking, setIsChecking] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [photoMeta, setPhotoMeta] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  // Touch swipe support
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const stripUrl = `/uploads/${photoId}.jpg`;
  const videoMp4Url = `/uploads/${photoId}_motion.mp4`;
  const videoWebmUrl = `/uploads/${photoId}_motion.webm`;
  const gifUrl = `/uploads/${photoId}_boomerang.gif`;
  const zipUrl = `/uploads/${photoId}_bundle.zip`;

  useEffect(() => {
    let isMounted = true;

    async function checkValidityAndScanPoses() {
      setIsChecking(true);

      // 1. Check if the main photo strip exists on server
      const exists = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = stripUrl;
      });

      // 2. Load metadata from localStorage if available
      let isLocalExpired = false;
      let meta = null;
      try {
        const raw = localStorage.getItem('snapbooth_softfiles_v1');
        if (raw) {
          const store = JSON.parse(raw);
          if (store[photoId]) {
            meta = store[photoId];
            if (store[photoId].expiresAt && store[photoId].expiresAt <= Date.now()) {
              isLocalExpired = true;
            }
          }
        }
      } catch (e) {}

      if (!isMounted) return;

      if (!exists || isLocalExpired) {
        setIsExpired(true);
        setIsChecking(false);
        return;
      }

      setIsExpired(false);
      setPhotoMeta(meta);

      // 3. Scan available poses
      const validPoses = [];
      for (let i = 1; i <= 6; i++) {
        const pUrl = `/uploads/${photoId}_pose_${i}.jpg`;
        const pExists = await new Promise((resolve) => {
          const pImg = new Image();
          pImg.onload = () => resolve(true);
          pImg.onerror = () => resolve(false);
          pImg.src = pUrl;
        });

        if (pExists) {
          validPoses.push(pUrl);
        } else {
          if (i >= 3) break;
        }
      }

      if (isMounted) {
        setPoses(validPoses.length > 0 ? validPoses : [1, 2, 3].map(idx => `/uploads/${photoId}_pose_${idx}.jpg`));
        setIsChecking(false);
      }
    }

    checkValidityAndScanPoses();
    return () => { isMounted = false; };
  }, [photoId]);

  // Touch handlers for mobile swipe navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 45; // 45px threshold

    if (isSwipe) {
      const currentIndex = TABS.indexOf(activeTab);
      if (distance > 0 && currentIndex < TABS.length - 1) {
        // Swiped Left -> Next Tab
        setActiveTab(TABS[currentIndex + 1]);
      } else if (distance < 0 && currentIndex > 0) {
        // Swiped Right -> Prev Tab
        setActiveTab(TABS[currentIndex - 1]);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

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

  // Download Handlers
  const handleDownloadZipBundle = () => {
    triggerDownload(zipUrl, `SnapBooth_Paket_Lengkap_${photoId}.zip`, 'Paket Lengkap (.ZIP)');
  };

  const handleDownloadStrip = () => {
    triggerDownload(stripUrl, `SnapBooth_PhotoStrip_${photoId}.jpg`, 'Foto Strip HD');
  };

  const handleDownloadVideo = () => {
    triggerDownload(videoMp4Url, `SnapBooth_LiveMotion_${photoId}.mp4`, 'Live Motion Video (MP4)');
  };

  const handleDownloadGif = () => {
    triggerDownload(gifUrl, `SnapBooth_Boomerang_${photoId}.gif`, 'GIF Boomerang');
  };

  const handleDownloadPose = (poseUrl, index) => {
    triggerDownload(poseUrl, `SnapBooth_Pose_${index + 1}_${photoId}.jpg`, `Foto Pose ke-${index + 1}`);
  };

  // Native Web Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SnapBooth Softfile Foto',
        text: 'Lihat dan unduh hasil foto sesi SnapBooth saya!',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setDownloadStatus('📋 Link berhasil disalin ke clipboard!');
      setTimeout(() => setDownloadStatus(''), 3000);
    }
  };

  // Formatted Date & Time (Gopoto Inspiration)
  const sessionDateText = photoMeta?.createdAt
    ? new Date(photoMeta.createdAt).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) + ' • ' + new Date(photoMeta.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
    : new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

  // ================= EXPIRED SCREEN VIEW =================
  if (!isChecking && isExpired) {
    return (
      <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col justify-between items-center px-6 py-6 select-none font-sans">
        {/* Top Navbar */}
        <header className="w-full max-w-lg flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span 
              className="text-2xl font-black text-[#272a33] tracking-tight lowercase"
              style={{ 
                fontFamily: "'Dela Gothic One', 'Bungee', cursive, sans-serif",
                WebkitTextStroke: '1px #272a33',
                color: '#fff',
                textShadow: '2px 2px 0px #272a33'
              }}
            >
              snapbooth
            </span>
          </div>

          <button 
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer transition-colors"
            title="Bagikan"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </header>

        {/* Center Expired Hero Message */}
        <main className="w-full max-w-md flex flex-col items-center justify-center text-center my-auto py-12">
          <h1 
            className="text-2xl sm:text-3xl font-extrabold text-[#e11d48] tracking-tight mb-3"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
          >
            Your files have expired
          </h1>

          <p className="text-slate-500 text-sm sm:text-base font-normal leading-relaxed max-w-sm">
            The soft files have been removed from the server.
          </p>

          <p className="text-slate-400 text-xs mt-2 font-normal leading-relaxed max-w-xs">
            File softfile telah otomatis dibersihkan dari server demi privasi & keamanan data pengunjung.
          </p>

          <div className="mt-10 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left flex items-start gap-3 w-full">
            <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong>Butuh foto ini?</strong> Jika Anda baru saja berfoto, silakan hubungi operator photo booth di lokasi acara untuk meminta file backup master event.
            </div>
          </div>
        </main>

        <footer className="w-full max-w-lg flex justify-between items-center pt-4 border-t border-slate-100 text-slate-400 text-xs font-mono">
          <span>SnapBooth Cloud</span>
          <div className="flex items-center gap-1.5">
            <span className="text-base">🇮🇩</span>
            <span className="text-slate-500 font-bold">ID / EN</span>
          </div>
        </footer>
      </div>
    );
  }

  // ================= LOADING STATE =================
  if (isChecking) {
    return (
      <div className="w-full min-h-screen bg-[#f3edd9] bg-grid-notebook flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#272a33] border-t-amber-400 animate-spin mb-4" />
        <p className="font-display font-black text-sm text-[#272a33] uppercase">
          Memuat Softfile Foto...
        </p>
      </div>
    );
  }

  // ================= ACTIVE DOWNLOAD SCREEN VIEW =================
  return (
    <div className="w-full min-h-screen bg-[#f3edd9] bg-grid-notebook text-slate-900 px-4 py-4 pb-32 sm:pb-40 flex flex-col items-center justify-start selection:bg-amber-200">

      {/* Zoom Modal if active */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
        >
          <button
            onClick={() => setZoomImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={zoomImage} 
            alt="Zoomed Photo" 
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}

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

      {/* TOP HEADER & BRANDING */}
      <header className="w-full max-w-md text-center pt-2 pb-2 z-10">
        {/* Brand Badge (Top Center) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#272a33] text-white text-xs font-mono-tech font-bold shadow-sm mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>SNAPBOOTH</span>
        </div>

        {/* Second Row: Timestamp (Left) & Share (Right) */}
        <div className="flex items-center justify-between px-1">
          {/* Date Time Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#272a33]/20 text-[11px] font-mono-tech font-bold text-slate-700 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{sessionDateText}</span>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] text-xs font-mono-tech font-bold text-[#272a33] hover:bg-slate-50 cursor-pointer active:scale-95 transition-transform"
            title="Bagikan Foto"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Share</span>
          </button>
        </div>

        <h1
          className="text-2xl sm:text-3xl font-black text-[#343a59] leading-tight uppercase tracking-tight mt-2"
          style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
        >
          UNDUH SOFTFILE MU!
        </h1>
        <p className="text-slate-600 text-xs mt-0.5 font-medium">
          Geser (swipe) atau pilih tab untuk melihat setiap format
        </p>

        {/* 1-Hour TTL notice */}
        <div className="mt-2 py-0.5 px-2.5 rounded-xl bg-[#fef08a] border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] inline-flex items-center gap-1.5 text-[11px] font-bold font-mono-tech text-[#272a33]">
          <Clock className="w-3 h-3" />
          <span>Masa aktif softfile: 1 Jam</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-md flex flex-col items-center z-10 my-2">

        {/* 1-CLICK ALL-IN-ONE ZIP DOWNLOAD BUTTON */}
        <div className="w-full mb-3">
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

        {/* Tab Navigation Switcher with Count/Format */}
        <div className="w-full grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] mb-3">
          {[
            { id: 'strip', label: 'Foto Strip', icon: ImageIcon, badge: 'JPG HD' },
            { id: 'video', label: 'Live Video', icon: Video, badge: 'MP4' },
            { id: 'gif', label: 'GIF Animasi', icon: Film, badge: 'GIF' },
            { id: 'poses', label: 'Pose Satuan', icon: Layers, badge: `${poses.length || 3} Pcs` }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 rounded-xl text-xs font-bold font-mono-tech flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#272a33] text-[#fef08a] shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Download Status Notification */}
        {downloadStatus && (
          <div className="w-full mb-3 py-2 px-3 rounded-xl bg-[#a7f3d0] border-2 border-[#272a33] text-[#272a33] text-xs font-bold font-mono-tech flex items-center justify-center gap-2 animate-bounce-subtle">
            <CheckCircle2 className="w-4 h-4 text-emerald-800" />
            <span>{downloadStatus}</span>
          </div>
        )}

        {/* TAB CARD CONTAINER WITH TOUCH SWIPE (Gopoto Inspiration) */}
        <div 
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full p-4 rounded-3xl bg-white border-3 border-[#272a33] shadow-[6px_6px_0px_#272a33] flex flex-col items-center relative"
        >

          {/* TAB 1: FOTO STRIP HD */}
          {activeTab === 'strip' && (
            <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
              <div className="relative w-full max-w-[270px] overflow-hidden rounded-2xl border-2 border-[#272a33] shadow-md bg-slate-50 flex items-center justify-center p-1 group">
                <img
                  src={stripUrl}
                  alt="SnapBooth Strip"
                  className="w-full h-auto object-contain rounded-xl cursor-zoom-in"
                  onClick={() => setZoomImage(stripUrl)}
                />
                
                {/* Media Format Badge (Gopoto Inspiration) */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-[#272a33]/85 text-[#fef08a] border border-[#fef08a]/40 text-[9px] font-mono-tech font-bold shadow-xs">
                  JPG • 600×1800 HD
                </div>

                {/* Zoom Hint Icon */}
                <button 
                  onClick={() => setZoomImage(stripUrl)}
                  className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-[#272a33]/80 text-white shadow-md hover:bg-[#272a33] cursor-pointer"
                  title="Perbesar Foto"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
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
            <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
              <div className="relative w-full max-w-[270px] overflow-hidden rounded-2xl border-2 border-[#272a33] shadow-md bg-black flex items-center justify-center">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  preload="auto"
                  className="w-full h-auto object-contain rounded-xl"
                  onError={() => setHasVideo(false)}
                >
                  <source src={videoMp4Url} type="video/mp4" />
                  <source src={videoWebmUrl} type="video/webm" />
                  Browser kamu tidak mendukung pemutaran video langsung.
                </video>

                {/* Media Format Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-rose-600/90 text-white border border-rose-300/40 text-[9px] font-mono-tech font-bold shadow-xs">
                  MP4 • 1080p 60FPS
                </div>
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
            <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
              <div className="relative w-full max-w-[270px] overflow-hidden rounded-2xl border-2 border-[#272a33] shadow-md bg-slate-50 flex items-center justify-center p-1">
                <img
                  src={gifUrl}
                  alt="SnapBooth GIF Boomerang"
                  className="w-full h-auto object-contain rounded-xl"
                  onError={() => setHasGif(false)}
                />

                {/* Media Format Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white border border-emerald-300/40 text-[9px] font-mono-tech font-bold shadow-xs">
                  GIF • Animated Loop
                </div>
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
            <div className="w-full flex flex-col items-center animate-in fade-in duration-200">
              <div className="w-full grid grid-cols-2 gap-2.5">
                {poses.map((poseUrl, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center p-2 rounded-2xl bg-slate-50 border-2 border-[#272a33] shadow-sm group hover:border-amber-400 transition-all"
                  >
                    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 border border-[#272a33]/20 mb-2">
                      <img
                        src={poseUrl}
                        alt={`Pose ${idx + 1}`}
                        className="w-full h-full object-cover cursor-zoom-in"
                        onClick={() => setZoomImage(poseUrl)}
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/60 text-white text-[8px] font-mono-tech">
                        Pose #{idx + 1}
                      </span>
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

          {/* Swipe Indicator Tip */}
          <div className="w-full mt-3 flex items-center justify-between text-[10px] text-slate-500 font-mono-tech px-1">
            <span className="flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Geser Kiri/Kanan
            </span>
            <span className="flex items-center gap-1">
              Ganti Format <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Helpful Mobile Tip */}
          <div className="w-full mt-2 p-2.5 rounded-xl bg-[#f4eedb] border border-[#272a33]/30 text-[#272a33] text-[11px] leading-relaxed text-center font-medium">
            💡 <strong>Tips Simpan di Galeri:</strong> Jika download tidak otomatis, tekan & tahan foto/video di atas lalu pilih <strong>"Simpan ke Foto"</strong>.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-3 mt-4 pb-6 z-10">
        <p className="text-[11px] text-slate-500 font-mono-tech">
          © {new Date().getFullYear()} SnapBooth • All Rights Reserved
        </p>
      </footer>
    </div>
  );
}
