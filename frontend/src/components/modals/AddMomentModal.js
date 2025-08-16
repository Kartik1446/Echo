import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Image as ImageIcon, Video, CheckCircle } from 'lucide-react';
import { themes } from '../../constants/themes';

const AddMomentModal = ({ theme, onClose, onSaveMoment }) => {
  const currentColors = themes[theme];
  const [step, setStep] = useState('initial');
  const [momentType, setMomentType] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [momentData, setMomentData] = useState({ file: null, title: '', people: '', memory: '', date: '', location: '' });
  const fileInputRef = useRef(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMomentData(prev => ({ ...prev, file }));
      setFilePreview(URL.createObjectURL(file));
      setStep('addDetails');
    }
  };

  const handleUploadClick = (type) => {
    setMomentType(type);
    fileInputRef.current.accept = type === 'Photo' ? 'image/*' : 'video/*';
    fileInputRef.current.click();
  };

  const handleDataChange = (e) => setMomentData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleGoBack = () => {
    setStep('initial');
    setFilePreview(null);
    setMomentData(prev => ({ ...prev, file: null, title: '' }));
  };

  const handleSaveMoment = () => {
    if (momentData.title.trim()) {
      onSaveMoment(momentData.title, momentType);
    }
    setIsSaved(true);
  };

  const handleNewMoment = () => {
    setIsSaved(false);
    setStep('initial');
    setFilePreview(null);
    setMomentData({ file: null, title: '', people: '', memory: '', date: '', location: '' });
  };

  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative bg-[${currentColors.secondaryBg}] rounded-2xl p-10 shadow-2xl max-w-2xl w-full border border-[${currentColors.glassBorder}] flex flex-col text-center max-h-[90vh] overflow-y-auto`}>
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
      <AnimatePresence mode="wait">
        {isSaved ? (
          <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full">
            <CheckCircle className={`w-24 h-24 text-green-400 mb-6`} />
            <h2 className={`text-4xl font-bold mb-3 text-[${currentColors.primaryText}]`}>Moment Saved!</h2>
            <p className={`text-center mb-8 text-[${currentColors.primaryText}] opacity-80 max-w-sm`}>Your new memory has been anchored with ECHO.</p>
            <div className="flex items-center gap-4 mt-6 w-full">
              <button onClick={handleNewMoment} className={`w-1/2 p-3 text-sm text-[${currentColors.primaryText}] opacity-70 hover:opacity-100 transition-opacity border border-[${currentColors.warmBronze}] rounded-lg`}>Add Another</button>
              <button onClick={onClose} className={`w-1/2 p-3 bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold rounded-lg shadow-md transition duration-300`}>Close</button>
            </div>
          </motion.div>
        ) : step === 'initial' ? (
          <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center w-full">
            <Users size={80} className={`text-[${currentColors.accentGold}] mb-6`} />
            <h2 className={`text-4xl font-bold mb-3 text-[${currentColors.primaryText}]`}>Add a New Moment</h2>
            <p className={`text-center mb-10 text-[${currentColors.primaryText}] opacity-80 max-w-sm`}>Upload a photo or video to create a new memory anchor for ECHO.</p>
            <div className="flex w-full gap-6 my-4">
              <button onClick={() => handleUploadClick('Photo')} className={`flex-1 flex flex-col items-center justify-center p-8 bg-[${currentColors.primaryBg}] rounded-lg border border-transparent hover:border-[${currentColors.accentGold}] transition-colors text-lg font-semibold text-[${currentColors.primaryText}]`}><ImageIcon size={32} className={`mb-3 text-[${currentColors.accentGold}]`} /> Upload Photo</button>
              <button onClick={() => handleUploadClick('Video')} className={`flex-1 flex flex-col items-center justify-center p-8 bg-[${currentColors.primaryBg}] rounded-lg border border-transparent hover:border-[${currentColors.accentGold}] transition-colors text-lg font-semibold text-[${currentColors.primaryText}]`}><Video size={32} className={`mb-3 text-[${currentColors.accentGold}]`} /> Upload Video</button>
            </div>
            <button onClick={onClose} className={`mt-8 text-sm text-[${currentColors.primaryText}] opacity-70 hover:opacity-100 transition-opacity`}>Cancel</button>
          </motion.div>
        ) : (
          <motion.div key="addDetails" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center w-full text-left">
            <h2 className={`text-3xl font-bold mb-6 text-[${currentColors.primaryText}] self-start`}>Tell us about this {momentType}</h2>
            <div className="rounded-lg w-full h-72 bg-black/20 flex items-center justify-center mb-6">
              {momentType === 'Photo' && filePreview && <img src={filePreview} alt="Moment preview" className="max-w-full max-h-full object-contain rounded-md" />}
              {momentType === 'Video' && filePreview && <video src={filePreview} controls className="max-w-full max-h-full rounded-md" />}
            </div>
            <div className="space-y-5 w-full mt-4">
              <div><label className="text-sm opacity-80 mb-1 block">Title</label><input type="text" name="title" value={momentData.title} onChange={handleDataChange} placeholder="e.g., Dad's 60th Birthday" className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} /></div>
              <div><label className="text-sm opacity-80 mb-1 block">Who is in this {momentType}?</label><input type="text" name="people" value={momentData.people} onChange={handleDataChange} placeholder="e.g., Mom, Dad, and me at the park" className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} /></div>
              <div><label className="text-sm opacity-80 mb-1 block">What is the memory related to it?</label><textarea name="memory" value={momentData.memory} onChange={handleDataChange} placeholder="e.g., This was for Dad's 60th birthday..." rows="4" className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`}></textarea></div>
              <div className="flex gap-6"><div className="w-1/2"><label className="text-sm opacity-80 mb-1 block">Date of Memory</label><input type="date" name="date" value={momentData.date} onChange={handleDataChange} className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} /></div><div className="w-1/2"><label className="text-sm opacity-80 mb-1 block">Location</label><input type="text" name="location" value={momentData.location} onChange={handleDataChange} placeholder="e.g., Goa, India" className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} /></div></div>
            </div>
            <div className="flex items-center gap-4 mt-10 w-full">
              <button onClick={handleGoBack} className={`w-1/2 p-3 text-sm font-semibold text-[${currentColors.primaryText}] opacity-80 hover:opacity-100 transition-opacity border border-[${currentColors.warmBronze}] rounded-lg`}>Go Back</button>
              <button onClick={handleSaveMoment} className={`w-1/2 p-3 bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold rounded-lg shadow-md transition duration-300`}>Save Moment</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AddMomentModal;
