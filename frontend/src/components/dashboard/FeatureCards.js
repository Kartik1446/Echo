import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Plus, Headset } from 'lucide-react';
import { themes } from '../../styles/tailwindStyles';

const FeatureCards = ({ theme, isMicActive, onAddSpeechClick, onAddMomentClick, onListenClick }) => {
  const currentColors = themes[theme];
  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
      <motion.button onClick={onAddSpeechClick} className={`relative flex flex-col items-center justify-center p-8 rounded-2xl shadow-xl transition-all duration-300`} style={{ backgroundColor: currentColors.secondaryBg, borderColor: 'transparent' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <div className={`p-5 rounded-full transition-colors duration-300 mb-5 ${isMicActive ? '' : ''}`} style={{ backgroundColor: isMicActive ? currentColors.accentGold : 'rgba(255,255,255,0.1)' }}>
          <Mic className="w-10 h-10" style={{ color: isMicActive ? currentColors.secondaryText : 'rgba(255,255,255,0.8)' }} />
        </div>
        <p className={`text-xl font-semibold`} style={{ color: '#fff' }}>Add Speech</p>
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>Speak to ECHO</span>
        </div>
      </motion.button>
      <motion.button onClick={onAddMomentClick} className={`relative flex flex-col items-center justify-center p-8 rounded-2xl shadow-xl transition-all duration-300`} style={{ backgroundColor: currentColors.secondaryBg, borderColor: 'transparent' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <div className="p-5 rounded-full mb-5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}><Plus className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.8)' }} /></div>
        <p className={`text-xl font-semibold`} style={{ color: '#fff' }}>Add Moments</p>
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none"><span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>Upload a new memory or note</span></div>
      </motion.button>
      <motion.button onClick={onListenClick} className={`relative flex flex-col items-center justify-center p-8 rounded-2xl shadow-xl transition-all duration-300`} style={{ backgroundColor: currentColors.secondaryBg, borderColor: 'transparent' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <div className="p-5 rounded-full mb-5" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}><Headset className="w-10 h-10" style={{ color: 'rgba(255,255,255,0.8)' }} /></div>
        <p className={`text-xl font-semibold`} style={{ color: '#fff' }}>Listen to ECHO</p>
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none"><span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>Hear memory playback or conversations</span></div>
      </motion.button>
    </motion.div>
  );
};

export default FeatureCards;

