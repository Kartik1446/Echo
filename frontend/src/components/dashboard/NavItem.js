import React from 'react';
import { motion } from 'framer-motion';

const NavItem = ({ icon, text, open, onClick }) => {
  const textVariants = {
    open: { opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.1 } },
    closed: { opacity: 0, x: -10, transition: { duration: 0.2 } },
  };
  return (
    <div
      className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white hover:bg-opacity-10 ${!open ? 'justify-center' : ''}`}
      onClick={onClick}
    >
      <span className="min-w-[40px] h-10 flex items-center justify-center rounded-lg">
        {icon}
      </span>
      <motion.span
        className={`text-sm font-medium whitespace-nowrap text-white ${open ? 'ml-4' : 'w-0'}`}
        variants={textVariants}
        initial={false}
        animate={open ? 'open' : 'closed'}
      >
        {text}
      </motion.span>
    </div>
  );
};

export default NavItem;

