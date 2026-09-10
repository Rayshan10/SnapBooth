import React from 'react';
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

export default function App() {
  const { step } = useBooth();

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
