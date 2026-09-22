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
  attractCustomCtaText: 'Click to Start' // custom button label
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

      setStep(STEPS.PRINT_SHARE);
    } catch (err) {
      console.error('Error rendering photo package:', err);
    }
  };

  // Trigger Print
  const handleTriggerPrint = () => {
    setIsPrinting(true);
    sounds.playPrintSound();

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
