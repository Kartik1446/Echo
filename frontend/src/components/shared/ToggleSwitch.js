import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { themes } from '../../constants/themes';

const FAQItem = ({ theme, question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentColors = themes[theme];
  
  return (
    <motion.div
      className={`bg-[${currentColors.secondaryBg}] p-8 rounded-xl border border-transparent transition-colors duration-300 hover:border-[${currentColors.accentGold}]`}
      whileHover={{ scale: 1.02 }}
      animate={{ borderColor: isOpen ? currentColors.accentGold : 'transparent' }}
    >
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left gap-6">
        <h3 className={`text-xl font-semibold text-[${currentColors.primaryText}]`}>{question}</h3>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="flex-shrink-0">
          <ChevronDown className={`w-6 h-6 text-[${currentColors.accentGold}]`} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '24px' }}
            exit={{ opacity: 0, height: 0, marginTop: '0px' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className={`text-[${currentColors.primaryText}] opacity-80 pr-8 leading-relaxed`}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQItem;
