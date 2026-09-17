import React, { useState, useEffect, useRef } from 'react';
import { useBooth } from '../context/BoothContext';
import { sounds } from '../utils/audio';
import { getSupportedVideoMimeType } from '../utils/motionCompositor';
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
  const activeStreamRef = useRef(null);
  const intervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const videoChunksRef = useRef([]);

  const [streamActive, setStreamActive] = useState(false);
  const [countdown, setCountdown] = useState(null); // null or 3, 2, 1
  const [isFlashing, setIsFlashing] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [cameraError, setCameraError] = useState(null);

  const isMirroredRef = useRef(isMirrored);
  useEffect(() => {
    isMirroredRef.current = isMirrored;
  }, [isMirrored]);

  const totalPoses = selectedFrame.poses;
  const countdownInitial = eventSettings.countdownSec || 3;

  // Initialize Camera Stream
  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      try {
        setCameraError(null);
        let constraints = {
          video: eventSettings.cameraDeviceId 
            ? { deviceId: { exact: eventSettings.cameraDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' }
            : { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
          audio: false
        };

        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e1) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        activeStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.warn);
              setStreamActive(true);
            }
          };
          videoRef.current.play().catch(console.warn);
          setStreamActive(true);
        }
      } catch (err) {
        console.warn('Camera access error or no webcam found:', err);
        if (isMounted) {
          setCameraError('Kamera tidak terdeteksi / izin ditolak. Menggunakan mode simulasi foto otomatis.');
          setStreamActive(false);
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
        activeStreamRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [eventSettings.cameraDeviceId]);

  // Start short video clip recording during countdown
  const startPoseVideoRecording = () => {
    try {
      const stream = activeStreamRef.current || (videoRef.current && videoRef.current.srcObject);
      if (!stream) {
        console.warn('No active camera stream available for video recording');
        return;
      }
      videoChunksRef.current = [];
      const mimeType = getSupportedVideoMimeType();
      
      let recorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2500000 });
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(100);
    } catch (e) {
      console.warn('Could not start MediaRecorder:', e);
    }
  };

  // Stop video recording and get blob
  const stopPoseVideoRecording = () => {
    return new Promise((resolve) => {
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.onstop = () => {
            const type = mediaRecorderRef.current?.mimeType || 'video/mp4';
            const blob = new Blob(videoChunksRef.current, { type });
            resolve(blob);
          };
          mediaRecorderRef.current.stop();
        } else {
          resolve(null);
        }
      } catch (e) {
        resolve(null);
      }
    });
  };

  // Capture Photo Function
  const triggerShutterCapture = async () => {
    // Flash Animation
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 500);

    // Stop and get live video clip
    const videoBlob = await stopPoseVideoRecording();

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const vid = videoRef.current;

    // Check if video element is ready and has valid dimensions
    if (vid && vid.videoWidth > 0 && vid.videoHeight > 0) {
      canvas.width = vid.videoWidth;
      canvas.height = vid.videoHeight;

      ctx.save();
      if (isMirroredRef.current) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      handlePhotoCaptured(photoDataUrl, videoBlob);
      return;
    }

    // Fallback synthetic photo generator ONLY if webcam is genuinely not available
    canvas.width = 1280;
    canvas.height = 960;

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
    handlePhotoCaptured(mockDataUrl, videoBlob);
  };

  // Trigger Countdown sequence
  const startCountdownSequence = () => {
    if (countdown !== null) return; // already counting down

    sounds.init();
    setCountdown(countdownInitial);

    // Start video clip recording during countdown
    startPoseVideoRecording();

    let currentSec = countdownInitial;
    sounds.playCountdownTick();

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      currentSec -= 1;

      if (currentSec > 0) {
        setCountdown(currentSec);
        sounds.playCountdownTick();
      } else if (currentSec === 0) {
        setCountdown('SMILE!');
        sounds.playCountdownFinal();
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setCountdown(null);
        triggerShutterCapture();
      }
    }, 1000);
  };

  // Auto trigger countdown when entering pose and camera stream is active
  useEffect(() => {
    if (!streamActive && !cameraError) return;

    const timer = setTimeout(() => {
      startCountdownSequence();
    }, 1200);
    return () => {
      clearTimeout(timer);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentPoseIndex, streamActive, cameraError]);

  return (
    <div className="relative w-full h-screen flex flex-col justify-between items-center p-6 md:p-8 bg-grid-notebook text-slate-900 overflow-hidden select-none">
      {/* Hidden Canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Screen Flash Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 bg-white z-50 animate-flash pointer-events-none" />
      )}

      {/* ================= BACKGROUND STICKER ORNAMENTS ================= */}
      <div className="absolute top-8 left-6 sm:left-10 z-0 pointer-events-none animate-float opacity-80">
        <svg className="w-9 h-9 sm:w-11 sm:h-11 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#1e2336" transform="translate(4, 5)" />
          <path d="M 50 0 C 50 35 65 50 100 50 C 65 50 50 65 50 100 C 50 65 35 50 0 50 C 35 50 50 35 50 0 Z" fill="#fef08a" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" />
        </svg>
      </div>

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

      <div className="absolute bottom-16 left-6 sm:left-10 z-0 pointer-events-none animate-float-reverse opacity-80">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 overflow-visible" viewBox="0 0 100 100" fill="none">
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#1e2336" transform="translate(4, 5) rotate(-12 50 50)" />
          <path d="M 50 30 C 50 10 25 10 15 25 C 0 45 35 70 50 88 C 65 70 100 45 85 25 C 75 10 50 10 50 30 Z" fill="#fda4af" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" transform="rotate(-12 50 50)" />
        </svg>
      </div>

      <div className="absolute bottom-16 right-8 sm:right-12 z-0 pointer-events-none animate-float opacity-80">
        <svg className="w-9 h-11 sm:w-11 sm:h-14 overflow-visible" viewBox="0 0 100 120" fill="none">
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#1e2336" transform="translate(4, 4) rotate(8 50 60)" />
          <path d="M 55 5 L 15 65 L 48 65 L 35 115 L 85 45 L 50 45 Z" fill="#fde047" stroke="#1e2336" strokeWidth="6" strokeLinejoin="round" transform="rotate(8 50 60)" />
        </svg>
      </div>

      {/* ================= TOP HEADER ================= */}
      <div className="w-full max-w-5xl flex justify-between items-center z-20">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#272a33] text-white shadow-md">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h2 
              className="text-2xl md:text-3xl font-black text-[#343a59] leading-tight tracking-tight uppercase"
              style={{ fontFamily: "'Dela Gothic One', 'Bungee', 'Fredoka', sans-serif" }}
            >
              POSE {currentPoseIndex + 1} DARI {totalPoses}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Template: <span className="font-bold text-[#272a33]">{selectedFrame.name}</span> • Siapkan gaya terbaikmu!
            </p>
          </div>
        </div>

        {/* Right Action: Mirror Toggle & Page 04 Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMirrored(!isMirrored)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#272a33] text-white shadow-md hover:bg-[#1a1c22] hover:scale-105 active:scale-95 transition-all text-xs font-bold font-mono-tech cursor-pointer border border-[#272a33]"
            title="Cerminkan Kamera (Mirror)"
          >
            <FlipHorizontal className="w-4 h-4 text-amber-300" />
            <span>Mirror: {isMirrored ? 'ON' : 'OFF'}</span>
          </button>

          {/* Page 04 Badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#272a33] text-white shadow-md">
            <span className="text-sm font-bold tracking-wide font-display pl-1">Page</span>
            <div className="flex items-center justify-center bg-white text-[#272a33] font-black text-xs px-2.5 py-0.5 rounded-full font-mono-tech">
              04
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CAMERA VIEWFINDER ================= */}
      <div className="relative w-full max-w-4xl flex-1 my-3 rounded-3xl overflow-hidden border-3 border-[#272a33] shadow-[8px_8px_0px_#272a33] flex items-center justify-center bg-black z-10">
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
            <div className="w-20 h-20 rounded-full bg-slate-800/90 flex items-center justify-center mb-4 text-amber-300 border-2 border-[#272a33] shadow-lg">
              <Camera className="w-10 h-10 animate-pulse" />
            </div>
            <h3 className="text-white font-display font-bold text-lg mb-1">Simulasi Feed Kamera Aktif</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {cameraError || 'Kamera sedang disiapkan. Jepretan foto otomatis disimulasikan secara jernih.'}
            </p>
          </div>
        )}

        {/* Viewfinder Overlay Guides */}
        <div className="absolute inset-6 sm:inset-8 border border-white/30 rounded-2xl pointer-events-none flex flex-col justify-between p-4 z-20">
          <div className="flex justify-between">
            <div className="w-7 h-7 border-t-4 border-l-4 border-amber-300 rounded-tl-lg shadow-sm" />
            <div className="w-7 h-7 border-t-4 border-r-4 border-amber-300 rounded-tr-lg shadow-sm" />
          </div>
          <div className="flex justify-between">
            <div className="w-7 h-7 border-b-4 border-l-4 border-amber-300 rounded-bl-lg shadow-sm" />
            <div className="w-7 h-7 border-b-4 border-r-4 border-amber-300 rounded-br-lg shadow-sm" />
          </div>
        </div>

        {/* Giant Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center z-30 animate-pulse-slow">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-[#fde047] p-2 flex items-center justify-center border-4 border-[#272a33] shadow-[8px_8px_0px_#272a33] animate-bounce-subtle">
              <div className="w-full h-full rounded-full bg-[#272a33] flex items-center justify-center">
                <span 
                  className="font-black text-6xl sm:text-7xl text-[#fef08a] tracking-wider uppercase drop-shadow-md"
                  style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
                >
                  {countdown}
                </span>
              </div>
            </div>
            <div className="mt-5 px-6 py-2.5 rounded-full bg-[#272a33] border-2 border-[#fde047] shadow-[4px_4px_0px_#272a33] flex items-center gap-2.5">
              <Smile className="w-6 h-6 text-amber-300" />
              <span 
                className="text-white font-black text-lg sm:text-xl tracking-wider uppercase"
                style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
              >
                SIAP-SIAP POSE!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM SHUTTER ACTION BAR ================= */}
      <div className="w-full max-w-xl flex items-center justify-center gap-6 z-20 pt-1">
        <button
          onClick={startCountdownSequence}
          disabled={countdown !== null}
          className="px-10 sm:px-14 py-4 sm:py-4.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-3 border-[#272a33] shadow-[4px_4px_0px_#fde047] font-display font-black text-base sm:text-lg tracking-wide flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Camera className="w-6 h-6 text-amber-300" />
          <span>{countdown !== null ? 'Sedang Menghitung...' : 'Jepret Foto Sekarang'}</span>
        </button>
      </div>
    </div>
  );
}
