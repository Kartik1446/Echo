import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { themes } from '../../constants/themes';

const AddWriteUpModal = ({ theme, onClose, onSaveWriteUp }) => {
  const currentColors = themes[theme];
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (title.trim() && content.trim()) {
      onSaveWriteUp(title, content);
      setIsSaved(true);
    }
  };

  const handleAddNew = () => {
    setTitle('');
    setContent('');
    setIsSaved(false);
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`relative bg-[${currentColors.secondaryBg}] rounded-2xl p-10 shadow-2xl max-w-2xl w-full border border-[${currentColors.glassBorder}] flex flex-col text-left max-h-[90vh]`}
    >
      <AnimatePresence mode="wait">
        {isSaved ? (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full text-center">
            <CheckCircle className={`w-24 h-24 text-green-400 mb-6`} />
            <h2 className={`text-4xl font-bold mb-3 text-[${currentColors.primaryText}]`}>Write Up Saved!</h2>
            <p className={`text-center mb-8 text-[${currentColors.primaryText}] opacity-80 max-w-sm`}>Your new memory has been anchored with ECHO.</p>
            <div className="flex items-center gap-4 mt-6 w-full">
              <button onClick={handleAddNew} className={`w-1/2 p-3 text-sm text-[${currentColors.primaryText}] opacity-70 hover:opacity-100 transition-opacity border border-[${currentColors.warmBronze}] rounded-lg`}>Add Another</button>
              <button onClick={onClose} className={`w-1/2 p-3 bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold rounded-lg shadow-md transition duration-300`}>Close</button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-grow min-h-0">
            <button onClick={onClose} className={`absolute top-6 right-6 text-[${currentColors.primaryText}] hover:text-[${currentColors.accentGold}] transition-colors duration-300 z-10`} aria-label="Close">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className={`text-4xl font-bold mb-8 text-[${currentColors.primaryText}]`}>Add a Write Up</h2>
            <div className="space-y-6 flex-shrink-0">
              <div>
                <label className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90`}>Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Thoughts on the new book" className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} />
              </div>
            </div>
            <div className="flex flex-col flex-grow mt-6 min-h-0">
              <label className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90 flex-shrink-0`}>Content</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your memory here..." className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}] flex-grow resize-none`}></textarea>
            </div>
            <div className="flex items-center gap-4 mt-8 w-full flex-shrink-0">
              <button onClick={onClose} className={`w-1/2 p-3 text-lg rounded-lg border border-[${currentColors.warmBronze}] text-[${currentColors.primaryText}] font-semibold transition-colors hover:bg-[${currentColors.primaryBg}]`}>Cancel</button>
              <button onClick={handleSave} className={`w-1/2 p-3 text-lg rounded-lg bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold shadow-md transition-colors`}>Save Write Up</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddWriteUpModal;
