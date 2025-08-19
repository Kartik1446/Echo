import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Smartphone, Battery, ChevronLeft } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const UserInfoSection = ({ theme, user, onUpdateUser }) => {
  const currentColors = themes[theme];
  const [formData, setFormData] = useState({
    name: user?.name || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
    photo: user?.photo || null,
  });
  const photoInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    onUpdateUser(formData);
  };

  return (
    <div className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: currentColors.primaryText }}>User Info</h2>
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="relative flex-shrink-0">
          <img
            src={formData.photo || 'https://placehold.co/128x128/513524/F9E4C8?text=User'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4"
            style={{ borderColor: currentColors.accentGold }}
          />
          <input type="file" ref={photoInputRef} onChange={handlePhotoChange} className="hidden" accept="image/*" />
          <button
            onClick={() => photoInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 rounded-full transition-colors"
            style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
          >
            <Camera size={18} />
          </button>
        </div>
        <div className="w-full space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: currentColors.primaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-3 rounded-lg focus:outline-none focus:ring-2 dark:[color-scheme:dark]" style={{ backgroundColor: currentColors.primaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 rounded-lg focus:outline-none focus:ring-2" style={{ backgroundColor: currentColors.primaryBg, border: `1px solid ${currentColors.darkGold}`, color: currentColors.primaryText }}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>
      <button onClick={handleSaveChanges} className="w-full mt-8 p-3 rounded-lg font-semibold shadow-md transition-colors" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>Save Changes</button>
    </div>
  );
};

const DeviceSettingsSection = ({ theme }) => {
  const currentColors = themes[theme];
  const [isPaired, setIsPaired] = useState(false);
  const [batteryLevel] = useState(78);

  return (
    <div className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
      <h2 className="text-2xl font-bold mb-6" style={{ color: currentColors.primaryText }}>Device Settings</h2>
      <div className="p-6 rounded-lg" style={{ backgroundColor: currentColors.primaryBg }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Smartphone size={28} style={{ color: currentColors.accentGold }} />
            <div>
              <p className="font-semibold text-lg">Smart Glasses</p>
              <p className={`text-sm ${isPaired ? 'text-green-400' : 'text-red-400'}`}>{isPaired ? 'Paired & Connected' : 'Not Paired'}</p>
            </div>
          </div>
          <button
            onClick={() => setIsPaired(!isPaired)}
            className="px-6 py-2 rounded-lg font-semibold transition-colors"
            style={isPaired ? { backgroundColor: 'rgba(220,38,38,0.2)', color: '#f87171' } : { backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
          >
            {isPaired ? 'Unpair' : 'Pair'}
          </button>
        </div>
        {isPaired && (
          <div className="mt-6">
            <label className="text-sm font-medium opacity-80 mb-2 flex items-center justify-between">
              <span>Battery</span>
              <span className="flex items-center gap-2"><Battery /> {batteryLevel}%</span>
            </label>
            <div className="w-full rounded-full h-2.5" style={{ backgroundColor: currentColors.secondaryBg }}>
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${batteryLevel}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsPage = ({ theme = 'dark', onBack, user, onUpdateUser }) => {
  const currentColors = themes[theme];
  const mainContentPadding = 'px-8 py-8';

  return (
    <motion.div
      key="settings-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen"
      style={{ backgroundColor: currentColors.dashboardBg, color: currentColors.primaryText }}
    >
      <div className={`max-w-7xl mx-auto ${mainContentPadding}`}>
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-5xl font-bold">Settings</h1>
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-lg font-semibold transition-colors"
            style={{ color: currentColors.primaryText }}
            whileHover={{ x: -5 }}
          >
            <ChevronLeft size={24} />
            <span>Back to Dashboard</span>
          </motion.button>
        </div>

        <div className="flex flex-col gap-12">
          <UserInfoSection theme={theme} user={user} onUpdateUser={onUpdateUser} />
          <DeviceSettingsSection theme={theme} />
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;


