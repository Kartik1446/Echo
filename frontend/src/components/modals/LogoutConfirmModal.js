import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { themes } from '../../constants/themes';

const LogoutConfirmModal = ({ theme, onClose, onConfirm }) => {
  const currentColors = themes[theme];
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative bg-[${currentColors.secondaryBg}] rounded-2xl p-10 shadow-2xl max-w-md w-full border border-[${currentColors.glassBorder}] flex flex-col items-center text-center`}>
      <div className={`p-5 rounded-full bg-[${currentColors.primaryBg}] mb-6`}><LogOut className={`w-12 h-12 text-[${currentColors.accentGold}]`} /></div>
      <h2 className={`text-3xl font-bold mb-4 text-[${currentColors.primaryText}]`}>Are you sure you want to log out?</h2>
      <p className={`text-center mb-10 text-[${currentColors.primaryText}] opacity-80 max-w-xs`}>You will be returned to the landing page.</p>
      <div className="flex items-center gap-4 w-full">
        <button onClick={onClose} className={`w-1/2 p-3 text-lg rounded-lg border border-[${currentColors.warmBronze}] text-[${currentColors.primaryText}] font-semibold transition-colors hover:bg-[${currentColors.primaryBg}]`}>Cancel</button>
        <button onClick={onConfirm} className={`w-1/2 p-3 text-lg rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md transition-colors`}>Logout</button>
      </div>
    </motion.div>
  );
};

export default LogoutConfirmModal;
