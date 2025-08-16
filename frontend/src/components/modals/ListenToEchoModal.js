import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { themes } from '../../constants/themes';
import ToggleSwitch from '../shared/ToggleSwitch';
import Waveform from '../shared/Waveform';

const ListenToEchoModal = ({ theme, onClose }) => {
  const currentColors = themes[theme];
  const [isLiveRecognitionOn, setIsLiveRecognitionOn] = useState(true);
  const [recognitionStatus, setRecognitionStatus] = useState('listening'); // 'listening', 'recognized', 'unknown'
  const simulationIntervalRef = useRef(null);
  const mockPerson = {
    name: 'Ananya Sharma',
    relationship: 'Caregiver',
    photoUrl: 'https://placehold.co/100x100/F9E4C8/1E1A18?text=AS'
  };

  // Simulation Logic
  useEffect(() => {
    if (isLiveRecognitionOn) {
      const cycle = [
        () => setRecognitionStatus('listening'),
        () => setRecognitionStatus('recognized'),
        () => setRecognitionStatus('listening'),
        () => setRecognitionStatus('unknown'),
      ];
      let currentStep = 0;
      simulationIntervalRef.current = setInterval(() => {
        cycle[currentStep]();
        currentStep = (currentStep + 1) % cycle.length;
      }, 3500);
    } else {
      clearInterval(simulationIntervalRef.current);
      setRecognitionStatus('idle');
    }
    return () => clearInterval(simulationIntervalRef.current);
  }, [isLiveRecognitionOn]);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`relative bg-[${currentColors.secondaryBg}] rounded-2xl p-10 shadow-2xl max-w-2xl w-full border border-[${currentColors.glassBorder}] flex flex-col`}
    >
      <button onClick={onClose} className={`absolute top-6 right-6 text-[${currentColors.primaryText}] hover:text-[${currentColors.accentGold}] transition-colors duration-300 z-10`} aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <h2 className={`text-4xl font-bold mb-8 text-center text-[${currentColors.primaryText}]`}>Listen to ECHO</h2>

      <div className={`bg-[${currentColors.primaryBg}] p-6 rounded-lg flex items-center justify-between mb-8`}>
        <div className="text-left">
          <p className={`text-xl font-semibold text-[${currentColors.primaryText}]`}>Live Recognition</p>
          <p className={`text-sm text-[${currentColors.primaryText}] opacity-70`}>Get real-time voice feedback from your glasses.</p>
        </div>
        <ToggleSwitch theme={theme} isOn={isLiveRecognitionOn} onToggle={() => setIsLiveRecognitionOn(!isLiveRecognitionOn)} />
      </div>

      <div className="flex-grow w-full h-64 bg-black/20 rounded-lg p-6 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {recognitionStatus === 'listening' && (
            <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Waveform theme={theme} />
            </motion.div>
          )}
          {recognitionStatus === 'recognized' && (
            <motion.div key="recognized" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
              <img src={mockPerson.photoUrl} alt={mockPerson.name} className="w-24 h-24 rounded-full mb-4 border-4" style={{ borderColor: currentColors.accentGold }} />
              <h3 className={`text-2xl font-bold text-[${currentColors.primaryText}]`}>{mockPerson.name}</h3>
              <p className={`text-lg text-[${currentColors.accentGold}]`}>{mockPerson.relationship}</p>
            </motion.div>
          )}
          {recognitionStatus === 'unknown' && (
            <motion.div key="unknown" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center">
              <p className={`text-xl font-semibold text-[${currentColors.primaryText}] mb-4`}>Unknown – Would you like to label this person?</p>
              <button onClick={() => setRecognitionStatus('listening')} className={`px-6 py-2 bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] font-semibold rounded-lg`}>Got it</button>
            </motion.div>
          )}
          {recognitionStatus === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className={`text-[${currentColors.primaryText}] opacity-50`}>Live recognition is off.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ListenToEchoModal;
