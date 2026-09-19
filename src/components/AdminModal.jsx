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
  HelpCircle
} from 'lucide-react';

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
    exportMasterEventZip
  } = useBooth();

  const [activeTab, setActiveTab] = useState('frames'); // 'frames' | 'event' | 'camera' | 'payment' | 'export'
  const [formData, setFormData] = useState(eventSettings);
  const [videoDevices, setVideoDevices] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

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
      autoResetDelaySec: Number(formData.autoResetDelaySec) || 90
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
            { id: 'camera', label: '📷 Kamera & Sesi', icon: Camera },
            { id: 'payment', label: '💳 Mode Acara', icon: DollarSign },
            { id: 'export', label: '📊 Master Galeri', icon: FolderArchive }
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
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <h4 className="font-extrabold text-base text-[#272a33] flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Informasi & Branding Acara</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Teks ini otomatis tercetak pada footer foto dan halaman download softfile pengunjung
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

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#3b82f6] text-xs font-black flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan Pengaturan Event</span>
                </button>
              </div>
            </form>
          )}

          {/* ----------------- TAB 3: CAMERA & SESSION ----------------- */}
          {activeTab === 'camera' && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <h4 className="font-extrabold text-base text-[#272a33] flex items-center gap-2 mb-1">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <span>Pengaturan Kamera & Sesi Foto</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4">
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
                  className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#3b82f6] text-xs font-black flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan Pengaturan Kamera</span>
                </button>
              </div>
            </form>
          )}

          {/* ----------------- TAB 4: PAYMENT & EVENT ACCESS ----------------- */}
          {activeTab === 'payment' && (
            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <h4 className="font-extrabold text-base text-[#272a33] flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Mode Operasional & Pembayaran</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Tentukan apakah photo booth berjalan gratis untuk acara khusus atau berbayar per sesi
                </p>
              </div>

              {/* Mode Selector Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, eventMode: 'free' })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    formData.eventMode === 'free'
                      ? 'border-[#272a33] bg-[#fef08a]/40 shadow-[4px_4px_0px_#272a33] ring-2 ring-[#272a33]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-amber-400 text-[#272a33] border border-[#272a33]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-[#272a33] uppercase">
                      🎉 Free Event Mode (Unlimited)
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Pengunjung langsung memilih frame & foto tanpa halaman pembayaran QRIS. Cocok untuk Wedding, Pesta Ulang Tahun, dan Event Sewa.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setFormData({ ...formData, eventMode: 'paid' })}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    formData.eventMode === 'paid'
                      ? 'border-[#272a33] bg-[#bfdbfe]/40 shadow-[4px_4px_0px_#272a33] ring-2 ring-[#272a33]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-blue-500 text-white border border-[#272a33]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs text-[#272a33] uppercase">
                      💰 Commercial Mode (Bayar QRIS)
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Pengunjung harus melakukan pembayaran scan QRIS terlebih dahulu sebelum dapat memilih frame dan memulai foto.
                    </p>
                  </div>
                </div>
              </div>

              {/* Price field if paid */}
              {formData.eventMode === 'paid' && (
                <div className="p-4 rounded-2xl bg-white border-2 border-[#272a33] shadow-sm">
                  <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tarif per Sesi Foto (Rupiah)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-2 border-[#272a33] text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full bg-[#272a33] text-white hover:bg-[#1a1c22] border-2 border-[#272a33] shadow-[3px_3px_0px_#3b82f6] text-xs font-black flex items-center gap-2 cursor-pointer transition-all transform hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>Simpan Pengaturan Pembayaran</span>
                </button>
              </div>
            </form>
          )}

          {/* ----------------- TAB 5: MASTER GALLERY & BULK EXPORT ----------------- */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-extrabold text-base text-[#272a33] flex items-center gap-2 mb-1">
                  <FolderArchive className="w-5 h-5 text-indigo-600" />
                  <span>Master Galeri & Rekapitulasi Event</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Download seluruh hasil foto dan softfile yang diambil selama acara berlangsung dalam 1 file ZIP untuk diserahkan ke panitia
                </p>
              </div>

              {/* Export Hero Card */}
              <div className="p-6 rounded-3xl bg-white border-3 border-[#272a33] shadow-[6px_6px_0px_#272a33] flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-xs font-mono-tech font-bold text-blue-600 uppercase tracking-wider">
                    DOKUMENTASI LENGKAP EVENT
                  </span>
                  <h4 className="text-lg font-black text-[#272a33] font-display">
                    Export Semua Sesi Foto Acara (Master ZIP)
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md">
                    Mengemas seluruh Photo Strip HD, Pose Satuan, dan GIF animasi dari setiap tamu ke dalam folder rapi per sesi.
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
