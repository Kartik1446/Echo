import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Plus, Headset } from 'lucide-react';
import { themes } from '../../constants/themes';

const FeatureCards = ({ theme, isMicActive, onAddSpeechClick, onAddMomentClick, onListenClick }) => {
  const currentColors = themes[theme];
  return (
    <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
      <motion.button onClick={onAddSpeechClick} className={`relative flex flex-col items-center justify-center p-8 rounded-2xl shadow-xl transition-all duration-300 bg-[${currentColors.secondaryBg}] hover:scale-[1.02] hover:shadow-2xl hover:border-2 border-transparent hover:border-[${currentColors.accentGold}] group focus:outline-none`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <div className={`p-5 rounded-full transition-colors duration-300 mb-5 ${isMicActive ? `bg-[${currentColors.accentGold}] mic-glow-active` : `bg-white bg-opacity-10`}`}><Mic className={`w-10 h-10 transition-colors duration-300 ${isMicActive ? `text-[${currentColors.secondaryText}]` : `text-white text-opacity-80`}`} /></div>
        <p className={`text-white text-xl font-semibold group-hover:text-[${currentColors.accentGold}] transition-colors duration-300`}>Add Speech</p>
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none"><span className={`px-3 py-1 bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] rounded-full text-xs font-medium`}>Speak to ECHO</span></div>
      </motion.button>
      <motion.button onClick={onAddMomentClick} className={`relative flex flex-col items-center justify-center p-8 rounded-2xl shadow-xl transition-all duration-300 bg-[${currentColors.secondaryBg}] hover:scale-[1.02] hover:shadow-2xl hover:border-2 border-transparent hover:border-[${currentColors.accentGold}] group focus:outline-none`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <div className="p-5 rounded-full bg-white bg-opacity-10 transition-colors duration-300 mb-5"><Plus className="w-10 h-10 text-white text-opacity-80" /></div>
        <p className={`text-white text-xl font-semibold group-hover:text-[${currentColors.accentGold}] transition-colors duration-300`}>Add Moments</p>
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none"><span className={`px-3 py-1 bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] rounded-full text-xs font-medium`}>Upload a new memory or note</span></div>
      </motion.button>
      <motion.button onClick={onListenClick} className={`relative flex flex-col items-center justify-center p-8 rounded-2xl shadow-xl transition-all duration-300 bg-[${currentColors.secondaryBg}] hover:scale-[1.02] hover:shadow-2xl hover:border-2 border-transparent hover:border-[${currentColors.accentGold}] group focus:outline-none`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <div className="p-5 rounded-full bg-white bg-opacity-10 transition-colors duration-300 mb-5"><Headset className="w-10 h-10 text-white text-opacity-80" /></div>
        <p className={`text-white text-xl font-semibold group-hover:text-[${currentColors.accentGold}] transition-colors duration-300`}>Listen to ECHO</p>
        <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none"><span className={`px-3 py-1 bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] rounded-full text-xs font-medium`}>Hear memory playback or conversations</span></div>
      </motion.button>
    </motion.div>
  );
};

export default FeatureCards;
