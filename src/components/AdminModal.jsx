import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { 
  Settings, 
  X, 
  Save, 
  Camera, 
  Printer, 
  DollarSign, 
  Clock, 
  MapPin, 
  Sparkles, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  Check, 
  Image as ImageIcon, 
  LayoutGrid, 
  Download, 
  FolderArchive, 
  ShieldCheck, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Video,
  Sliders,
  RotateCcw,
  Type,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Coins,
  Users,
  Copy,
  BarChart3,
  Receipt,
  FileText,
  Ticket,
  Crown,
  Gift,
  Tag,
  Zap
} from 'lucide-react';

// Compress image to ensure it fits comfortably within storage quota
const compressImageFile = (file, maxWidth = 1920, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Compress transparent PNG logo/watermark preserving alpha channel
const compressPngFile = (file, maxWidth = 800) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function AdminModal() {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    eventSettings, 
    updateSettings,
    allFramesList,
    addCustomFrame,
    deleteCustomFrameById,
    toggleFrameEnabled,
    exportMasterEventZip,
    printerStatus,
    resetPaperRoll,
    reprintLastSession,
    eventAnalytics,
    resetEventAnalytics,
    vouchers,
    addVoucher,
    deleteVoucher,
    toggleVoucherActive,
    generateBulkRandomVouchers
  } = useBooth();

  const [activeTab, setActiveTab] = useState('frames'); // 'frames' | 'event' | 'camera' | 'payment' | 'export'
  const [formData, setFormData] = useState(eventSettings);
  const [videoDevices, setVideoDevices] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [reprintFeedback, setReprintFeedback] = useState(null);
  const [customRollInput, setCustomRollInput] = useState('');
  const [showCustomRollModal, setShowCustomRollModal] = useState(false);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // Voucher Form States
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);
  const [newVoucherForm, setNewVoucherForm] = useState({
    code: '',
    type: 'free',
    discountValue: 100,
    maxUses: -1,
    description: ''
  });
  const [voucherFormError, setVoucherFormError] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkPrefix, setBulkPrefix] = useState('VIP');
  const [bulkCount, setBulkCount] = useState(5);
  const [bulkGeneratedList, setBulkGeneratedList] = useState([]);
  const [copiedBulk, setCopiedBulk] = useState(false);

  // Copy WhatsApp Summary Report
  const handleCopyWhatsAppReport = () => {
    const totalRev = Number(eventAnalytics?.totalRevenue || 0).toLocaleString('id-ID');
    const totalSess = eventAnalytics?.sessionsCount || 0;
    const paidSess = eventAnalytics?.paidSessionsCount || 0;
    const freeSess = eventAnalytics?.freeSessionsCount || 0;
    const printsToday = printerStatus?.totalPrintsToday || 0;
    const paperLeft = printerStatus?.paperRemaining ?? 400;

    const frameStats = eventAnalytics?.frameStats || {};
    const sortedFrames = Object.entries(frameStats).sort((a, b) => b[1] - a[1]);
    const topFrameText = sortedFrames.length > 0 
      ? sortedFrames.map(([name, count]) => `  • ${name}: ${count}x`).join('\n')
      : '  • Belum ada sesi';

    const text = `📊 *LAPORAN REKAP SNAPBOOTH KIOSK*
🎉 *Event:* ${eventSettings.title || 'SnapBooth Event'}
📍 *Lokasi:* ${eventSettings.location || 'Venue Event'}
📅 *Tanggal:* ${eventSettings.date || new Date().toLocaleDateString('id-ID')}
------------------------------------------
💰 *Total Omset QRIS:* Rp ${totalRev}
📸 *Total Sesi Foto:* ${totalSess} Sesi (${paidSess} Berbayar, ${freeSess} Free)
🖨️ *Total Kertas Tercetak:* ${printsToday} Lembar (Sisa ${paperLeft} lbr)
🏆 *Ranking Frame Terfavorit:*
${topFrameText}
------------------------------------------
⚡ *Status Sistem:* Normal & Operasional
_Laporan digenerate otomatis oleh SnapBooth Kiosk Pro._`;

    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 3000);
  };

  // New Custom Frame Form State
  const [isAddingFrame, setIsAddingFrame] = useState(false);
  const [newFrameData, setNewFrameData] = useState({
    name: '',
    type: 'strip-3', // 'strip-3' | 'strip-4' | 'grid-4'
    poses: 3,
    aspectRatio: '2:6',
    bgColor: '#ffffff',
    textColor: '#1e293b',
    subtextColor: '#64748b',
    borderColor: '#e2e8f0',
    tag: 'Event Custom',
    theme: 'Custom Wedding / Party',
    overlayImage: null,
    hideDefaultText: true
  });
  const [overlayPreview, setOverlayPreview] = useState(null);

  // Fetch connected webcams/cameras
  useEffect(() => {
    if (!isAdminOpen) return;
    setFormData(eventSettings);

    navigator.mediaDevices.enumerateDevices().then(devices => {
      const videoDevs = devices.filter(d => d.kind === 'videoinput');
      setVideoDevices(videoDevs);
    }).catch(err => console.log('Cannot list devices', err));
  }, [isAdminOpen, eventSettings]);

  if (!isAdminOpen) return null;

  // Handle Attract Screen Custom Image Upload
  const handleAttractImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImageFile(file, 1920, 0.82);
      setFormData(prev => ({
        ...prev,
        attractBackgroundMedia: compressedDataUrl,
        attractMediaType: 'image'
      }));
    } catch (err) {
      console.error('Failed to compress image:', err);
      alert('Gagal memproses gambar poster event.');
    }
  };

  // Handle Attract Screen Video Upload
  const handleAttractVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Ukuran video maksimal 8MB agar sistem kiosk tetap responsif.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        attractBackgroundMedia: event.target.result,
        attractMediaType: 'video'
      }));
    };
    reader.readAsDataURL(file);
  };

  // Reset Attract Background to Default
  const handleResetAttractMedia = () => {
    setFormData(prev => ({
      ...prev,
      attractBackgroundMedia: null,
      attractMediaType: 'default',
      attractDimming: 0,
      attractShowDefaultTitle: true,
      attractCustomCtaText: 'Click to Start'
    }));
  };

  // Handle Watermark / Sponsor Logo Upload
  const handleWatermarkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedPng = await compressPngFile(file, 800);
      setFormData(prev => ({
        ...prev,
        watermarkImage: compressedPng,
        enableWatermark: true
      }));
    } catch (err) {
      console.error('Failed to compress watermark logo:', err);
      alert('Gagal memproses logo watermark PNG.');
    }
  };

  // Handle Remove Watermark Logo
  const handleRemoveWatermark = () => {
    setFormData(prev => ({
      ...prev,
      watermarkImage: null
    }));
  };

  // Handle File Upload for Custom Frame PNG
  const handleOverlayFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setOverlayPreview(dataUrl);
      setNewFrameData(prev => ({
        ...prev,
        overlayImage: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle Create Custom Frame
  const handleSaveCustomFrame = (e) => {
    e.preventDefault();
    if (!newFrameData.name.trim()) return;

    addCustomFrame({
      ...newFrameData,
      poses: newFrameData.type === 'strip-3' ? 3 : 4,
      aspectRatio: newFrameData.type === 'grid-4' ? '4:6' : '2:6'
    });

    setIsAddingFrame(false);
    setNewFrameData({
      name: '',
      type: 'strip-3',
      poses: 3,
      aspectRatio: '2:6',
      bgColor: '#ffffff',
      textColor: '#1e293b',
      subtextColor: '#64748b',
      borderColor: '#e2e8f0',
      tag: 'Event Custom',
      theme: 'Custom Theme',
      overlayImage: null,
      hideDefaultText: true
    });
    setOverlayPreview(null);
  };

  // Save Event Settings Form
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      price: Number(formData.price) || 35000,
      countdownSec: Number(formData.countdownSec) || 3,
      maxRetakes: Number(formData.maxRetakes ?? 2),
      motionDurationSec: Number(formData.motionDurationSec ?? 4),
      autoResetDelaySec: Number(formData.autoResetDelaySec) || 90,
      attractDimming: Number(formData.attractDimming) || 0,
      defaultPrintCopies: Number(formData.defaultPrintCopies) || 2,
      maxPrintCopies: Number(formData.maxPrintCopies) || 4,
      allowGuestSelectCopies: formData.allowGuestSelectCopies !== false,
      extraCopyMode: formData.extraCopyMode || 'free',
      extraCopyPrice: Number(formData.extraCopyPrice) || 10000,
      watermarkImage: formData.watermarkImage ?? null,
      enableWatermark: formData.enableWatermark !== false,
      watermarkPosition: formData.watermarkPosition || 'bottom-right',
      watermarkScale: Number(formData.watermarkScale) || 22,
      watermarkOpacity: Number(formData.watermarkOpacity) || 90
    });
    setIsAdminOpen(false);
  };

  // Bulk Export All Event Photos
  const handleExportAllZip = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const zipBlob = await exportMasterEventZip(eventSettings.title || 'SnapBooth_Event');
      if (zipBlob) {
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(eventSettings.title || 'SnapBooth_Event').replace(/\s+/g, '_')}_MasterPhotos_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportSuccess(true);
      } else {
        alert('Belum ada sesi foto yang tersimpan di memori kiosk untuk di-export.');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Gagal mengekspor foto event.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#272a33]/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="w-full max-w-4xl bg-[#fffef7] border-3 border-[#272a33] rounded-3xl shadow-[12px_12px_0px_#272a33] text-slate-900 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* ================= MODAL TOP HEADER ================= */}
        <div className="flex justify-between items-center px-6 py-4 border-b-3 border-[#272a33] bg-[#f8f3e3]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#272a33] text-white shadow-sm border border-[#272a33]">
              <Settings className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 
                className="font-black text-xl text-[#272a33] uppercase tracking-tight flex items-center gap-2"
                style={{ fontFamily: "'Dela Gothic One', 'Bungee', sans-serif" }}
              >
                <span>OPERATOR DASHBOARD</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#fde047] border border-[#272a33] text-[#272a33] font-mono-tech tracking-normal">
                  PRO
                </span>
              </h3>
              <p className="text-xs text-slate-600 font-medium font-mono-tech">
                SnapBooth Kiosk & Frame Manager System
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-2 rounded-full bg-white hover:bg-slate-100 text-[#272a33] border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] cursor-pointer transition-all transform hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= TAB NAVIGATION BAR ================= */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b-2 border-[#272a33]/15 bg-[#faf6ea] overflow-x-auto">
          {[
            { id: 'frames', label: '🎨 Kelola Frame', icon: Layers },
            { id: 'event', label: '⚙️ Info Event', icon: Sparkles },
            { id: 'camera', label: '📷 Kamera & 🖨️ Printer', icon: Camera },
            { id: 'payment', label: '💳 Pembayaran & Voucher', icon: DollarSign },
            { id: 'export', label: '📊 Statistik & Laporan', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsAddingFrame(false);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-[#272a33] text-[#fef08a] border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33]' 
                    : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB BODY CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ----------------- TAB 1: FRAME MANAGER ----------------- */}
          {activeTab === 'frames' && (
            <div className="space-y-6">
              {/* Header with Add Frame Button */}
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h4 className="font-extrabold text-base text-[#272a33] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <span>Daftar Template Frame Kiosk</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Aktifkan/nonaktifkan frame yang ingin ditampilkan ke tamu acara hari ini
                  </p>
                </div>

                {!isAddingFrame && (
                  <button
                    onClick={() => setIsAddingFrame(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#fde047] text-[#272a33] hover:bg-[#facc15] border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] font-bold text-xs cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Upload Frame Custom (PNG)</span>
                  </button>
                )}
              </div>

              {/* Add Custom Frame Sub-Panel */}
              {isAddingFrame && (
                <div className="bg-white rounded-3xl border-3 border-[#272a33] shadow-[6px_6px_0px_#272a33] p-5 animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <h5 className="font-black text-sm text-[#272a33] uppercase font-display">
                        Upload & Buat Frame Custom Baru
                      </h5>
                    </div>
                    <button 
                      onClick={() => setIsAddingFrame(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  <form onSubmit={handleSaveCustomFrame} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      
                      {/* Left Side: Frame Form Details */}
                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Frame / Event <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Wedding Reza & Salsa"
                            value={newFrameData.name}
                            onChange={e => setNewFrameData({ ...newFrameData, name: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border-2 border-[#272a33] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Tipe Format Layout
                            </label>
                            <select
                              value={newFrameData.type}
                              onChange={e => {
                                const t = e.target.value;
                                setNewFrameData({
                                  ...newFrameData,
                                  type: t,
                                  poses: t === 'strip-3' ? 3 : 4,
                                  aspectRatio: t === 'grid-4' ? '4:6' : '2:6'
                                });
                              }}
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border-2 border-[#272a33] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                              <option value="strip-3">Strip 2x6 (3 Pose)</option>
                              <option value="strip-4">Strip 2x6 (4 Pose)</option>
                              <option value="grid-4">Grid 4R (4 Pose)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Tag Label Badge
                            </label>
                            <input
                              type="text"
                              placeholder="Contoh: Wedding / VIP"
                              value={newFrameData.tag}
                              onChange={e => setNewFrameData({ ...newFrameData, tag: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border-2 border-[#272a33] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Warna Background
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={newFrameData.bgColor}
                                onChange={e => setNewFrameData({ ...newFrameData, bgColor: e.target.value })}
                                className="w-9 h-9 rounded-lg border-2 border-[#272a33] cursor-pointer p-0.5"
                              />
                              <span className="text-xs font-mono font-bold text-slate-700 uppercase">
                                {newFrameData.bgColor}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                              <input
                                type="checkbox"
                                checked={newFrameData.hideDefaultText}
                                onChange={e => setNewFrameData({ ...newFrameData, hideDefaultText: e.target.checked })}
                                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                              />
                              <span>Hapus teks standar footer</span>
                            </label>
                          </div>
                        </div>

                        {/* File Upload Box */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            File Gambar Overlay PNG (Transparan) <span className="text-red-500">*</span>
                          </label>
                          <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-dashed border-[#272a33] rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="space-y-1 text-center">
                              <Upload className="mx-auto h-7 w-7 text-slate-400" />
                              <div className="flex text-xs text-slate-600 justify-center">
                                <label className="relative cursor-pointer bg-white rounded-md font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                  <span>Pilih file PNG transparan</span>
                                  <input
                                    type="file"
                                    accept="image/png, image/webp"
                                    onChange={handleOverlayFileUpload}
                                    className="sr-only"
                                  />
                                </label>
                              </div>
                              <p className="text-[10px] text-slate-500">
                                Rekomendasi: Resolusi 600x1800 px (Strip) atau 1200x1800 px (Grid 4R)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Live Visual Preview */}
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border-2 border-[#272a33]">
                        <span className="text-xs font-black font-display text-slate-700 mb-2 uppercase">
                          Simulasi Tampilan Frame
                        </span>

                        <div 
                          className="relative w-28 h-56 sm:w-32 sm:h-64 rounded-xl shadow-md border-2 border-[#272a33] p-1.5 flex flex-col justify-between items-center overflow-hidden"
                          style={{ backgroundColor: newFrameData.bgColor }}
                        >
                          {/* Photo Slots Simulation */}
                          {newFrameData.type === 'strip-3' && (
                            <div className="w-full flex-1 flex flex-col gap-1 justify-center my-1 z-0">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="w-full h-11 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-[8px] font-mono-tech text-blue-800 font-bold">
                                  Foto {i}
                                </div>
                              ))}
                            </div>
                          )}

                          {newFrameData.type === 'strip-4' && (
                            <div className="w-full flex-1 flex flex-col gap-1 justify-center my-1 z-0">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-full h-9 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-[7px] font-mono-tech text-blue-800 font-bold">
                                  Foto {i}
                                </div>
                              ))}
                            </div>
                          )}

                          {newFrameData.type === 'grid-4' && (
                            <div className="w-full flex-1 grid grid-cols-2 gap-1 my-1 p-0.5 z-0">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-full h-16 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-[7px] font-mono-tech text-blue-800 font-bold">
                                  {i}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Custom PNG Overlay Image */}
                          {overlayPreview && (
                            <img 
                              src={overlayPreview} 
                              alt="Overlay Preview" 
                              className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10" 
                            />
                          )}
                        </div>

                        <span className="text-[10px] text-slate-500 mt-2 font-mono-tech">
                          {newFrameData.name || 'Nama Frame Belum Diisi'}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddingFrame(false)}
                        className="px-4 py-2 rounded-full border border-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={!newFrameData.name.trim()}
                        className="px-6 py-2 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#fde047] text-xs font-black flex items-center gap-2 cursor-pointer disabled:opacity-40"
                      >
                        <Save className="w-4 h-4 text-amber-300" />
                        <span>Simpan & Aktifkan Frame</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Frames List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {allFramesList.map((f) => {
                  const isEnabled = f.enabled !== false;
                  return (
                    <div
                      key={f.id}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 bg-white ${
                        isEnabled 
                          ? 'border-[#272a33] shadow-[4px_4px_0px_#272a33]' 
                          : 'border-slate-200 opacity-60 bg-slate-50'
                      }`}
                    >
                      {/* Mini Thumbnail */}
                      <div 
                        className="relative w-14 h-24 rounded-lg border-2 border-[#272a33] p-1 flex flex-col justify-between items-center overflow-hidden shrink-0"
                        style={{ backgroundColor: f.bgColor || '#ffffff' }}
                      >
                        {/* Slots */}
                        <div className="w-full flex-1 flex flex-col gap-0.5 justify-center">
                          {[1, 2, 3].slice(0, f.poses).map(i => (
                            <div key={i} className="w-full h-3 rounded bg-slate-300/80 border border-black/10" />
                          ))}
                        </div>
                        {f.overlayImage && (
                          <img src={f.overlayImage} alt={f.name} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                        )}
                      </div>

                      {/* Info & Controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#272a33] font-mono-tech ${
                            f.isCustom ? 'bg-[#fef08a] text-[#272a33]' : 'bg-[#e4ecfc] text-[#272a33]'
                          }`}>
                            {f.isCustom ? 'CUSTOM' : 'PRESET'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono-tech">
                            {f.poses} Pose • {f.aspectRatio || '2:6'}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-xs text-[#272a33] truncate">
                          {f.name}
                        </h5>
                        <p className="text-[10px] text-slate-500 truncate mb-2">
                          {f.theme || 'Standard Theme'}
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFrameEnabled(f.id, !isEnabled)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 cursor-pointer transition-all ${
                              isEnabled
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-400 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                            }`}
                          >
                            {isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{isEnabled ? 'Aktif' : 'Nonaktif'}</span>
                          </button>

                          {f.isCustom && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus frame custom "${f.name}"?`)) {
                                  deleteCustomFrameById(f.id);
                                }
                              }}
                              className="p-1 rounded-full text-red-500 hover:bg-red-50 border border-red-200 cursor-pointer"
                              title="Hapus Frame Custom"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ----------------- TAB 2: EVENT INFO & BRANDING ----------------- */}
          {activeTab === 'event' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* ================= SECTION A: ATTRACT SCREEN CUSTOM BACKGROUND ================= */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#272a33] flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-pink-600" />
                      <span>Background Layar Depan (Attract Screen Kiosk)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold border border-pink-300">
                        Event Theme
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pasang poster tema acara klien (gambar atau video looping) pada layar sentuh utama photobooth
                    </p>
                  </div>

                  {formData.attractBackgroundMedia && (
                    <button
                      type="button"
                      onClick={handleResetAttractMedia}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset ke Default</span>
                    </button>
                  )}
                </div>

                {/* Media Uploader Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Upload Controls (Left Column) */}
                  <div className="lg:col-span-7 space-y-3.5">
                    {/* Media Type Selection */}
                    <div className="flex items-center gap-2">
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                        !formData.attractBackgroundMedia 
                          ? 'bg-[#272a33] text-[#fef08a] border-[#272a33] shadow-[2px_2px_0px_#272a33]' 
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}>
                        <input
                          type="radio"
                          name="attractType"
                          className="hidden"
                          checked={!formData.attractBackgroundMedia}
                          onChange={handleResetAttractMedia}
                        />
                        <Sparkles className="w-4 h-4" />
                        <span>Retro-Pop Default</span>
                      </label>

                      {/* Image Upload Label */}
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                        formData.attractMediaType === 'image' && formData.attractBackgroundMedia
                          ? 'bg-[#272a33] text-[#fef08a] border-[#272a33] shadow-[2px_2px_0px_#272a33]' 
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleAttractImageUpload}
                        />
                        <Upload className="w-4 h-4" />
                        <span>Upload Poster (JPG/PNG)</span>
                      </label>

                      {/* Video Upload Label */}
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                        formData.attractMediaType === 'video' && formData.attractBackgroundMedia
                          ? 'bg-[#272a33] text-[#fef08a] border-[#272a33] shadow-[2px_2px_0px_#272a33]' 
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          onChange={handleAttractVideoUpload}
                        />
                        <Video className="w-4 h-4" />
                        <span>Upload Video (MP4)</span>
                      </label>
                    </div>

                    {/* Custom Poster Settings (If Active) */}
                    {formData.attractBackgroundMedia && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        {/* Toggle Show Default Title */}
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              Tampilkan Tulisan "SNAP BOOTH" & Stiker 3D
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Matikan bila poster klien sudah ada judul acara agar tidak tumpang tindih
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              attractShowDefaultTitle: prev.attractShowDefaultTitle === false ? true : false 
                            }))}
                            className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all cursor-pointer ${
                              formData.attractShowDefaultTitle !== false
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}
                          >
                            {formData.attractShowDefaultTitle !== false ? 'ON (Ditampilkan)' : 'OFF (Sembunyikan)'}
                          </button>
                        </div>

                        {/* Dimming Slider */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-blue-500" />
                              <span>Overlay Gelap / Dimming:</span>
                            </label>
                            <span className="text-xs font-bold font-mono-tech px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                              {formData.attractDimming || 0}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="80"
                            step="5"
                            value={formData.attractDimming || 0}
                            onChange={e => setFormData({ ...formData, attractDimming: Number(e.target.value) })}
                            className="w-full accent-[#272a33] cursor-pointer"
                          />
                          <p className="text-[10px] text-slate-500">
                            Geser ke kanan jika warna poster terlalu terang agar tombol "Click to Start" mudah dibaca
                          </p>
                        </div>

                        {/* Custom CTA Text */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                            <Type className="w-3.5 h-3.5 text-amber-500" />
                            <span>Teks Tombol Mulai (CTA Text)</span>
                          </label>
                          <input
                            type="text"
                            value={formData.attractCustomCtaText || 'Click to Start'}
                            onChange={e => setFormData({ ...formData, attractCustomCtaText: e.target.value })}
                            placeholder="Contoh: Click to Start / Sentuh Layar / Mulai Foto 📸"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Live Kiosk Screen Preview (Right Column) */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>Pratinjau Layar Depan Kiosk:</span>
                    </div>

                    <div className="relative w-full aspect-[16/10] rounded-2xl border-3 border-[#272a33] overflow-hidden shadow-[4px_4px_0px_#272a33] bg-slate-900 flex flex-col justify-between p-3 select-none">
                      {/* Media Background */}
                      {formData.attractBackgroundMedia ? (
                        <>
                          {formData.attractMediaType === 'video' ? (
                            <video
                              src={formData.attractBackgroundMedia}
                              autoPlay
                              loop
                              muted
                              playsInline
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                            />
                          ) : (
                            <img
                              src={formData.attractBackgroundMedia}
                              alt="Attract Preview"
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                            />
                          )}
                          {/* Dimming Layer in Preview */}
                          {(formData.attractDimming || 0) > 0 && (
                            <div 
                              className="absolute inset-0 bg-black pointer-events-none"
                              style={{ opacity: (formData.attractDimming || 0) / 100 }}
                            />
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-[#fffef7] flex items-center justify-center pointer-events-none">
                          <div className="text-center">
                            <div className="text-xl font-black text-[#343a59] font-['Dela_Gothic_One']">SNAP BOOTH</div>
                            <div className="text-[9px] text-slate-500 font-mono-tech">DEFAULT RETRO NOTEBOOK</div>
                          </div>
                        </div>
                      )}

                      {/* Top Bar Preview */}
                      <div className="relative z-10 w-full flex justify-between items-center">
                        <div className="text-[8px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {formData.title || 'Event Name'}
                        </div>
                        <div className="text-[8px] font-bold text-white bg-[#272a33] px-2 py-0.5 rounded-full border border-white/20">
                          Page 01
                        </div>
                      </div>

                      {/* Center Content Preview */}
                      <div className="relative z-10 my-auto flex flex-col items-center text-center">
                        {formData.attractShowDefaultTitle !== false ? (
                          <div className="text-lg font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-['Dela_Gothic_One'] uppercase leading-tight">
                            SNAP<br/>BOOTH
                          </div>
                        ) : null}

                        {/* CTA Button in Preview */}
                        <div className="mt-1 px-4 py-1.5 rounded-full bg-[#272a33] text-amber-300 text-[10px] font-black border border-amber-300/80 shadow-md">
                          {formData.attractCustomCtaText || 'Click to Start'}
                        </div>
                      </div>

                      {/* Bottom Footer Preview */}
                      <div className="relative z-10 w-full flex justify-between items-center text-[8px] text-white/90">
                        <span className="font-bold">snapbooth.id</span>
                        <span>Sentuh layar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= SECTION B: EVENT TEXT & FOOTER INFO ================= */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-[#272a33] flex items-center gap-2 mb-0.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Informasi Teks & Footer Acara</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Teks ini otomatis tercetak pada footer foto strip dan halaman download softfile pengunjung
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <span>Nama Acara / Penyelenggara</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Contoh: WEDDING OF ANDI & RINA / NEO FEST 2026"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <span>Tagline / Subtitle Event</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="Contoh: SPECIAL MEMORIES & MOMENTS"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span>Lokasi Acara</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Contoh: THE RITZ-CARLTON JAKARTA"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Auto-Reset Idle Timeout (Detik)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.autoResetDelaySec}
                      onChange={e => setFormData({ ...formData, autoResetDelaySec: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* ================= SECTION C: WATERMARK & LOGO SPONSOR OVERLAY ================= */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#272a33] flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span>Watermark & Logo Sponsor Acara (Co-Branding Overlay)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-300">
                        Sponsor & Co-Branding
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sematkan logo sponsor, brand EO, atau corporate identity secara otomatis pada foto strip dan video Live Motion
                    </p>
                  </div>

                  {formData.watermarkImage && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          enableWatermark: prev.enableWatermark === false ? true : false 
                        }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                          formData.enableWatermark !== false
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{formData.enableWatermark !== false ? 'Overlay Aktif' : 'Overlay Nonaktif'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveWatermark}
                        className="p-1.5 rounded-full text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer transition-all"
                        title="Hapus Logo Watermark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Upload & Settings */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Upload File Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-purple-600" />
                          <span>File Logo Sponsor (Format PNG Transparan)</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Maks. 800px (Auto Kompres)</span>
                      </label>

                      {!formData.watermarkImage ? (
                        <label className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/70 transition-all cursor-pointer group">
                          <input
                            type="file"
                            accept="image/png,image/webp,image/jpeg"
                            onChange={handleWatermarkUpload}
                            className="hidden"
                          />
                          <div className="p-3 rounded-full bg-white border border-purple-200 shadow-xs text-purple-600 group-hover:scale-110 transition-transform mb-2">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                            Klik untuk Upload Logo Watermark / Sponsor
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            Gunakan logo berlatar belakang transparan (PNG) untuk hasil terbaik
                          </span>
                        </label>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="w-16 h-16 rounded-lg border border-slate-300 bg-[linear-gradient(45deg,#e2e8f0_25%,transparent_25%),linear-gradient(-45deg,#e2e8f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e2e8f0_75%),linear-gradient(-45deg,transparent_75%,#e2e8f0_75%)] bg-[size:10px_10px] flex items-center justify-center p-1 overflow-hidden shrink-0">
                            <img
                              src={formData.watermarkImage}
                              alt="Watermark Sponsor Logo"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-800 truncate">
                              Logo Sponsor Terpasang
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono-tech mt-0.5">
                              Ukuran: {formData.watermarkScale || 22}% • Opasitas: {formData.watermarkOpacity || 90}%
                            </div>
                            <label className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer">
                              <input
                                type="file"
                                accept="image/png,image/webp,image/jpeg"
                                onChange={handleWatermarkUpload}
                                className="hidden"
                              />
                              <Upload className="w-3 h-3" />
                              <span>Ganti Logo</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Watermark Controls (Position, Scale, Opacity) */}
                    {formData.watermarkImage && (
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
                        {/* Position Selector */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                            Posisi Watermark pada Foto Strip:
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                            {[
                              { id: 'bottom-right', label: 'Kanan Bwh', tip: 'Default' },
                              { id: 'bottom-left', label: 'Kiri Bwh', tip: '' },
                              { id: 'center-bottom', label: 'Tengah Bwh', tip: '' },
                              { id: 'top-right', label: 'Kanan Atas', tip: '' },
                              { id: 'top-left', label: 'Kiri Atas', tip: '' }
                            ].map(pos => {
                              const isSelected = (formData.watermarkPosition || 'bottom-right') === pos.id;
                              return (
                                <button
                                  key={pos.id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, watermarkPosition: pos.id })}
                                  className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                                    isSelected
                                      ? 'bg-[#272a33] text-[#fef08a] border-[#272a33] shadow-[2px_2px_0px_#272a33]'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>{pos.label}</span>
                                  {pos.tip && (
                                    <span className={`text-[8px] mt-0.5 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`}>
                                      {pos.tip}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Scale / Size Slider */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-purple-600" />
                              <span>Ukuran Logo (Skala Strip):</span>
                            </label>
                            <span className="text-xs font-bold font-mono-tech px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                              {formData.watermarkScale || 22}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="45"
                            step="1"
                            value={formData.watermarkScale || 22}
                            onChange={e => setFormData({ ...formData, watermarkScale: Number(e.target.value) })}
                            className="w-full accent-purple-600 cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                            <span>Kecil (10%)</span>
                            <span>Sedang (22%)</span>
                            <span>Besar (45%)</span>
                          </div>
                        </div>

                        {/* Opacity Slider */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-purple-600" />
                              <span>Transparansi / Opasitas Logo:</span>
                            </label>
                            <span className="text-xs font-bold font-mono-tech px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                              {formData.watermarkOpacity || 90}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            step="5"
                            value={formData.watermarkOpacity || 90}
                            onChange={e => setFormData({ ...formData, watermarkOpacity: Number(e.target.value) })}
                            className="w-full accent-purple-600 cursor-pointer"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                            <span>Samar / Halus (20%)</span>
                            <span>Solid / Jelas (100%)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Live Interactive Strip Mockup Preview */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span>Pratinjau Posisi pada Strip Foto:</span>
                    </div>

                    <div className="relative w-44 aspect-[1/3] rounded-2xl border-3 border-[#272a33] overflow-hidden shadow-[6px_6px_0px_#272a33] bg-[#fffef7] flex flex-col justify-between p-2.5 select-none">
                      {/* Header Mockup */}
                      <div className="text-center pt-1 pb-1">
                        <div className="text-[9px] font-black text-[#272a33] truncate font-['Outfit']">
                          {formData.title || 'SNAPBOOTH EVENT'}
                        </div>
                      </div>

                      {/* Photo Poses Slots Mockup */}
                      <div className="flex-1 flex flex-col gap-1.5 justify-center py-1">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i} 
                            className="w-full flex-1 rounded-lg bg-slate-200/90 border border-slate-300 flex items-center justify-center text-[8px] font-bold text-slate-400 font-mono-tech"
                          >
                            Pose {i}
                          </div>
                        ))}
                      </div>

                      {/* Footer Mockup */}
                      <div className="text-center pt-1 pb-0.5 border-t border-slate-200/60">
                        <div className="text-[8px] font-bold text-slate-700 truncate">
                          {formData.subtitle || 'SPECIAL MOMENTS'}
                        </div>
                        <div className="text-[7px] text-slate-400 font-mono-tech">
                          {formData.location || 'EVENT VENUE'}
                        </div>
                      </div>

                      {/* Dynamic Watermark Overlay on Mockup */}
                      {formData.watermarkImage && formData.enableWatermark !== false && (
                        <div
                          className="absolute pointer-events-none z-20"
                          style={{
                            width: `${formData.watermarkScale || 22}%`,
                            opacity: (formData.watermarkOpacity || 90) / 100,
                            ...(formData.watermarkPosition === 'bottom-right' && {
                              right: '8px',
                              bottom: '8px'
                            }),
                            ...(formData.watermarkPosition === 'bottom-left' && {
                              left: '8px',
                              bottom: '8px'
                            }),
                            ...(formData.watermarkPosition === 'center-bottom' && {
                              left: '50%',
                              transform: 'translateX(-50%)',
                              bottom: '8px'
                            }),
                            ...(formData.watermarkPosition === 'top-right' && {
                              right: '8px',
                              top: '8px'
                            }),
                            ...(formData.watermarkPosition === 'top-left' && {
                              left: '8px',
                              top: '8px'
                            })
                          }}
                        >
                          <img
                            src={formData.watermarkImage}
                            alt="Watermark Preview"
                            className="w-full h-auto object-contain drop-shadow-xs"
                          />
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 mt-2 font-mono-tech">
                      Mockup Photo Strip (2x6 inch)
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-7 py-3 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[4px_4px_0px_#3b82f6] text-xs font-black flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan Pengaturan Event & Attract Screen</span>
                </button>
              </div>
            </form>
          )}

          {/* ----------------- TAB 3: CAMERA & PRINTER MANAGEMENT ----------------- */}
          {activeTab === 'camera' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              
              {/* ================= SECTION A: LIVE PAPER ROLL COUNTER & GAUGE ================= */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#272a33] flex items-center gap-2">
                      <Printer className="w-4 h-4 text-blue-600" />
                      <span>Monitor Kertas & Status Roll Printer</span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${
                        ((printerStatus?.paperRemaining ?? 400) / (printerStatus?.paperRollCapacity || 400)) > 0.25
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : ((printerStatus?.paperRemaining ?? 400) / (printerStatus?.paperRollCapacity || 400)) > 0.10
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-red-100 text-red-800 border-red-300 animate-bounce'
                      }`}>
                        {((printerStatus?.paperRemaining ?? 400) / (printerStatus?.paperRollCapacity || 400)) > 0.25
                          ? '🟢 ROLL AMAN'
                          : ((printerStatus?.paperRemaining ?? 400) / (printerStatus?.paperRollCapacity || 400)) > 0.10
                          ? '🟡 SIAPKAN ROLL'
                          : '🔴 KRITIS (HABIS)'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Memantau konsumsi media kertas foto dye-sub (DNP / Citizen / HiTi) secara real-time
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-mono-tech block">Total Cetak Hari Ini:</span>
                    <span className="text-base font-black text-[#272a33] font-mono-tech">
                      {printerStatus?.totalPrintsToday || 0} Lembar
                    </span>
                  </div>
                </div>

                {/* Visual Paper Gauge */}
                {(() => {
                  const capacity = printerStatus?.paperRollCapacity || 400;
                  const remaining = printerStatus?.paperRemaining ?? 400;
                  const percent = Math.min(100, Math.max(0, Math.round((remaining / capacity) * 100)));
                  const isLow = percent <= 25;
                  const isCritical = percent <= 10;

                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-700 flex items-center gap-1.5 font-mono-tech">
                          <Layers className="w-3.5 h-3.5 text-blue-500" />
                          <span>Sisa Kertas: <strong>{remaining}</strong> dari {capacity} Lembar</span>
                        </span>
                        <span className={`font-mono-tech px-2 py-0.5 rounded text-xs font-black ${
                          isCritical ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {percent}% Tersedia
                        </span>
                      </div>

                      {/* Progress Bar Track */}
                      <div className="w-full h-4 rounded-full bg-slate-100 border-2 border-[#272a33] overflow-hidden p-0.5 relative shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-gradient-to-r from-red-500 to-rose-600' : isLow ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Roll Reset Quick Buttons */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 mb-2 block flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                    <span>Pasang Roll Baru / Reset Counter Kertas:</span>
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Pasang roll baru 400 lembar (DNP RX1HS)? Sisa kertas akan direset menjadi 400 lembar.')) {
                          resetPaperRoll(400);
                          setReprintFeedback('Roll baru 400 lembar berhasil dipasang!');
                          setTimeout(() => setReprintFeedback(null), 3000);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-[#272a33] text-xs font-black text-[#272a33] shadow-[2px_2px_0px_#272a33] cursor-pointer transition-all active:scale-95"
                    >
                      🔄 Roll 400 Lembar (DNP)
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Pasang roll baru 700 lembar (Citizen / HiTi)? Sisa kertas akan direset menjadi 700 lembar.')) {
                          resetPaperRoll(700);
                          setReprintFeedback('Roll baru 700 lembar berhasil dipasang!');
                          setTimeout(() => setReprintFeedback(null), 3000);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border-2 border-[#272a33] text-xs font-black text-[#272a33] shadow-[2px_2px_0px_#272a33] cursor-pointer transition-all active:scale-95"
                    >
                      🔄 Roll 700 Lembar (Citizen)
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCustomRollModal(!showCustomRollModal)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      ⚙️ Custom Lembar...
                    </button>
                  </div>

                  {showCustomRollModal && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Jumlah lembar baru (misal: 250)"
                        value={customRollInput}
                        onChange={e => setCustomRollInput(e.target.value)}
                        className="w-48 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const num = Number(customRollInput);
                          if (num > 0) {
                            resetPaperRoll(num);
                            setShowCustomRollModal(false);
                            setCustomRollInput('');
                            setReprintFeedback(`Kapasitas kertas berhasil diatur ke ${num} lembar!`);
                            setTimeout(() => setReprintFeedback(null), 3000);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#272a33] text-white text-xs font-bold cursor-pointer"
                      >
                        Terapkan
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ================= SECTION B: EMERGENCY OPERATOR REPRINT ================= */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#272a33] flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-purple-600" />
                      <span>Cetak Ulang Sesi Terakhir (Emergency Operator Reprint)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold border border-purple-300">
                        Crew Tool
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cetak ulang foto sesi terakhir langsung tanpa perlu tamu mengulang sesi foto (solusi kertas macet / minta cetak ekstra)
                    </p>
                  </div>

                  {reprintFeedback && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold font-mono-tech animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{reprintFeedback}</span>
                    </div>
                  )}
                </div>

                {printerStatus?.lastPrintedPhoto ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex-wrap sm:flex-nowrap">
                    {/* Thumbnail of Last Photo */}
                    <div className="relative w-20 h-32 rounded-xl border-2 border-[#272a33] shadow-[2px_2px_0px_#272a33] overflow-hidden bg-white shrink-0 p-1 flex items-center justify-center">
                      <img 
                        src={printerStatus.lastPrintedPhoto} 
                        alt="Last Printed" 
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>

                    {/* Metadata & Reprint Actions */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <span className="text-xs font-bold text-[#272a33] block truncate">
                          Frame: {printerStatus.lastPrintedFrameName || 'Default Frame'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono-tech block">
                          Dicetak pada: {printerStatus.lastPrintedDate || 'Baru Saja'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const success = reprintLastSession(1);
                            if (success) {
                              setReprintFeedback('Perintah Cetak Ulang (1 Lembar) Terkirim ke Printer!');
                              setTimeout(() => setReprintFeedback(null), 3500);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[2px_2px_0px_#fde047] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-300" />
                          <span>Cetak Ulang 1 Lembar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const success = reprintLastSession(2);
                            if (success) {
                              setReprintFeedback('Perintah Cetak Ulang (2 Lembar) Terkirim ke Printer!');
                              setTimeout(() => setReprintFeedback(null), 3500);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-[#272a33] text-[#272a33] shadow-[2px_2px_0px_#272a33] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          <span>Cetak 2 Lembar (Sepasang)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500 font-medium">
                    Belum ada sesi foto yang dicetak pada sesi event ini. Foto terakhir yang dicetak akan otomatis muncul di sini.
                  </div>
                )}
              </div>

              {/* ================= SECTION C: CAMERA & SESSION PARAMETERS ================= */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-[#272a33] flex items-center gap-2 mb-0.5">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <span>Pengaturan Perangkat Kamera & Timer Sesi</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pilih perangkat kamera DSLR/Capture Card dan atur durasi timer hitung mundur
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-purple-600" />
                    <span>Sumber Kamera (DSLR / Capture Card / Webcam)</span>
                  </label>
                  <select
                    value={formData.cameraDeviceId}
                    onChange={e => setFormData({ ...formData, cameraDeviceId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">-- Gunakan Kamera Default Sistem --</option>
                    {videoDevices.map((dev, idx) => (
                      <option key={dev.deviceId || idx} value={dev.deviceId}>
                        {dev.label || `Kamera ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Durasi Hitung Mundur</span>
                    </label>
                    <select
                      value={formData.countdownSec}
                      onChange={e => setFormData({ ...formData, countdownSec: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="3">3 Detik (Cepat / Antrean Ramai)</option>
                      <option value="5">5 Detik (Standar Rekomendasi)</option>
                      <option value="7">7 Detik (Santai / Grup Besar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
                      <span>Batas Foto Ulang (Retake)</span>
                    </label>
                    <select
                      value={formData.maxRetakes ?? 2}
                      onChange={e => setFormData({ ...formData, maxRetakes: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="0">0x (Tanpa Retake / Fast Queue)</option>
                      <option value="1">1x Foto Ulang per Pose</option>
                      <option value="2">2x Foto Ulang per Pose (Standar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                      <span>Durasi Live Motion Video</span>
                    </label>
                    <select
                      value={formData.motionDurationSec ?? 4}
                      onChange={e => setFormData({ ...formData, motionDurationSec: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="3">3 Detik</option>
                      <option value="4">4 Detik (Standar HD)</option>
                      <option value="5">5 Detik</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Printer className="w-3.5 h-3.5 text-pink-500" />
                    <span>Nama Driver Printer Kiosk</span>
                  </label>
                  <input
                    type="text"
                    value={formData.printerName}
                    onChange={e => setFormData({ ...formData, printerName: e.target.value })}
                    placeholder="Contoh: DNP DS-RX1HS / Citizen CX-02"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Part C: Multi-Print & Extra Copies Configuration */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-[#272a33] flex items-center gap-2 mb-0.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Pengaturan Multi-Print & Cetak Ekstra (Upselling)</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Atur jumlah cetak bawaan per sesi, batas maksimal, dan opsi penambahan tarif untuk lembar ekstra
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Jumlah Cetak Default (Bawaan)
                    </label>
                    <select
                      value={formData.defaultPrintCopies || 2}
                      onChange={e => setFormData({ ...formData, defaultPrintCopies: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="1">1 Lembar</option>
                      <option value="2">2 Lembar (Standar Sepasang Strip 2x6)</option>
                      <option value="3">3 Lembar</option>
                      <option value="4">4 Lembar</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Batas Maksimal Cetak per Sesi
                    </label>
                    <select
                      value={formData.maxPrintCopies || 4}
                      onChange={e => setFormData({ ...formData, maxPrintCopies: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="2">Maks 2 Lembar</option>
                      <option value="3">Maks 3 Lembar</option>
                      <option value="4">Maks 4 Lembar (Rekomendasi)</option>
                      <option value="6">Maks 6 Lembar (Grup Besar)</option>
                      <option value="8">Maks 8 Lembar</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Mode Cetak Ekstra
                    </label>
                    <select
                      value={formData.extraCopyMode || 'free'}
                      onChange={e => setFormData({ ...formData, extraCopyMode: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="free">🎉 Gratis (Included s/d Batas Maksimal)</option>
                      <option value="paid">💰 Berbayar (Upselling per Lembar Tambahan)</option>
                    </select>
                  </div>
                </div>

                {formData.extraCopyMode === 'paid' && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-xs font-black text-amber-950 block">
                        Tarif per Lembar Tambahan (Upsell Price)
                      </span>
                      <p className="text-[11px] text-amber-800">
                        Dikenakan untuk setiap lembar yang melebihi jumlah default ({formData.defaultPrintCopies || 2} lembar)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">Rp</span>
                      <input
                        type="number"
                        value={formData.extraCopyPrice || 10000}
                        onChange={e => setFormData({ ...formData, extraCopyPrice: Number(e.target.value) })}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white border-2 border-[#272a33] text-xs font-mono-tech font-bold"
                        step="1000"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-7 py-3 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[4px_4px_0px_#3b82f6] text-xs font-black flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan Pengaturan Kamera & Printer</span>
                </button>
              </div>
            </form>
          )}

          {/* ----------------- TAB 4: PAYMENT & VOUCHER ACCESS ----------------- */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              {/* Part 1: Operational Mode & Price */}
              <form onSubmit={handleSaveSettings} className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-4">
                <div>
                  <h4 className="font-extrabold text-sm text-[#272a33] flex items-center gap-2 mb-0.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Mode Operasional & Tarif Sesi</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tentukan apakah photo booth berjalan gratis untuk acara sewa/wedding atau berbayar per sesi
                  </p>
                </div>

                {/* Mode Selector Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div
                    onClick={() => setFormData({ ...formData, eventMode: 'free' })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.eventMode === 'free'
                        ? 'border-[#272a33] bg-[#fef08a]/40 shadow-[3px_3px_0px_#272a33] ring-2 ring-[#272a33]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-amber-400 text-[#272a33] border border-[#272a33]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-[#272a33] uppercase">
                        🎉 Free Event Mode (Unlimited)
                      </h5>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                        Tamu langsung foto tanpa halaman QRIS. Cocok untuk Wedding, Pesta Ulang Tahun, dan Event Sewa.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, eventMode: 'paid' })}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      formData.eventMode === 'paid'
                        ? 'border-[#272a33] bg-[#bfdbfe]/40 shadow-[3px_3px_0px_#272a33] ring-2 ring-[#272a33]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-blue-500 text-white border border-[#272a33]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-[#272a33] uppercase">
                        💰 Commercial Mode (Bayar QRIS)
                      </h5>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
                        Tamu wajib scan QRIS sebelum foto. Voucher VIP / Panitia tetap bisa dipakai untuk bypass bayar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price field if paid */}
                {formData.eventMode === 'paid' && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-[#272a33]">
                    <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Tarif per Sesi Foto (Rupiah)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#3b82f6] text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-300" />
                    <span>Simpan Mode & Tarif</span>
                  </button>
                </div>
              </form>

              {/* Part 2: Voucher & VIP Coupon Manager */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#272a33] flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-pink-600" />
                      <span>Sistem Voucher & Kupon VIP Panitia</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold border border-pink-300 font-mono-tech">
                        {vouchers?.length || 0} Kupon
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Buat kode kupon khusus untuk panitia, sponsor, MC, atau promo diskon sesi komersial
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Bulk VIP Generator Button */}
                    <button
                      type="button"
                      onClick={() => setShowBulkModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-700" />
                      <span>Generate Kupon VIP</span>
                    </button>

                    {/* Add Voucher Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingVoucher(!isAddingVoucher);
                        setVoucherFormError('');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#272a33] hover:bg-[#1a1c22] text-white border border-[#272a33] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAddingVoucher ? 'Tutup Form' : 'Tambah Kupon'}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Voucher Form */}
                {isAddingVoucher && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setVoucherFormError('');
                      const res = addVoucher(newVoucherForm);
                      if (res.success) {
                        setIsAddingVoucher(false);
                        setNewVoucherForm({
                          code: '',
                          type: 'free',
                          discountValue: 100,
                          maxUses: -1,
                          description: ''
                        });
                      } else {
                        setVoucherFormError(res.message);
                      }
                    }}
                    className="p-4 rounded-xl bg-[#faf6ea] border-2 border-[#272a33] space-y-3 animate-fade-in"
                  >
                    <h5 className="font-black text-xs text-[#272a33] uppercase flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-pink-600" />
                      <span>Buat Kode Kupon / Voucher Baru</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                          Kode Voucher (Huruf/Angka)
                        </label>
                        <input
                          type="text"
                          value={newVoucherForm.code}
                          onChange={(e) => setNewVoucherForm({ ...newVoucherForm, code: e.target.value.toUpperCase() })}
                          placeholder="Misal: VIPWEDDING"
                          className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-[#272a33] text-xs font-mono-tech font-bold uppercase focus:outline-none focus:ring-2 focus:ring-pink-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                          Jenis Kupon
                        </label>
                        <select
                          value={newVoucherForm.type}
                          onChange={(e) => setNewVoucherForm({ ...newVoucherForm, type: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-[#272a33] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="free">🎉 100% Gratis (Akses VIP Bypass)</option>
                          <option value="percentage">🏷️ Diskon Persen (%)</option>
                          <option value="nominal">💰 Potongan Nominal (Rp)</option>
                        </select>
                      </div>

                      {newVoucherForm.type !== 'free' && (
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                            {newVoucherForm.type === 'percentage' ? 'Persen Diskon (%)' : 'Potongan Rupiah (Rp)'}
                          </label>
                          <input
                            type="number"
                            value={newVoucherForm.discountValue}
                            onChange={(e) => setNewVoucherForm({ ...newVoucherForm, discountValue: e.target.value })}
                            placeholder={newVoucherForm.type === 'percentage' ? '50' : '15000'}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-[#272a33] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                            required
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                          Batas Kuota Pemakaian
                        </label>
                        <select
                          value={newVoucherForm.maxUses}
                          onChange={(e) => setNewVoucherForm({ ...newVoucherForm, maxUses: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-[#272a33] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="-1">Unlimited (Tanpa Batas)</option>
                          <option value="1">1x Pakai (Sekali Pakai)</option>
                          <option value="5">5x Sesi</option>
                          <option value="10">10x Sesi</option>
                          <option value="50">50x Sesi</option>
                          <option value="100">100x Sesi</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                        Keterangan / Catatan Panitia
                      </label>
                      <input
                        type="text"
                        value={newVoucherForm.description}
                        onChange={(e) => setNewVoucherForm({ ...newVoucherForm, description: e.target.value })}
                        placeholder="Contoh: Khusus Tamu Keluarga Mempelai / Kru Vendor"
                        className="w-full px-3 py-1.5 rounded-lg bg-white border-2 border-[#272a33] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    {voucherFormError && (
                      <p className="text-xs font-bold text-rose-600">
                        ⚠ {voucherFormError}
                      </p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingVoucher(false)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-1.5 rounded-lg bg-[#272a33] text-[#fef08a] hover:bg-[#1a1c22] font-black text-xs border-2 border-[#272a33] shadow-[2px_2px_0px_#fde047] cursor-pointer"
                      >
                        Simpan Kupon
                      </button>
                    </div>
                  </form>
                )}

                {/* Bulk Generator Modal Dialog */}
                {showBulkModal && (
                  <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-400 space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h5 className="font-black text-xs text-amber-950 uppercase flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600" />
                        <span>⚡ Generator Kupon VIP Acak (Sekali Pakai)</span>
                      </h5>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBulkModal(false);
                          setBulkGeneratedList([]);
                        }}
                        className="text-slate-400 hover:text-slate-700 text-xs"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-amber-800">
                      Buat beberapa kode voucher acak 1x pakai secara instan untuk dibagikan ke tamu VIP atau undangan khusus.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-amber-900 mb-1 block">Prefix Kode</label>
                        <input
                          type="text"
                          value={bulkPrefix}
                          onChange={e => setBulkPrefix(e.target.value.toUpperCase())}
                          placeholder="VIP"
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-amber-400 text-xs font-mono-tech font-bold uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-amber-900 mb-1 block">Jumlah Kupon</label>
                        <select
                          value={bulkCount}
                          onChange={e => setBulkCount(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg bg-white border border-amber-400 text-xs font-semibold"
                        >
                          <option value="3">3 Kode</option>
                          <option value="5">5 Kode (Standar)</option>
                          <option value="10">10 Kode</option>
                          <option value="20">20 Kode</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const generated = generateBulkRandomVouchers({
                              prefix: bulkPrefix || 'VIP',
                              count: bulkCount,
                              type: 'free',
                              discountValue: 100,
                              maxUses: 1,
                              description: 'Kupon VIP Sekali Pakai'
                            });
                            setBulkGeneratedList(generated);
                          }}
                          className="w-full py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-[#272a33] font-black text-xs border border-[#272a33] shadow-sm cursor-pointer"
                        >
                          Generate Sekarang
                        </button>
                      </div>
                    </div>

                    {bulkGeneratedList.length > 0 && (
                      <div className="p-3 rounded-lg bg-white border border-amber-300 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-emerald-800">
                            ✓ {bulkGeneratedList.length} Kupon Baru Siap Digunakan:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const textList = bulkGeneratedList.map(v => v.code).join('\n');
                              navigator.clipboard.writeText(`🎟️ *DAFTAR KODE VOUCHER VIP SNAPBOOTH:*\n${textList}`);
                              setCopiedBulk(true);
                              setTimeout(() => setCopiedBulk(false), 2500);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedBulk ? 'Tersalin!' : 'Salin Semua'}</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {bulkGeneratedList.map(v => (
                            <span key={v.id} className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono-tech font-bold">
                              {v.code}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vouchers List Table / Cards */}
                {vouchers?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                    {vouchers.map((vch) => {
                      const isLimitReached = vch.maxUses > 0 && vch.usedCount >= vch.maxUses;
                      return (
                        <div
                          key={vch.id}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            !vch.active || isLimitReached
                              ? 'bg-slate-50 border-slate-200 opacity-60'
                              : 'bg-white border-[#272a33] shadow-[2px_2px_0px_#272a33]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border shrink-0 ${
                              vch.type === 'free' 
                                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                                : 'bg-blue-100 text-blue-900 border-blue-300'
                            }`}>
                              {vch.type === 'free' ? <Crown className="w-4 h-4" /> : <Tag className="w-4 h-4" />}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono-tech font-black text-xs text-[#272a33] tracking-wide">
                                  {vch.code}
                                </span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  vch.type === 'free'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-blue-100 text-blue-800 border-blue-300'
                                }`}>
                                  {vch.type === 'free' 
                                    ? '100% GRATIS VIP' 
                                    : vch.type === 'percentage' 
                                    ? `DISKON ${vch.discountValue}%` 
                                    : `POTONGAN Rp ${Number(vch.discountValue).toLocaleString('id-ID')}`
                                  }
                                </span>
                                {!vch.active && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                                    NONAKTIF
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                                {vch.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                            {/* Usage Count Pill */}
                            <div className="text-right font-mono-tech">
                              <span className="text-[11px] font-bold text-slate-700 block">
                                {vch.usedCount || 0} / {vch.maxUses === -1 ? '∞' : vch.maxUses} dipakai
                              </span>
                              {isLimitReached && (
                                <span className="text-[9px] font-bold text-rose-600 block">
                                  Kuota Habis
                                </span>
                              )}
                            </div>

                            {/* Active Toggle */}
                            <button
                              type="button"
                              onClick={() => toggleVoucherActive(vch.id)}
                              className={`p-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                                vch.active 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                              }`}
                              title={vch.active ? 'Nonaktifkan Kupon' : 'Aktifkan Kupon'}
                            >
                              {vch.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete Voucher */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus kupon "${vch.code}"?`)) {
                                  deleteVoucher(vch.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer transition-all"
                              title="Hapus Kupon"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500 font-medium">
                    Belum ada kupon yang dibuat. Klik tombol "+ Tambah Kupon" di atas.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ----------------- TAB 5: STATISTIK, OMSET & MASTER EXPORT ----------------- */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Header with Quick Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h4 className="font-extrabold text-base text-[#272a33] flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <span>Dashboard Statistik & Omset Event</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-300">
                      LIVE REPORT
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rangkuman data sesi foto, pendapatan QRIS, frame terlaris, dan ekspor dokumentasi event
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Copy WhatsApp Summary Button */}
                  <button
                    type="button"
                    onClick={handleCopyWhatsAppReport}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#272a33] active:scale-95 ${
                      copiedWhatsApp 
                        ? 'bg-emerald-500 text-white border-[#272a33]' 
                        : 'bg-[#25D366] text-white hover:bg-[#20bd5a] border-[#272a33]'
                    }`}
                  >
                    {copiedWhatsApp ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWhatsApp ? 'Laporan Tersalin!' : 'Salin Laporan WhatsApp'}</span>
                  </button>

                  {/* Reset Analytics Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin mereset statistik sesi untuk memulai event baru? Data sesi sebelumnya akan dikosongkan.')) {
                        resetEventAnalytics();
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1 cursor-pointer transition-all"
                    title="Reset Statistik Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>

              {/* ================= 4 KPI METRIC CARDS ================= */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Total Omset QRIS */}
                <div className="p-4 rounded-2xl bg-white border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold font-mono-tech">TOTAL OMSET QRIS</span>
                    <Coins className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl font-black text-emerald-600 font-display tracking-tight truncate">
                    Rp {Number(eventAnalytics?.totalRevenue || 0).toLocaleString('id-ID')}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {eventAnalytics?.paidSessionsCount || 0} Sesi Berbayar
                  </p>
                </div>

                {/* 2. Total Sesi Selesai */}
                <div className="p-4 rounded-2xl bg-white border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold font-mono-tech">TOTAL SESI FOTO</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xl font-black text-[#272a33] font-display tracking-tight">
                    {eventAnalytics?.sessionsCount || 0} <span className="text-xs font-bold text-slate-500 font-mono-tech">Sesi</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {eventAnalytics?.freeSessionsCount || 0} Free • {eventAnalytics?.paidSessionsCount || 0} Paid
                  </p>
                </div>

                {/* 3. Kertas Tercetak */}
                <div className="p-4 rounded-2xl bg-white border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold font-mono-tech">KERTAS TERCETAK</span>
                    <Printer className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-xl font-black text-[#272a33] font-display tracking-tight">
                    {printerStatus?.totalPrintsToday || 0} <span className="text-xs font-bold text-slate-500 font-mono-tech">Lembar</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    Sisa {printerStatus?.paperRemaining ?? 400} lbr di roll
                  </p>
                </div>

                {/* 4. Rata-Rata Kecepatan Sesi */}
                <div className="p-4 rounded-2xl bg-white border-2 border-[#272a33] shadow-[3px_3px_0px_#272a33] space-y-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold font-mono-tech">ESTIMASI DURASI</span>
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-xl font-black text-[#272a33] font-display tracking-tight">
                    ~1.5 <span className="text-xs font-bold text-slate-500 font-mono-tech">Menit</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    Flow Cepat & Antrean Lancar
                  </p>
                </div>
              </div>

              {/* ================= 2 ANALYTICS GRIDS: FRAMES & FILTERS ================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Panel A: Frame Leaderboard */}
                <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-3">
                  <h5 className="font-black text-xs text-[#272a33] uppercase flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Ranking Desain Frame Terfavorit</span>
                  </h5>

                  {(() => {
                    const frameStats = eventAnalytics?.frameStats || {};
                    const entries = Object.entries(frameStats).sort((a, b) => b[1] - a[1]);
                    const totalCount = eventAnalytics?.sessionsCount || 1;

                    if (entries.length === 0) {
                      return (
                        <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500 font-medium">
                          Belum ada sesi foto yang tercatat.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2.5">
                        {entries.map(([name, count], idx) => {
                          const percent = Math.round((count / totalCount) * 100);
                          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '•';
                          return (
                            <div key={name} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-800 truncate max-w-[200px]">
                                  {medal} {name}
                                </span>
                                <span className="font-mono-tech text-[11px] text-slate-600 font-bold">
                                  {count}x ({percent}%)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Panel B: Filter Breakdown */}
                <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-3">
                  <h5 className="font-black text-xs text-[#272a33] uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span>Filter Foto Yang Sering Dipilih</span>
                  </h5>

                  {(() => {
                    const filterStats = eventAnalytics?.filterStats || {};
                    const entries = Object.entries(filterStats).sort((a, b) => b[1] - a[1]);
                    const totalCount = eventAnalytics?.sessionsCount || 1;

                    if (entries.length === 0) {
                      return (
                        <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500 font-medium">
                          Belum ada data pilihan filter tamu.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2.5">
                        {entries.map(([id, count]) => {
                          const percent = Math.round((count / totalCount) * 100);
                          const formattedName = id.replace(/[-_]/g, ' ').toUpperCase();
                          return (
                            <div key={id} className="space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-800">
                                  ✨ {formattedName}
                                </span>
                                <span className="font-mono-tech text-[11px] text-slate-600 font-bold">
                                  {count}x ({percent}%)
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600" 
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ================= RECENT TRANSACTIONS / SESSION LOGS ================= */}
              <div className="p-5 rounded-2xl bg-white border-2 border-[#272a33] shadow-[4px_4px_0px_#272a33] space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="font-black text-xs text-[#272a33] uppercase flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Riwayat Sesi Foto Terakhir</span>
                  </h5>
                  <span className="text-[10px] text-slate-500 font-mono-tech">
                    Menampilkan 10 sesi terbaru
                  </span>
                </div>

                {eventAnalytics?.sessionLogs?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b-2 border-slate-200 text-slate-500 font-mono-tech">
                          <th className="pb-2 font-bold">Waktu</th>
                          <th className="pb-2 font-bold">Desain Frame</th>
                          <th className="pb-2 font-bold">Filter</th>
                          <th className="pb-2 font-bold">Mode</th>
                          <th className="pb-2 font-bold text-right">Tarif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {eventAnalytics.sessionLogs.slice(0, 10).map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50">
                            <td className="py-2.5 text-slate-600 font-mono-tech">
                              {log.timestamp} • {log.date}
                            </td>
                            <td className="py-2.5 font-bold text-[#272a33]">
                              {log.frameName}
                            </td>
                            <td className="py-2.5 text-slate-600">
                              {log.filterId}
                            </td>
                            <td className="py-2.5">
                              <div className="flex flex-col items-start gap-1">
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                  log.isPaid
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                }`}>
                                  {log.isPaid ? 'QRIS PAID' : 'FREE EVENT'}
                                </span>
                                {log.voucherCode && (
                                  <span className="text-[9px] font-mono-tech font-bold px-1.5 py-0.5 rounded-md bg-pink-50 text-pink-700 border border-pink-300 flex items-center gap-1">
                                    <Ticket className="w-2.5 h-2.5 text-pink-600" />
                                    <span>{log.voucherCode}</span>
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 text-right font-bold text-[#272a33] font-mono-tech">
                              {log.amount > 0 ? `Rp ${log.amount.toLocaleString('id-ID')}` : 'Gratis'}
                              {log.discountAmount > 0 && (
                                <span className="block text-[9px] text-emerald-600 font-medium">
                                  -Rp {log.discountAmount.toLocaleString('id-ID')}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-500 font-medium">
                    Belum ada riwayat sesi foto hari ini.
                  </div>
                )}
              </div>

              {/* ================= MASTER ZIP EVENT EXPORT CARD ================= */}
              <div className="p-6 rounded-3xl bg-white border-3 border-[#272a33] shadow-[6px_6px_0px_#272a33] flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-xs font-mono-tech font-bold text-indigo-600 uppercase tracking-wider">
                    ARSIP DOKUMENTASI LENGKAP
                  </span>
                  <h4 className="text-lg font-black text-[#272a33] font-display">
                    Download Semua File Foto Acara (Master ZIP)
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md">
                    Ekspor seluruh Photo Strip HD, Pose Satuan, dan GIF animasi dari setiap tamu dalam 1 file ZIP untuk diserahkan ke panitia/klien.
                  </p>
                </div>

                <button
                  onClick={handleExportAllZip}
                  disabled={isExporting}
                  className="px-8 py-3.5 rounded-full bg-[#272a33] text-[#fef08a] hover:bg-[#1a1c22] border-3 border-[#272a33] shadow-[4px_4px_0px_#fde047] font-black text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Mengompres File ZIP...' : 'Download Master ZIP Event'}</span>
                </button>
              </div>

              {exportSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>File Master ZIP berhasil di-generate dan diunduh ke komputer Anda!</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
