import React, { useState, useEffect, useRef } from 'react';
import { useBooth } from '../context/BoothContext';
import { sounds } from '../utils/audio';
import { Camera, RefreshCw, Sparkles, Smile, VideoOff, FlipHorizontal } from 'lucide-react';

export default function CameraSessionScreen() {
  const { 
    selectedFrame, 
    currentPoseIndex, 
    eventSettings, 
    handlePhotoCaptured 
  } = useBooth();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [countdown, setCountdown] = useState(null); // null or 3, 2, 1
  const [isFlashing, setIsFlashing] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [cameraError, setCameraError] = useState(null);

  const totalPoses = selectedFrame.poses;
  const countdownInitial = eventSettings.countdownSec || 3;

  // Initialize Camera Stream
  useEffect(() => {
    let currentStream = null;

    async function startCamera() {
      try {
        setCameraError(null);
        const constraints = {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user',
            deviceId: eventSettings.cameraDeviceId ? { exact: eventSettings.cameraDeviceId } : undefined
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setStreamActive(true);
          };
        }
      } catch (err) {
        console.warn('Camera access error or no webcam found:', err);
        setCameraError('Kamera tidak terdeteksi / izin ditolak. Menggunakan mode simulasi foto otomatis.');
        setStreamActive(false);
      }
    }

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [eventSettings.cameraDeviceId]);

  // Trigger Countdown sequence
  const startCountdownSequence = () => {
    if (countdown !== null) return; // already counting down

    sounds.init();
    setCountdown(countdownInitial);

    let currentSec = countdownInitial;
    sounds.playCountdownTick();

    const interval = setInterval(() => {
      currentSec -= 1;

      if (currentSec > 0) {
        setCountdown(currentSec);
        sounds.playCountdownTick();
      } else if (currentSec === 0) {
        setCountdown('SMILE!');
        sounds.playCountdownFinal();
      } else {
        clearInterval(interval);
        setCountdown(null);
        triggerShutterCapture();
      }
    }, 1000);
  };

  // Capture Photo
  const triggerShutterCapture = () => {
    // Flash Animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 500);

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (streamActive && videoRef.current && videoRef.current.videoWidth > 0) {
      const vid = videoRef.current;
      canvas.width = vid.videoWidth;
      canvas.height = vid.videoHeight;

      ctx.save();
      if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      handlePhotoCaptured(photoDataUrl);
    } else {
      // Fallback synthetic photo generator if testing on PC without webcam
      canvas.width = 1280;
      canvas.height = 960;

      // Draw stylized gradient selfie mockup
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      const colors = [
        ['#3b82f6', '#8b5cf6'],
        ['#ec4899', '#f43f5e'],
        ['#10b981', '#06b6d4'],
        ['#f59e0b', '#d97706']
      ];
      const pickColor = colors[currentPoseIndex % colors.length];
      grad.addColorStop(0, pickColor[0]);
      grad.addColorStop(1, pickColor[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center Avatar
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 40, 180, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 50px "Outfit", sans-serif';
      ctx.fillText(`POSE KE-${currentPoseIndex + 1} CAPTURED`, canvas.width / 2, canvas.height / 2 - 20);

      ctx.font = '30px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(`${eventSettings.title} • ${new Date().toLocaleTimeString()}`, canvas.width / 2, canvas.height / 2 + 50);

      const mockDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      handlePhotoCaptured(mockDataUrl);
    }
  };

  // Auto trigger countdown when entering pose (optional or wait for button)
  useEffect(() => {
    const timer = setTimeout(() => {
      startCountdownSequence();
    }, 800);
    return () => clearTimeout(timer);
  }, [currentPoseIndex]);

  return (
    <div className="relative w-full h-screen flex flex-col justify-between items-center p-6 bg-slate-950 text-white select-none overflow-hidden">
      {/* Hidden Canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Screen Flash Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
      )}

      {/* Top Session Progress Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-blue-600/30 border border-blue-500/40 text-blue-300 font-display font-bold text-lg flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <span>POSE {currentPoseIndex + 1} DARI {totalPoses}</span>
          </div>
          <span className="text-slate-400 text-sm hidden sm:inline">
            Template: {selectedFrame.name}
          </span>
        </div>

        {/* Mirror Toggle & Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-3 rounded-xl glass-card flex items-center gap-2 text-xs font-semibold transition-all ${
              isMirrored ? 'text-blue-400 border-blue-500/50' : 'text-slate-400'
            }`}
            title="Cerminkan Kamera (Mirror)"
          >
            <FlipHorizontal className="w-4 h-4" />
            <span>Mirror: {isMirrored ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Camera Viewfinder with Guides */}
      <div className="relative w-full max-w-4xl flex-1 my-3 rounded-3xl overflow-hidden glass-panel border-2 border-slate-700/60 shadow-2xl flex items-center justify-center bg-black">
        {/* Live Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isMirrored ? 'scale-x-[-1]' : ''
          } ${!streamActive ? 'hidden' : ''}`}
        />

        {/* Fallback Simulation UI if no camera */}
        {!streamActive && (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 max-w-md">
            <div className="w-20 h-20 rounded-full bg-slate-800/80 flex items-center justify-center mb-4 text-blue-400">
              <Camera className="w-10 h-10 animate-pulse" />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Simulasi Feed Kamera Aktif</h3>
            <p className="text-xs text-slate-400 mb-4">
              {cameraError || 'Kamera sedang disiapkan. Jepretan foto otomatis disimulasikan secara jernih.'}
            </p>
          </div>
        )}

        {/* Viewfinder Overlay Guides (Crop framing) */}
        <div className="absolute inset-8 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
          <div className="flex justify-between">
            <div className="w-6 h-6 border-t-2 border-l-2 border-blue-400" />
            <div className="w-6 h-6 border-t-2 border-r-2 border-blue-400" />
          </div>
          <div className="flex justify-between">
            <div className="w-6 h-6 border-b-2 border-l-2 border-blue-400" />
            <div className="w-6 h-6 border-b-2 border-r-2 border-blue-400" />
          </div>
        </div>

        {/* Giant Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex flex-col items-center justify-center z-30 animate-pulse-slow">
            <div className="w-44 h-44 rounded-full bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 p-1 flex items-center justify-center shadow-2xl shadow-purple-500/50">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <span className="font-display font-black text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200">
                  {countdown}
                </span>
              </div>
            </div>
            <p className="text-white font-display font-bold text-2xl mt-4 tracking-wider flex items-center gap-2">
              <Smile className="w-6 h-6 text-amber-400" />
              <span>SIAP-SIAP POSE!</span>
            </p>
          </div>
        )}
      </div>

      {/* Bottom Shutter Action Bar */}
      <div className="w-full max-w-xl flex items-center justify-center gap-6 z-10">
        <button
          onClick={startCountdownSequence}
          disabled={countdown !== null}
          className="px-10 py-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 hover:from-pink-400 hover:to-blue-500 text-white font-display font-bold text-xl shadow-2xl shadow-purple-600/40 flex items-center gap-3 transition-transform transform active:scale-95 disabled:opacity-50"
        >
          <Camera className="w-6 h-6" />
          <span>{countdown !== null ? 'Sedang Menghitung...' : 'Jepret Foto Sekarang'}</span>
        </button>
      </div>
    </div>
  );
}
