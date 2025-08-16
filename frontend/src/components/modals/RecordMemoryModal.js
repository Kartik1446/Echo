import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, CheckCircle } from 'lucide-react';
import { themes } from '../../constants/themes';

const RecordMemoryModal = ({ theme, onClose, onSaveSpeech }) => {
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

  const resetRecording = () => {
    setTimer(0);
    setTitle('');
    setRecordState('idle');
  };

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative bg-[${currentColors.secondaryBg}] rounded-2xl p-10 shadow-2xl max-w-lg w-full border border-[${currentColors.glassBorder}] flex flex-col items-center text-center`}>
      <AnimatePresence mode="wait">
        {recordState === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
            <h2 className={`text-4xl font-bold mb-3 text-[${currentColors.primaryText}]`}>Record a memory</h2>
            <p className={`text-center mb-8 text-[${currentColors.primaryText}] opacity-80 max-w-sm`}>Speak clearly about a person, place, or event you want ECHO to remember.</p>
            <div className="flex flex-col items-center justify-center my-6">
              <motion.button onClick={startRecording} className={`w-36 h-36 bg-[${currentColors.accentGold}] rounded-full flex items-center justify-center shadow-lg`} whileTap={{ scale: 0.9 }}>
                <Mic className={`w-20 h-20 text-[${currentColors.secondaryText}]`} />
              </motion.button>
              <p className={`mt-6 text-sm text-[${currentColors.primaryText}] opacity-70`}>Tap to start recording</p>
            </div>
            <button onClick={onClose} className={`mt-6 text-sm text-[${currentColors.primaryText}] opacity-70 hover:opacity-100 transition-opacity`}>Cancel</button>
          </motion.div>
        )}
        {recordState === 'recording' && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
            <h2 className={`text-4xl font-bold mb-8 text-[${currentColors.primaryText}]`}>Recording...</h2>
            <div className="flex flex-col items-center justify-center my-6">
              <div className={`w-36 h-36 bg-[${currentColors.accentGold}] rounded-full flex items-center justify-center shadow-lg mic-glow-active`}><Mic className={`w-20 h-20 text-[${currentColors.secondaryText}]`} /></div>
              <p className={`mt-6 text-4xl font-mono text-[${currentColors.primaryText}]`}>{formatTime(timer)}</p>
            </div>
            <div className="w-full mt-6 text-left">
              <label htmlFor="speechTitle" className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90`}>Title</label>
              <input type="text" id="speechTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Story about my first car" className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} />
            </div>
            <div className="flex items-center gap-4 mt-8 w-full">
              <button onClick={onClose} className={`w-1/2 p-3 text-sm text-[${currentColors.primaryText}] opacity-70 hover:opacity-100 transition-opacity border border-[${currentColors.warmBronze}] rounded-lg`}>Cancel</button>
              <button onClick={saveRecording} className={`w-1/2 p-3 bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold rounded-lg shadow-md transition duration-300`}>Stop & Save</button>
            </div>
          </motion.div>
        )}
        {recordState === 'saved' && (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full">
            <CheckCircle className={`w-24 h-24 text-green-400 mb-6`} />
            <h2 className={`text-4xl font-bold mb-3 text-[${currentColors.primaryText}]`}>Memory Saved</h2>
            <p className={`text-center mb-8 text-[${currentColors.primaryText}] opacity-80 max-w-sm`}>Your memory has been successfully anchored with ECHO.</p>
            <div className="flex items-center gap-4 mt-6 w-full">
              <button onClick={resetRecording} className={`w-1/2 p-3 text-sm text-[${currentColors.primaryText}] opacity-70 hover:opacity-100 transition-opacity border border-[${currentColors.warmBronze}] rounded-lg`}>New Recording</button>
              <button onClick={onClose} className={`w-1/2 p-3 bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold rounded-lg shadow-md transition duration-300`}>Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecordMemoryModal;
