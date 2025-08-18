import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Edit, Trash2, Bell } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const RemindersModal = ({ theme = 'dark', onClose, reminders, setReminders }) => {
  const currentColors = themes[theme];
  const [isListView, setIsListView] = useState(true);
  const [currentReminder, setCurrentReminder] = useState(null);

  const handleAddNew = () => { setCurrentReminder({ id: null, text: '', datetime: new Date().toISOString().slice(0, 16) }); setIsListView(false); };
  const handleEdit = (reminder) => { setCurrentReminder(reminder); setIsListView(false); };
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
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative rounded-2xl p-10 shadow-2xl max-w-3xl w-full border flex flex-col text-left max-h-[90vh]" style={{ backgroundColor: currentColors.glassBg, borderColor: currentColors.glassBorder, backdropFilter: 'blur(12px)' }}>
      <button onClick={onClose} className="absolute top-6 right-6 z-10 transition-colors" style={{ color: currentColors.primaryText }} aria-label="Close reminders"><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
      <AnimatePresence mode="wait">
        {isListView ? (
          <motion.div key="list-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-grow min-h-0">
            <h2 className="text-4xl font-bold mb-8 flex-shrink-0" style={{ color: currentColors.primaryText }}>Reminders</h2>
            <div className="flex-grow overflow-y-auto pr-4 -mr-6 space-y-4">
              {sortedReminders.length > 0 ? (
                sortedReminders.map((reminder) => (
                  <div key={reminder.id} className="p-5 rounded-lg flex items-center gap-6" style={{ backgroundColor: currentColors.secondaryBg }}>
                    <CalendarCheck className="w-8 h-8 flex-shrink-0" style={{ color: currentColors.accentGold }} />
                    <div className="flex-grow">
                      <p className="font-semibold text-lg" style={{ color: currentColors.primaryText }}>{reminder.text}</p>
                      <p className="text-sm" style={{ color: currentColors.primaryText, opacity: 0.7 }}>{new Date(reminder.datetime).toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(reminder)} className="p-2 rounded-full transition-colors" style={{ backgroundColor: 'transparent' }}><Edit className="w-5 h-5" style={{ color: currentColors.primaryText }} /></button>
                      <button onClick={() => handleDelete(reminder.id)} className="p-2 rounded-full transition-colors" style={{ backgroundColor: 'transparent' }}><Trash2 className="w-5 h-5" style={{ color: '#f87171' }} /></button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10" style={{ color: currentColors.primaryText, opacity: 0.5 }}>
                  <Bell className="w-20 h-20 mb-6" />
                  <h3 className="text-2xl font-semibold">No Reminders Yet</h3>
                  <p className="max-w-xs mt-2">Click "Add New Reminder" to get started.</p>
                </div>
              )}
            </div>
            <button onClick={handleAddNew} className="w-full mt-8 p-4 rounded-lg font-semibold shadow-md transition-colors duration-300 flex items-center justify-center gap-2 flex-shrink-0 text-lg" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}><span className="w-6 h-6">+</span> Add New Reminder</button>
          </motion.div>
        ) : (
          <motion.div key="add-edit-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="text-4xl font-bold mb-8" style={{ color: currentColors.primaryText }}>{currentReminder?.id ? 'Edit Reminder' : 'Add Reminder'}</h2>
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-medium mb-3" style={{ color: currentColors.primaryText, opacity: 0.9 }}>Write a Reminder</label>
                <textarea rows="4" value={currentReminder.text} onChange={(e) => setCurrentReminder({ ...currentReminder, text: e.target.value })} className="w-full p-4 text-lg rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: currentColors.secondaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }} />
              </div>
              <div>
                <label className="block text-lg font-medium mb-3" style={{ color: currentColors.primaryText, opacity: 0.9 }}>Set Reminder Date & Time</label>
                <input type="datetime-local" value={currentReminder.datetime} onChange={(e) => setCurrentReminder({ ...currentReminder, datetime: e.target.value })} className="w-full p-4 text-lg rounded-lg focus:outline-none focus:ring-2 dark:[color-scheme:dark]" style={{ backgroundColor: currentColors.secondaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }} />
              </div>
            </div>
            <div className="flex items-center gap-6 mt-10 w-full">
              <button onClick={() => setIsListView(true)} className="w-1/2 p-4 text-lg rounded-lg font-semibold transition-colors" style={{ border: `1px solid ${currentColors.warmBronze}`, color: currentColors.primaryText }}>Cancel</button>
              <button onClick={handleSave} className="w-1/2 p-4 text-lg rounded-lg font-semibold shadow-md transition-colors" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>Save Reminder</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RemindersModal;


