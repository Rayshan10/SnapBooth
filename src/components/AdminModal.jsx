import React, { useState, useEffect } from 'react';
import { useBooth } from '../context/BoothContext';
import { Settings, X, Save, Camera, Printer, DollarSign, Clock, MapPin, Sparkles } from 'lucide-react';

export default function AdminModal() {
  const { isAdminOpen, setIsAdminOpen, eventSettings, updateSettings } = useBooth();
  const [formData, setFormData] = useState(eventSettings);
  const [videoDevices, setVideoDevices] = useState([]);

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

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      price: Number(formData.price) || 35000,
      countdownSec: Number(formData.countdownSec) || 3,
      autoResetDelaySec: Number(formData.autoResetDelaySec) || 45
    });
    setIsAdminOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl">PENGATURAN OPERATOR SNAPBOOTH</h3>
              <p className="text-xs text-slate-400 font-mono-tech">Mode Pengaturan Event & Hardware</p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Nama Event / Brand</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <span>Tagline / Subtitle Event</span>
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Lokasi Event</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tarif per Sesi (Rupiah)</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Camera Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-purple-400" />
              <span>Sumber Kamera (DSLR / Capture Card / Webcam)</span>
            </label>
            <select
              value={formData.cameraDeviceId}
              onChange={e => setFormData({ ...formData, cameraDeviceId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Gunakan Kamera Default Sistem --</option>
              {videoDevices.map((dev, idx) => (
                <option key={dev.deviceId || idx} value={dev.deviceId}>
                  {dev.label || `Kamera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Durasi Hitung Mundur (Detik)</span>
              </label>
              <select
                value={formData.countdownSec}
                onChange={e => setFormData({ ...formData, countdownSec: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="3">3 Detik (Standar Cepat)</option>
                <option value="5">5 Detik (Bagus untuk Grup)</option>
                <option value="7">7 Detik (Santai)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Printer className="w-3.5 h-3.5 text-pink-400" />
                <span>Nama Driver Printer</span>
              </label>
              <input
                type="text"
                value={formData.printerName}
                onChange={e => setFormData({ ...formData, printerName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdminOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
