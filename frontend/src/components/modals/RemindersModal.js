import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Edit, Trash2, Bell, Plus } from 'lucide-react';
import { themes } from '../../constants/themes';

const RemindersModal = ({ theme, onClose, reminders, setReminders }) => {
  const currentColors = themes[theme];
  const [isListView, setIsListView] = useState(true);
  const [currentReminder, setCurrentReminder] = useState(null);

  const handleAddNew = () => {
    setCurrentReminder({ id: null, text: '', datetime: new Date().toISOString().slice(0, 16) });
    setIsListView(false);
  };

  const handleEdit = (reminder) => {
    setCurrentReminder(reminder);
    setIsListView(false);
  };

  const handleDelete = (id) => setReminders(reminders.filter(r => r.id !== id));

  const handleSave = () => {
    if (!currentReminder.text || !currentReminder.datetime) return;
    if (currentReminder.id) {
      setReminders(reminders.map(r => r.id === currentReminder.id ? currentReminder : r));
    } else {
      setReminders([...reminders, { ...currentReminder, id: Date.now() }]);
    }
    setIsListView(true);
    setCurrentReminder(null);
  };
  
  const sortedReminders = [...reminders].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative bg-[${currentColors.glassBg}] backdrop-blur-xl rounded-2xl p-10 shadow-2xl max-w-3xl w-full border border-[${currentColors.glassBorder}] flex flex-col text-left max-h-[90vh]`}>
      <button onClick={onClose} className={`absolute top-6 right-6 text-[${currentColors.primaryText}] hover:text-[${currentColors.accentGold}] transition-colors duration-300 z-10`} aria-label="Close reminders"><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
      <AnimatePresence mode="wait">
        {isListView ? (
          <motion.div key="list-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-grow min-h-0">
            <h2 className={`text-4xl font-bold mb-8 text-[${currentColors.primaryText}] flex-shrink-0`}>Reminders</h2>
            <div className="flex-grow overflow-y-auto pr-4 -mr-6 space-y-4">
              {sortedReminders.length > 0 ? (
                sortedReminders.map((reminder) => (
                  <div key={reminder.id} className={`p-5 rounded-lg bg-[${currentColors.secondaryBg}] flex items-center gap-6`}>
                    <CalendarCheck className={`w-8 h-8 text-[${currentColors.accentGold}] flex-shrink-0`} />
                    <div className="flex-grow">
                      <p className={`font-semibold text-lg text-[${currentColors.primaryText}]`}>{reminder.text}</p>
                      <p className={`text-sm text-[${currentColors.primaryText}] opacity-70`}>{new Date(reminder.datetime).toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(reminder)} className={`p-2 rounded-full hover:bg-[${currentColors.primaryBg}] transition-colors`}><Edit className={`w-5 h-5 text-[${currentColors.primaryText}]`} /></button>
                      <button onClick={() => handleDelete(reminder.id)} className={`p-2 rounded-full hover:bg-[${currentColors.primaryBg}] transition-colors`}><Trash2 className={`w-5 h-5 text-red-400`} /></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-opacity-50 text-[${currentColors.primaryText}] py-10">
                  <Bell className="w-20 h-20 mb-6" />
                  <h3 className="text-2xl font-semibold">No Reminders Yet</h3>
                  <p className="max-w-xs mt-2">Click "Add New Reminder" to get started.</p>
                </div>
              )}
            </div>
            <button onClick={handleAddNew} className={`w-full mt-8 p-4 rounded-lg bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold shadow-md transition-colors duration-300 flex items-center justify-center gap-2 flex-shrink-0 text-lg`}><Plus className="w-6 h-6" /> Add New Reminder</button>
          </motion.div>
        ) : (
          <motion.div key="add-edit-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className={`text-4xl font-bold mb-8 text-[${currentColors.primaryText}]`}>{currentReminder?.id ? 'Edit Reminder' : 'Add Reminder'}</h2>
            <div className="space-y-8">
              <div>
                <label className={`block text-lg font-medium mb-3 text-[${currentColors.primaryText}] opacity-90`}>Write a Reminder</label>
                <textarea rows="4" value={currentReminder.text} onChange={(e) => setCurrentReminder({ ...currentReminder, text: e.target.value })} className={`w-full p-4 text-lg rounded-lg bg-[${currentColors.secondaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} />
              </div>
              <div>
                <label className={`block text-lg font-medium mb-3 text-[${currentColors.primaryText}] opacity-90`}>Set Reminder Date & Time</label>
                <input type="datetime-local" value={currentReminder.datetime} onChange={(e) => setCurrentReminder({ ...currentReminder, datetime: e.target.value })} className={`w-full p-4 text-lg rounded-lg bg-[${currentColors.secondaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}] dark:[color-scheme:dark]`} />
              </div>
            </div>
            <div className="flex items-center gap-6 mt-10 w-full">
              <button onClick={() => setIsListView(true)} className={`w-1/2 p-4 text-lg rounded-lg border border-[${currentColors.warmBronze}] text-[${currentColors.primaryText}] font-semibold transition-colors hover:bg-[${currentColors.secondaryBg}]`}>Cancel</button>
              <button onClick={handleSave} className={`w-1/2 p-4 text-lg rounded-lg bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold shadow-md transition-colors`}>Save Reminder</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RemindersModal;
