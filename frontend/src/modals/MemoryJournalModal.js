import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, SlidersHorizontal, Edit, Trash2, Book } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const MemoryJournalModal = ({ theme = 'dark', onClose, journalEntries, onAddNewWriteUp }) => {
  const currentColors = themes[theme];
  const [activeTab, setActiveTab] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest-to-oldest');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const tabs = ['All', 'Speech', 'Moments', 'Write Ups'];

  const filteredAndSortedEntries = journalEntries
    .filter(entry => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Speech') return entry.type === 'speech';
      if (activeTab === 'Moments') return entry.type === 'moment';
      if (activeTab === 'Write Ups') return entry.type === 'write-up';
      return false;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'newest-to-oldest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="relative rounded-2xl p-8 md:p-10 shadow-2xl max-w-4xl w-full border flex flex-col text-left max-h-[90vh]"
      style={{ backgroundColor: currentColors.glassBg, borderColor: currentColors.glassBorder, backdropFilter: 'blur(12px)' }}
    >
      <button onClick={onClose} className="absolute top-6 right-6 z-20 transition-colors" style={{ color: currentColors.primaryText }} aria-label="Close journal">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ color: currentColors.primaryText }}>Memory Journal</h1>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="relative flex items-center border-b-2" style={{ borderColor: currentColors.warmBronze }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-4 py-3 text-sm md:text-base font-semibold transition-colors duration-300"
              style={{ color: activeTab === tab ? currentColors.accentGold : currentColors.primaryText, opacity: activeTab === tab ? 1 : 0.7 }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div className="absolute bottom-[-2px] left-0 right-0 h-[3px]" style={{ backgroundColor: currentColors.accentGold }} layoutId="underline" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'Write Ups' && (
            <button onClick={onAddNewWriteUp} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">Add New Write Up</span>
            </button>
          )}
          <div className="relative">
            <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: currentColors.secondaryBg }}>
              <SlidersHorizontal className="w-5 h-5" style={{ color: currentColors.primaryText, opacity: 0.8 }} />
              <span className="text-sm font-medium" style={{ color: currentColors.primaryText }}>
                {sortOrder === 'newest-to-oldest' ? 'Newest to Oldest' : 'Oldest to Newest'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isSortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-10 overflow-hidden border"
                  style={{ backgroundColor: currentColors.secondaryBg, borderColor: currentColors.glassBorder }}
                >
                  <button onClick={() => { setSortOrder('newest-to-oldest'); setIsSortDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm transition-colors" style={{ color: currentColors.primaryText }}>Newest to Oldest</button>
                  <button onClick={() => { setSortOrder('oldest-to-newest'); setIsSortDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm transition-colors" style={{ color: currentColors.primaryText }}>Oldest to Newest</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-4">
        <AnimatePresence>
          {filteredAndSortedEntries.length > 0 ? (
            filteredAndSortedEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-lg flex items-center justify-between shadow-md"
                style={{ backgroundColor: currentColors.secondaryBg }}
              >
                <div className="flex items-center">
                  <div className="p-4 rounded-lg mr-5" style={{ backgroundColor: currentColors.primaryBg, color: currentColors.accentGold }}>{entry.icon}</div>
                  <div>
                    <p className="font-semibold text-lg" style={{ color: currentColors.primaryText }}>{entry.title}</p>
                    <p className="text-sm" style={{ color: currentColors.primaryText, opacity: 0.7 }}>{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-3 rounded-full transition-colors" style={{ backgroundColor: 'transparent' }}><Edit className="w-5 h-5" /></button>
                  <button className="p-3 rounded-full transition-colors" style={{ backgroundColor: 'transparent' }}><Trash2 className="w-5 h-5" style={{ color: '#f87171' }} /></button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center py-10" style={{ color: currentColors.primaryText, opacity: 0.5 }}>
              <Book className="w-20 h-20 mb-6" />
              <h3 className="text-2xl font-semibold">No Memories Found</h3>
              <p className="max-w-xs mt-2">There are no memories in this category yet.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MemoryJournalModal;


