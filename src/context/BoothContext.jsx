import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { FRAME_TEMPLATES, renderHighResPhotoStrip } from '../utils/canvasRenderer';
import { FILTERS } from '../utils/filterEngine';
import { saveSoftfileAndGenerateQR, pruneExpiredPhotos } from '../utils/storageMock';
import { generateGifFromPhotos } from '../utils/gifGenerator';
import { renderMotionVideoStrip } from '../utils/motionCompositor';
import { createSoftfileZip, exportMasterEventZip } from '../utils/zipPackager';
import { 
  getAllFrames, 
  saveCustomFrame, 
  deleteCustomFrame, 
  setFrameVisibility 
} from '../utils/customFrameStorage';
import { sounds } from '../utils/audio';

const BoothContext = createContext(null);

export const STEPS = {
  ATTRACT: 'ATTRACT',
  PAYMENT: 'PAYMENT',
  FRAME_SELECT: 'FRAME_SELECT',
  CAMERA: 'CAMERA',
  REVIEW_RETAKE: 'REVIEW_RETAKE',
  FILTER: 'FILTER',
  PRINT_SHARE: 'PRINT_SHARE'
};

const DEFAULT_EVENT_SETTINGS = {
  title: 'NEO FESTIVAL 2026',
  subtitle: 'SPECIAL MEMORIES & MOMENTS',
  date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
  location: 'JAKARTA, ID',
  price: 35000,
  countdownSec: 3,
  maxRetakes: 2,
  motionDurationSec: 4,
  eventMode: 'paid', // 'paid' | 'free'
  adminPin: '',
  enableSound: true,
  cameraDeviceId: '',
  printerName: 'DNP DS-RX1HS / Default',
  autoResetDelaySec: 90,
  // Attract Screen (Layar Depan) Customization
  attractBackgroundMedia: null, // base64 / dataUrl
  attractMediaType: 'default', // 'default' | 'image' | 'video'
  attractDimming: 0, // 0 to 80 (%)
  attractShowDefaultTitle: true, // show/hide big SNAPBOOTH typography & stickers
  attractCustomCtaText: 'Click to Start', // custom button label
  // Multi-Print & Extra Copies Configuration
  defaultPrintCopies: 2, // Default copies printed per session (e.g. 2 for strip pair)
  maxPrintCopies: 4, // Max copies guest can choose (1 to 6)
  allowGuestSelectCopies: true, // Allow guests to adjust copies count
  extraCopyMode: 'free', // 'free' | 'paid' (upselling per extra copy)
  extraCopyPrice: 10000 // Price per additional copy
};

