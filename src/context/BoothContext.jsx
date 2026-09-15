import React, { createContext, useContext, useState, useEffect } from 'react';
import { FRAME_TEMPLATES, renderHighResPhotoStrip } from '../utils/canvasRenderer';
import { FILTERS } from '../utils/filterEngine';
import { saveSoftfileAndGenerateQR, pruneExpiredPhotos } from '../utils/storageMock';
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
  enableSound: true,
  cameraDeviceId: '',
  printerName: 'DNP DS-RX1HS / Default',
  autoResetDelaySec: 90
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

  const [selectedFrame, setSelectedFrame] = useState(FRAME_TEMPLATES[0]);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
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
    // Check if URL has ?photoId=
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

  // Start new session
  const startNewSession = () => {
    sounds.playButtonClick();
    setCurrentPoseIndex(0);
    setCapturedPhotos([]);
    setRetakeCounts({});
    setActiveFilter('normal');
    setFinalRenderedPhoto(null);
    setSoftfileInfo(null);
    setIsPrinting(false);
    setStep(STEPS.PAYMENT);
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
    setRetakeCounts({});
    setStep(STEPS.CAMERA);
  };

  // When a pose photo is captured
  const handlePhotoCaptured = (photoDataUrl) => {
    sounds.playShutter();
    const newPhotos = [...capturedPhotos];
    newPhotos[currentPoseIndex] = photoDataUrl;
    setCapturedPhotos(newPhotos);
    setStep(STEPS.REVIEW_RETAKE);
  };

  // Retake current pose (max 2 times)
  const handleRetakePose = () => {
    const currentCount = retakeCounts[currentPoseIndex] || 0;
    if (currentCount >= 2) return; // Disallow

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

  // Finish filter selection and render high-res composite
  const handleFinishFilters = async (filterId) => {
    sounds.playButtonClick();
    setActiveFilter(filterId);

    // Render composite
    try {
      const rendered = await renderHighResPhotoStrip(
        capturedPhotos,
        selectedFrame,
        filterId,
        eventSettings
      );
      setFinalRenderedPhoto(rendered);

      // Save softfile & generate QR
      const softfileData = await saveSoftfileAndGenerateQR(rendered, capturedPhotos);
      setSoftfileInfo(softfileData);

      setStep(STEPS.PRINT_SHARE);
    } catch (err) {
      console.error('Error rendering photo strip:', err);
    }
  };

  // Trigger Print
  const handleTriggerPrint = () => {
    setIsPrinting(true);
    sounds.playPrintSound();

    // Trigger window print or electron print
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
        selectedFrame,
        setSelectedFrame,
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
