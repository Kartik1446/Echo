import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, CheckCircle } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const RecordMemoryModal = ({ theme = 'dark', onClose, onSaveSpeech }) => {
  const currentColors = themes[theme];
  const [recordState, setRecordState] = useState('idle');
  const [timer, setTimer] = useState(0);
  const [title, setTitle] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (recordState === 'recording') {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recordState]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const startRecording = () => setRecordState('recording');
  const saveRecording = () => {
    if (title.trim()) {
      onSaveSpeech(title);
    }
    setRecordState('saved');
  };
  const resetRecording = () => { setTimer(0); setTitle(''); setRecordState('idle'); };

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative rounded-2xl p-10 shadow-2xl max-w-lg w-full border flex flex-col items-center text-center" style={{ backgroundColor: currentColors.secondaryBg, borderColor: currentColors.glassBorder }}>
      <AnimatePresence mode="wait">
        {recordState === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
            <h2 className="text-4xl font-bold mb-3" style={{ color: currentColors.primaryText }}>Record a memory</h2>
            <p className="text-center mb-8 max-w-sm" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Speak clearly about a person, place, or event you want ECHO to remember.</p>
            <div className="flex flex-col items-center justify-center my-6">
              <motion.button onClick={startRecording} className="w-36 h-36 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: currentColors.accentGold }} whileTap={{ scale: 0.9 }}>
                <Mic className="w-20 h-20" style={{ color: currentColors.secondaryText }} />
              </motion.button>
              <p className="mt-6 text-sm" style={{ color: currentColors.primaryText, opacity: 0.7 }}>Tap to start recording</p>
            </div>
            <button onClick={onClose} className="mt-6 text-sm transition-opacity" style={{ color: currentColors.primaryText, opacity: 0.7 }}>Cancel</button>
          </motion.div>
        )}
        {recordState === 'recording' && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
            <h2 className="text-4xl font-bold mb-8" style={{ color: currentColors.primaryText }}>Recording...</h2>
            <div className="flex flex-col items-center justify-center my-6">
              <div className="w-36 h-36 rounded-full flex items-center justify-center shadow-lg mic-glow-active" style={{ backgroundColor: currentColors.accentGold }}><Mic className="w-20 h-20" style={{ color: currentColors.secondaryText }} /></div>
              <p className="mt-6 text-4xl font-mono" style={{ color: currentColors.primaryText }}>{formatTime(timer)}</p>
            </div>
            <div className="w-full mt-6 text-left">
              <label htmlFor="speechTitle" className="block text-sm font-medium mb-2" style={{ color: currentColors.primaryText, opacity: 0.9 }}>Title</label>
              <input type="text" id="speechTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Story about my first car" className="w-full p-3 rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: currentColors.primaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }} />
            </div>
            <div className="flex items-center gap-4 mt-8 w-full">
              <button onClick={onClose} className="w-1/2 p-3 text-sm transition-opacity rounded-lg" style={{ color: currentColors.primaryText, opacity: 0.7, border: `1px solid ${currentColors.warmBronze}` }}>Cancel</button>
              <button onClick={saveRecording} className="w-1/2 p-3 font-semibold rounded-lg shadow-md transition duration-300" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>Stop & Save</button>
            </div>
          </motion.div>
        )}
        {recordState === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
            <CheckCircle className="w-24 h-24 text-green-400 mb-6" />
            <h2 className="text-4xl font-bold mb-3" style={{ color: currentColors.primaryText }}>Memory Saved</h2>
            <p className="text-center mb-8 max-w-sm" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Your memory has been successfully anchored with ECHO.</p>
            <div className="flex items-center gap-4 mt-6 w-full">
              <button onClick={resetRecording} className="w-1/2 p-3 text-sm transition-opacity rounded-lg" style={{ color: currentColors.primaryText, opacity: 0.7, border: `1px solid ${currentColors.warmBronze}` }}>New Recording</button>
              <button onClick={onClose} className="w-1/2 p-3 font-semibold rounded-lg shadow-md transition duration-300" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecordMemoryModal;


