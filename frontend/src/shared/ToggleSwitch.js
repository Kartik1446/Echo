import React from 'react';
import { motion } from 'framer-motion';
import { themes } from '../styles/tailwindStyles';

const ToggleSwitch = ({ isOn, onToggle, theme = 'dark' }) => {
  const currentColors = themes[theme];
  const trackColor = isOn ? currentColors.accentGold : currentColors.primaryBg;
  return (
    <div
      onClick={onToggle}
      className="w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300"
      style={{ backgroundColor: trackColor }}
    >
      <motion.div
        className="w-6 h-6 rounded-full shadow-md bg-white"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        style={{ marginLeft: isOn ? 'auto' : '0' }}
      />
    </div>
  );
};

export default ToggleSwitch;