export function BoothProvider({ children }) {
  const [step, setStep] = useState(STEPS.ATTRACT);
  
  // Load event settings from localStorage if existing
  const [eventSettings, setEventSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('snapbooth_admin_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.autoResetDelaySec === 45 || !parsed.autoResetDelaySec) {
          parsed.autoResetDelaySec = 90;
        }
        return { ...DEFAULT_EVENT_SETTINGS, ...parsed };
      }
      return DEFAULT_EVENT_SETTINGS;
    } catch {
      return DEFAULT_EVENT_SETTINGS;
    }
  });

  // Frames state (all built-in + custom frames)
  const [allFramesList, setAllFramesList] = useState(() => getAllFrames(true));

  // Refresh frames from storage
  const refreshFrames = useCallback(() => {
    const updated = getAllFrames(true);
    setAllFramesList(updated);
  }, []);

  // Compute currently enabled frames for guest selection
  const availableFrames = allFramesList.filter(f => f.enabled !== false);

  const [selectedFrame, setSelectedFrame] = useState(() => {
    const enabled = getAllFrames(false);
    return enabled[0] || FRAME_TEMPLATES[0];
  });

  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [capturedVideos, setCapturedVideos] = useState([]);
  const [retakeCounts, setRetakeCounts] = useState({}); // { 0: 0, 1: 0, ... }
  const [activeFilter, setActiveFilter] = useState('normal');
  const [finalRenderedPhoto, setFinalRenderedPhoto] = useState(null);
  const [softfileInfo, setSoftfileInfo] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [viewingSoftfileId, setViewingSoftfileId] = useState(null);

  // Clean expired photos on mount
  useEffect(() => {
    pruneExpiredPhotos();
    const params = new URLSearchParams(window.location.search);
    const photoId = params.get('photoId');
    if (photoId) {
      setViewingSoftfileId(photoId);
    }
  }, []);

  // Printer & Consumables State
  const [printerStatus, setPrinterStatus] = useState(() => {
    try {
      const saved = localStorage.getItem('snapbooth_printer_status_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Cannot load printer status:', e);
    }
    return {
      paperRollCapacity: 400,
      paperRemaining: 400,
      totalPrintsToday: 0,
      totalPrintsFailed: 0,
      lastPrintedPhoto: null,
      lastPrintedDate: null,
      lastPrintedFrameName: null
    };
  });

  const savePrinterStatus = (updated) => {
    setPrinterStatus(updated);
    try {
      localStorage.setItem('snapbooth_printer_status_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist printer status:', e);
    }
  };

  // Record a successful print job
  const recordSuccessfulPrint = (photoDataUrl, frameName, copies = 1) => {
    setPrinterStatus(prev => {
      const updated = {
        ...prev,
        paperRemaining: Math.max(0, (prev.paperRemaining ?? 400) - copies),
        totalPrintsToday: (prev.totalPrintsToday || 0) + copies,
        lastPrintedPhoto: photoDataUrl || prev.lastPrintedPhoto,
        lastPrintedDate: new Date().toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        lastPrintedFrameName: frameName || prev.lastPrintedFrameName
      };
      try {
        localStorage.setItem('snapbooth_printer_status_v1', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Reset roll capacity (when operator installs new roll)
  const resetPaperRoll = (newCapacity = 400) => {
    const updated = {
      ...printerStatus,
      paperRollCapacity: Number(newCapacity) || 400,
      paperRemaining: Number(newCapacity) || 400
    };
    savePrinterStatus(updated);
  };

  // Event Sessions & Financial Analytics State
  const [eventAnalytics, setEventAnalytics] = useState(() => {
    try {
      const saved = localStorage.getItem('snapbooth_event_analytics_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Cannot load event analytics:', e);
    }
    return {
      sessionsCount: 0,
      totalRevenue: 0,
      paidSessionsCount: 0,
      freeSessionsCount: 0,
      frameStats: {}, // { [frameName]: count }
      filterStats: {}, // { [filterId]: count }
      sessionLogs: [] // [ { id, timestamp, date, frameName, filterId, amount, isPaid, posesCount, voucherCode, discountAmount } ]
    };
  });

  const saveEventAnalytics = (updated) => {
    setEventAnalytics(updated);
    try {
      localStorage.setItem('snapbooth_event_analytics_v1', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist analytics:', e);
    }
  };

  // ================= VOUCHER & VIP COUPON SYSTEM =================
  const [vouchers, setVouchers] = useState(() => {
    try {
      const saved = localStorage.getItem('snapbooth_vouchers_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Cannot load vouchers:', e);
    }
    return [
      {
        id: 'vch_vip_default',
        code: 'VIPFREE',
        type: 'free', // 'free' | 'percentage' | 'nominal'
        discountValue: 100,
        maxUses: -1, // -1 = unlimited
        usedCount: 0,
        description: 'Tamu VIP / Sponsor (100% Gratis)',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'vch_panitia_default',
        code: 'PANITIA',
        type: 'free',
        discountValue: 100,
        maxUses: 50,
        usedCount: 0,
        description: 'Panitia Acara & Crew',
        active: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'vch_promo50_default',
        code: 'PROMO50',
        type: 'percentage',
        discountValue: 50,
        maxUses: 20,
        usedCount: 0,
        description: 'Diskon 50% Promo Event',
        active: true,
        createdAt: new Date().toISOString()
      }
    ];
  });

  const saveVouchers = (updatedList) => {
    setVouchers(updatedList);
    try {
      localStorage.setItem('snapbooth_vouchers_v1', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to persist vouchers:', e);
    }
  };

  const [appliedVoucher, setAppliedVoucher] = useState(null);

  // Add a new voucher
  const addVoucher = ({ code, type = 'free', discountValue = 100, maxUses = -1, description = '' }) => {
    const cleanCode = (code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode) return { success: false, message: 'Kode voucher tidak boleh kosong.' };

    const exists = vouchers.some(v => v.code.toUpperCase() === cleanCode);
    if (exists) return { success: false, message: `Kode voucher "${cleanCode}" sudah ada.` };

    const newVoucher = {
      id: 'vch_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      code: cleanCode,
      type, // 'free' | 'percentage' | 'nominal'
      discountValue: Number(discountValue) || 0,
      maxUses: Number(maxUses),
      usedCount: 0,
      description: description.trim() || (type === 'free' ? 'Voucher Gratis VIP' : `Diskon ${discountValue}`),
      active: true,
      createdAt: new Date().toISOString()
    };

    const updated = [newVoucher, ...vouchers];
    saveVouchers(updated);
    return { success: true, voucher: newVoucher };
  };

  // Delete a voucher
  const deleteVoucher = (id) => {
    const updated = vouchers.filter(v => v.id !== id);
    saveVouchers(updated);
  };

  // Toggle voucher active state
  const toggleVoucherActive = (id) => {
    const updated = vouchers.map(v => {
      if (v.id === id) {
        return { ...v, active: !v.active };
      }
      return v;
    });
    saveVouchers(updated);
  };

  // Generate bulk random VIP vouchers (e.g. 5 or 10 single-use codes)
  const generateBulkRandomVouchers = ({ prefix = 'VIP', count = 5, type = 'free', discountValue = 100, maxUses = 1, description = 'Kupon VIP Sekali Pakai' }) => {
    const generated = [];
    const currentCodes = new Set(vouchers.map(v => v.code.toUpperCase()));

    for (let i = 0; i < count; i++) {
      let randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      let newCode = `${prefix.trim().toUpperCase()}-${randomPart}`;
      while (currentCodes.has(newCode)) {
        randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        newCode = `${prefix.trim().toUpperCase()}-${randomPart}`;
      }
      currentCodes.add(newCode);

      generated.push({
        id: 'vch_' + Date.now().toString(36) + '_' + i + '_' + Math.random().toString(36).substring(2, 6),
        code: newCode,
        type,
        discountValue: Number(discountValue) || 100,
        maxUses: Number(maxUses) || 1,
        usedCount: 0,
        description,
        active: true,
        createdAt: new Date().toISOString()
      });
    }

    const updated = [...generated, ...vouchers];
    saveVouchers(updated);
    return generated;
  };

  // Validate and apply voucher in payment screen
  const validateAndApplyVoucher = (inputCode, basePrice = eventSettings.price) => {
    const clean = (inputCode || '').trim().toUpperCase();
    if (!clean) {
      return { success: false, message: 'Masukkan kode voucher terlebih dahulu.' };
    }

    const found = vouchers.find(v => v.code.toUpperCase() === clean);
    if (!found) {
      return { success: false, message: 'Kode voucher tidak ditemukan / salah.' };
    }

    if (!found.active) {
      return { success: false, message: 'Voucher ini saat ini sedang dinonaktifkan oleh panitia.' };
    }

    if (found.maxUses > 0 && found.usedCount >= found.maxUses) {
      return { success: false, message: `Voucher "${clean}" sudah mencapai batas kuota pemakaian (${found.maxUses}x).` };
    }

    const originalPrice = Number(basePrice) || 0;
    let discountAmount = 0;
    let finalPrice = originalPrice;
    let isFree = false;

    if (found.type === 'free') {
      discountAmount = originalPrice;
      finalPrice = 0;
      isFree = true;
    } else if (found.type === 'percentage') {
      const pct = Math.min(100, Math.max(0, Number(found.discountValue) || 0));
      discountAmount = Math.round(originalPrice * (pct / 100));
      finalPrice = Math.max(0, originalPrice - discountAmount);
      isFree = finalPrice === 0;
    } else if (found.type === 'nominal') {
      discountAmount = Math.min(originalPrice, Math.max(0, Number(found.discountValue) || 0));
      finalPrice = Math.max(0, originalPrice - discountAmount);
      isFree = finalPrice === 0;
    }

    const voucherApplication = {
      voucherId: found.id,
      code: found.code,
      type: found.type,
      discountValue: found.discountValue,
      discountAmount,
      originalPrice,
      finalPrice,
      isFree,
      description: found.description
    };

    setAppliedVoucher(voucherApplication);
    sounds.playSuccessChime();
    return { success: true, voucher: voucherApplication };
  };

  const removeAppliedVoucher = () => {
    setAppliedVoucher(null);
  };

  // Record a completed photo session
  const recordCompletedSession = ({ frameName, filterId, isPaid, price, posesCount, voucherCode, discountAmount }) => {
    setEventAnalytics(prev => {
      const isPaidMode = isPaid ?? (eventSettings.eventMode === 'paid');
      const sessionPrice = isPaidMode ? (Number(price !== undefined ? price : eventSettings.price) || 0) : 0;
      const frameKey = frameName || 'Standard Frame';
      const filterKey = filterId || 'normal';

      const newFrameStats = {
        ...prev.frameStats,
        [frameKey]: (prev.frameStats?.[frameKey] || 0) + 1
      };

      const newFilterStats = {
        ...prev.filterStats,
        [filterKey]: (prev.filterStats?.[filterKey] || 0) + 1
      };

      const newLog = {
        id: 'sess_' + Date.now().toString(36),
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        frameName: frameKey,
        filterId: filterKey,
        amount: sessionPrice,
        isPaid: isPaidMode && sessionPrice > 0,
        posesCount: posesCount || 3,
        voucherCode: voucherCode || null,
        discountAmount: discountAmount || 0
      };

      const updatedLogs = [newLog, ...(prev.sessionLogs || [])].slice(0, 100);

      const updated = {
        sessionsCount: (prev.sessionsCount || 0) + 1,
        totalRevenue: (prev.totalRevenue || 0) + sessionPrice,
        paidSessionsCount: (prev.paidSessionsCount || 0) + ((isPaidMode && sessionPrice > 0) ? 1 : 0),
        freeSessionsCount: (prev.freeSessionsCount || 0) + ((!isPaidMode || sessionPrice === 0) ? 1 : 0),
        frameStats: newFrameStats,
        filterStats: newFilterStats,
        sessionLogs: updatedLogs
      };

      try {
        localStorage.setItem('snapbooth_event_analytics_v1', JSON.stringify(updated));
      } catch (e) {}

      return updated;
    });
  };

  // Reset event analytics data (for fresh event)
  const resetEventAnalytics = () => {
    const empty = {
      sessionsCount: 0,
      totalRevenue: 0,
      paidSessionsCount: 0,
      freeSessionsCount: 0,
      frameStats: {},
      filterStats: {},
      sessionLogs: []
    };
    saveEventAnalytics(empty);
  };

  // Emergency Reprint Last Session (Operator)
  const reprintLastSession = (copies = 1) => {
    if (!printerStatus.lastPrintedPhoto) return false;
    setIsPrinting(true);
    sounds.playPrintSound();

    recordSuccessfulPrint(printerStatus.lastPrintedPhoto, printerStatus.lastPrintedFrameName, copies);

    setTimeout(() => {
      setIsPrinting(false);
      sounds.playSuccessChime();
    }, 4500);
    return true;
  };

  // Save settings when modified
  const updateSettings = (newSettings) => {
    const merged = { ...eventSettings, ...newSettings };
    setEventSettings(merged);
    localStorage.setItem('snapbooth_admin_settings', JSON.stringify(merged));
  };

  // Custom Frame Actions
  const addCustomFrame = (frameData) => {
    const saved = saveCustomFrame(frameData);
    refreshFrames();
    return saved;
  };

  const deleteCustomFrameById = (id) => {
    const success = deleteCustomFrame(id);
    refreshFrames();
    return success;
  };

  const toggleFrameEnabled = (id, enabled) => {
    setFrameVisibility(id, enabled);
    refreshFrames();
  };

  // Start new session
  const startNewSession = () => {
    sounds.playButtonClick();
    setCurrentPoseIndex(0);
    setCapturedPhotos([]);
    setCapturedVideos([]);
    setRetakeCounts({});
    setActiveFilter('normal');
    setFinalRenderedPhoto(null);
    setSoftfileInfo(null);
    setIsPrinting(false);

    // If Event Mode is Free, jump directly to Frame Selection Screen
    setAppliedVoucher(null);
    if (eventSettings.eventMode === 'free') {
      setStep(STEPS.FRAME_SELECT);
    } else {
      setStep(STEPS.PAYMENT);
    }
  };

  // After Payment Success
  const handlePaymentSuccess = () => {
    sounds.playSuccessChime();
    setStep(STEPS.FRAME_SELECT);
  };

  // Choose frame & proceed to camera
  const handleSelectFrame = (template) => {
    sounds.playButtonClick();
    setSelectedFrame(template);
    setCurrentPoseIndex(0);
    setCapturedPhotos([]);
    setCapturedVideos([]);
    setRetakeCounts({});
    setStep(STEPS.CAMERA);
  };

  // When a pose photo is captured
  const handlePhotoCaptured = (photoDataUrl, videoBlob) => {
    sounds.playShutter();
    const newPhotos = [...capturedPhotos];
    newPhotos[currentPoseIndex] = photoDataUrl;
    setCapturedPhotos(newPhotos);

    if (videoBlob) {
      const newVideos = [...capturedVideos];
      newVideos[currentPoseIndex] = videoBlob;
      setCapturedVideos(newVideos);
    }

    setStep(STEPS.REVIEW_RETAKE);
  };

  // Retake current pose (respect maxRetakes from settings)
  const handleRetakePose = () => {
    const maxRetakes = Number(eventSettings.maxRetakes ?? 2);
    const currentCount = retakeCounts[currentPoseIndex] || 0;
    if (currentCount >= maxRetakes) return; // Disallow

    sounds.playButtonClick();
    setRetakeCounts({
      ...retakeCounts,
      [currentPoseIndex]: currentCount + 1
    });
    setStep(STEPS.CAMERA);
  };

  // Accept current pose and move to next or filter
  const handleAcceptPose = () => {
    sounds.playButtonClick();
    const totalPosesNeeded = selectedFrame.poses;
    const nextIndex = currentPoseIndex + 1;

    if (nextIndex < totalPosesNeeded) {
      setCurrentPoseIndex(nextIndex);
      setStep(STEPS.CAMERA);
    } else {
      // All poses captured, proceed to Filter Screen
      setStep(STEPS.FILTER);
    }
  };

  // Finish filter selection and render high-res composite & full asset package
  const handleFinishFilters = async (filterId) => {
    sounds.playButtonClick();
    setActiveFilter(filterId);

    try {
      // 1. Render Composite Photo Strip
      const rendered = await renderHighResPhotoStrip(
        capturedPhotos,
        selectedFrame,
        filterId,
        eventSettings
      );
      setFinalRenderedPhoto(rendered);

      // 2. Generate Boomerang GIF from captured photos
      let gifDataUrl = null;
      try {
        gifDataUrl = await generateGifFromPhotos(capturedPhotos, 480, 640, 0.4);
      } catch (e) {
        console.warn('Boomerang GIF generation error:', e);
      }

      // 3. Render Live Motion Video Strip
      let motionVideoBlob = null;
      try {
        const durationMs = (Number(eventSettings.motionDurationSec) || 4) * 1000;
        motionVideoBlob = await renderMotionVideoStrip(
          capturedVideos,
          selectedFrame,
          filterId,
          eventSettings,
          capturedPhotos,
          durationMs
        );
      } catch (e) {
        console.warn('Motion video generation error:', e);
      }

      // 4. Create 1-Click ZIP Package containing all assets
      let zipBlob = null;
      try {
        const sessionId = Math.random().toString(36).substring(2, 7);
        zipBlob = await createSoftfileZip({
          photoStripDataUrl: rendered,
          posesDataUrls: capturedPhotos,
          gifDataUrl,
          motionVideoBlob,
          sessionId
        });
      } catch (e) {
        console.warn('ZIP packaging error:', e);
      }

      // 5. Save softfile bundle & generate clean QR
      const softfileData = await saveSoftfileAndGenerateQR({
        renderedDataUrl: rendered,
        rawPhotos: capturedPhotos,
        gifDataUrl,
        motionVideoBlob,
        zipBlob
      });
      setSoftfileInfo(softfileData);

      // 6. Increment Voucher Usage if applied
      if (appliedVoucher?.voucherId) {
        setVouchers(prev => {
          const updated = prev.map(v => {
            if (v.id === appliedVoucher.voucherId || v.code.toUpperCase() === appliedVoucher.code.toUpperCase()) {
              return { ...v, usedCount: (v.usedCount || 0) + 1 };
            }
            return v;
          });
          try {
            localStorage.setItem('snapbooth_vouchers_v1', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }

      // 7. Record Session to Analytics
      const isPaidMode = eventSettings.eventMode === 'paid';
      const effectivePrice = appliedVoucher ? appliedVoucher.finalPrice : eventSettings.price;
      const effectiveIsPaid = isPaidMode && (!appliedVoucher || !appliedVoucher.isFree);

      recordCompletedSession({
        frameName: selectedFrame?.name || 'Standard Frame',
        filterId,
        isPaid: effectiveIsPaid,
        price: effectivePrice,
        posesCount: selectedFrame?.poses,
        voucherCode: appliedVoucher?.code || null,
        discountAmount: appliedVoucher?.discountAmount || 0
      });

      setStep(STEPS.PRINT_SHARE);
    } catch (err) {
      console.error('Error rendering photo package:', err);
    }
  };

  // Trigger Print
  const handleTriggerPrint = (copies = 1) => {
    setIsPrinting(true);
    sounds.playPrintSound();

    if (finalRenderedPhoto) {
      recordSuccessfulPrint(finalRenderedPhoto, selectedFrame?.name, copies);
    }

    setTimeout(() => {
      setIsPrinting(false);
      sounds.playSuccessChime();
    }, 4500);
  };

  // Reset to attract screen
  const resetToAttract = () => {
    setStep(STEPS.ATTRACT);
    setCurrentPoseIndex(0);
    setCapturedPhotos([]);
    setCapturedVideos([]);
    setRetakeCounts({});
    setFinalRenderedPhoto(null);
    setSoftfileInfo(null);
    setIsPrinting(false);
    setAppliedVoucher(null);
  };

  return (
    <BoothContext.Provider
      value={{
        step,
        setStep,
        eventSettings,
        updateSettings,
        allFramesList,
        availableFrames,
        selectedFrame,
        setSelectedFrame,
        addCustomFrame,
        deleteCustomFrameById,
        toggleFrameEnabled,
        refreshFrames,
        exportMasterEventZip,
        currentPoseIndex,
        capturedPhotos,
        retakeCounts,
        activeFilter,
        finalRenderedPhoto,
        softfileInfo,
        isPrinting,
        isAdminOpen,
        setIsAdminOpen,
        viewingSoftfileId,
        setViewingSoftfileId,
        printerStatus,
        recordSuccessfulPrint,
        resetPaperRoll,
        reprintLastSession,
        eventAnalytics,
        recordCompletedSession,
        resetEventAnalytics,
        vouchers,
        appliedVoucher,
        addVoucher,
        deleteVoucher,
        toggleVoucherActive,
        generateBulkRandomVouchers,
        validateAndApplyVoucher,
        removeAppliedVoucher,
        startNewSession,
        handlePaymentSuccess,
        handleSelectFrame,
        handlePhotoCaptured,
        handleRetakePose,
        handleAcceptPose,
        handleFinishFilters,
        handleTriggerPrint,
        resetToAttract
      }}
    >
      {children}
    </BoothContext.Provider>
  );
}

export function useBooth() {
  const context = useContext(BoothContext);
  if (!context) {
    throw new Error('useBooth must be used within BoothProvider');
  }
  return context;
}
