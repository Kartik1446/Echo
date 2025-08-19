import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, AlertTriangle } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const LogoutConfirmModal = ({ theme = 'dark', onClose, onConfirmLogout = () => {} }) => {
  const currentColors = themes[theme];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="relative backdrop-blur-xl rounded-2xl p-10 shadow-2xl max-w-md w-full border"
      style={{ borderColor: currentColors.glassBorder, background: currentColors.glassBg }}
    >
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
             style={{ backgroundColor: currentColors.secondaryBg }}>
          <AlertTriangle size={40} style={{ color: currentColors.accentGold }} />
        </div>
        
        <h2 className="text-3xl font-bold mb-4" style={{ color: currentColors.primaryText }}>
          Confirm Logout
        </h2>
        
        <p className="text-lg mb-8" style={{ color: currentColors.primaryText, opacity: 0.8 }}>
          Are you sure you want to logout? Any unsaved changes will be lost.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
            style={{ color: currentColors.primaryText, border: `1px solid ${currentColors.darkGold}` }}
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirmLogout}
            className="flex-1 px-6 py-3 rounded-lg font-semibold shadow-md transition-colors duration-300 flex items-center justify-center"
            style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
          >
            <LogOut size={20} className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LogoutConfirmModal;
