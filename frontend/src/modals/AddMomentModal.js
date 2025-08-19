import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Image as ImageIcon, Video, CheckCircle } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const AddMomentModal = ({ theme = 'dark', onClose, onSaveMoment }) => {
  const currentColors = themes[theme];
  const [step, setStep] = useState('initial');
  const [momentType, setMomentType] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [momentData, setMomentData] = useState({ file: null, title: '', people: '', memory: '', date: '', location: '' });
  const fileInputRef = useRef(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMomentData(prev => ({ ...prev, file }));
      setFilePreview(URL.createObjectURL(file));
      setStep('addDetails');
    }
  };
  const handleUploadClick = (type) => {
    setMomentType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'Photo' ? 'image/*' : 'video/*';
      fileInputRef.current.click();
    }
  };
  const handleDataChange = (e) => setMomentData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleGoBack = () => { setStep('initial'); setFilePreview(null); setMomentData(prev => ({ ...prev, file: null, title: '' })); };
  const handleSaveMoment = () => {
    if (momentData.title.trim()) {
      onSaveMoment(momentData.title, momentType);
    }
    setIsSaved(true);
  };
  const handleNewMoment = () => { setIsSaved(false); setStep('initial'); setFilePreview(null); setMomentData({ file: null, title: '', people: '', memory: '', date: '', location: '' }); };

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative rounded-2xl p-10 shadow-2xl max-w-2xl w-full border flex flex-col text-center max-h-[90vh] overflow-y-auto" style={{ backgroundColor: currentColors.secondaryBg, borderColor: currentColors.glassBorder }}>
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
      <AnimatePresence mode="wait">
        {isSaved ? (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full">
            <CheckCircle className="w-24 h-24 text-green-400 mb-6" />
            <h2 className="text-4xl font-bold mb-3" style={{ color: currentColors.primaryText }}>Moment Saved!</h2>
            <p className="text-center mb-8 max-w-sm" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Your new memory has been anchored with ECHO.</p>
            <div className="flex items-center gap-4 mt-6 w-full">
              <button onClick={handleNewMoment} className="w-1/2 p-3 text-sm transition-opacity rounded-lg" style={{ color: currentColors.primaryText, opacity: 0.7, border: `1px solid ${currentColors.warmBronze}` }}>Add Another</button>
              <button onClick={onClose} className="w-1/2 p-3 font-semibold rounded-lg shadow-md transition duration-300" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>Close</button>
            </div>
          </motion.div>
        ) : step === 'initial' ? (
          <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full">
            <Users size={80} className="mb-6" style={{ color: currentColors.accentGold }} />
            <h2 className="text-4xl font-bold mb-3" style={{ color: currentColors.primaryText }}>Add a New Moment</h2>
            <p className="text-center mb-10 max-w-sm" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Upload a photo or video to create a new memory anchor for ECHO.</p>
            <div className="flex w-full gap-6 my-4">
              <button onClick={() => handleUploadClick('Photo')} className="flex-1 flex flex-col items-center justify-center p-8 rounded-lg border transition-colors text-lg font-semibold" style={{ backgroundColor: currentColors.primaryBg, borderColor: 'transparent', color: currentColors.primaryText }}><ImageIcon size={32} className="mb-3" style={{ color: currentColors.accentGold }} /> Upload Photo</button>
              <button onClick={() => handleUploadClick('Video')} className="flex-1 flex flex-col items-center justify-center p-8 rounded-lg border transition-colors text-lg font-semibold" style={{ backgroundColor: currentColors.primaryBg, borderColor: 'transparent', color: currentColors.primaryText }}><Video size={32} className="mb-3" style={{ color: currentColors.accentGold }} /> Upload Video</button>
            </div>
            <button onClick={onClose} className="mt-8 text-sm transition-opacity" style={{ color: currentColors.primaryText, opacity: 0.7 }}>Cancel</button>
          </motion.div>
        ) : (
          <motion.div key="addDetails" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full text-left">
            <h2 className="text-3xl font-bold mb-6 self-start" style={{ color: currentColors.primaryText }}>Tell us about this {momentType}</h2>
            <div className="rounded-lg w-full h-72 flex items-center justify-center mb-6" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              {momentType === 'Photo' && filePreview && <img src={filePreview} alt="Moment preview" className="max-w-full max-h-full object-contain rounded-md" />}
              {momentType === 'Video' && filePreview && <video src={filePreview} controls className="max-w-full max-h-full rounded-md" />}
            </div>
            <div className="space-y-5 w-full mt-4">
              <div><label className="text-sm opacity-80 mb-1 block">Title</label><input type="text" name="title" value={momentData.title} onChange={handleDataChange} placeholder="e.g., Dad's 60th Birthday" className="w-full p-3 rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: currentColors.primaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }} /></div>
              <div><label className="text-sm opacity-80 mb-1 block">Who is in this {momentType}?</label><input type="text" name="people" value={momentData.people} onChange={handleDataChange} placeholder="e.g., Mom, Dad, and me at the park" className="w-full p-3 rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: currentColors.primaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }} /></div>
              <div><label className="text-sm opacity-80 mb-1 block">What is the memory related to it?</label><textarea name="memory" value={momentData.memory} onChange={handleDataChange} placeholder="e.g., This was for Dad's 60th birthday..." rows="4" className="w-full p-3 rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: currentColors.primaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }}></textarea></div>
              <div className="flex gap-6"><div className="w-1/2"><label className="text-sm opacity-80 mb-1 block">Date of Memory</label><input type="date" name="date" value={momentData.date} onChange={handleDataChange} className="w-full p-3 rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: currentColors.primaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }} /></div><div className="w-1/2"><label className="text-sm opacity-80 mb-1 block">Location</label><input type="text" name="location" value={momentData.location} onChange={handleDataChange} placeholder="e.g., Goa, India" className="w-full p-3 rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: currentColors.primaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }} /></div></div>
            </div>
            <div className="flex items-center gap-4 mt-10 w-full">
              <button onClick={handleGoBack} className="w-1/2 p-3 text-sm font-semibold rounded-lg" style={{ color: currentColors.primaryText, opacity: 0.8, border: `1px solid ${currentColors.warmBronze}` }}>Go Back</button>
              <button onClick={handleSaveMoment} className="w-1/2 p-3 font-semibold rounded-lg shadow-md transition duration-300" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>Save Moment</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddMomentModal;


