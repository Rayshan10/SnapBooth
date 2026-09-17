import React, { useMemo } from 'react';
import { useBooth, STEPS } from './context/BoothContext';
import AttractScreen from './components/AttractScreen';
import PaymentScreen from './components/PaymentScreen';
import FrameSelectionScreen from './components/FrameSelectionScreen';
import CameraSessionScreen from './components/CameraSessionScreen';
import ReviewRetakeScreen from './components/ReviewRetakeScreen';
import FilterScreen from './components/FilterScreen';
import PrintAndShareScreen from './components/PrintAndShareScreen';
import AdminModal from './components/AdminModal';
import SoftfileModal from './components/SoftfileModal';
import GuestDownloadScreen from './components/GuestDownloadScreen';

export default function App() {
  const { step } = useBooth();

  // Check if guest accessed via mobile scan (e.g. ?guestPhoto=id or ?photoId=id)
  const guestPhotoId = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('guestPhoto') || params.get('photoId');
  }, []);

  // If mobile guest view
  if (guestPhotoId) {
    return (
      <div className="w-full min-h-screen bg-[#f3edd9] overflow-y-auto overflow-x-hidden">
        <GuestDownloadScreen photoId={guestPhotoId} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden relative font-sans">
      {/* Step Router */}
      {step === STEPS.ATTRACT && <AttractScreen />}
      {step === STEPS.PAYMENT && <PaymentScreen />}
      {step === STEPS.FRAME_SELECT && <FrameSelectionScreen />}
      {step === STEPS.CAMERA && <CameraSessionScreen />}
      {step === STEPS.REVIEW_RETAKE && <ReviewRetakeScreen />}
      {step === STEPS.FILTER && <FilterScreen />}
      {step === STEPS.PRINT_SHARE && <PrintAndShareScreen />}

      {/* Global Modals */}
      <AdminModal />
      <SoftfileModal />
    </div>
  );
}
