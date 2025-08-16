import React from 'react';
import { motion } from 'framer-motion';
import { themes } from '../../constants/themes';

const Waveform = ({ theme }) => {
  const currentColors = themes[theme];
  const barVariants = {
    animate: (i) => ({
      scaleY: [1, 1.5, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        delay: i * 0.1,
        ease: "easeInOut"
      }
    })
  };

  return (
    <div className="flex items-center justify-center space-x-2 h-full">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={barVariants}
          animate="animate"
          className={`w-3 h-12 rounded-full bg-[${currentColors.accentGold}]`}
        />
      ))}
    </div>
  );
};

export default Waveform;
