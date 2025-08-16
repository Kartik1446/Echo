import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { themes } from '../../constants/themes';

const ProfileSetupPage = ({ theme, onProfileComplete }) => {
  const currentColors = themes[theme];
  const [profileData, setProfileData] = useState({ fullName: '', caregiverName: '', gender: '', age: '', profilePhoto: null });
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleChange = (e) => setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setProfileData(prev => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onProfileComplete(profileData);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className={`relative backdrop-blur-xl rounded-2xl p-10 shadow-2xl max-w-lg w-full border border-[${currentColors.glassBorder}] max-h-[90vh] overflow-y-auto`}
    >
      <h2 className={`text-4xl font-bold mb-2 text-[${currentColors.primaryText}] text-center`}>Complete Your Profile</h2>
      <p className={`text-center mb-10 text-[${currentColors.primaryText}] opacity-80`}>Just a few details to get started.</p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden mb-2 border-2 border-dashed" style={{ borderColor: currentColors.accentGold }}>
            {photoPreview ? (
              <img src={photoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              <div className={`flex flex-col items-center justify-center w-full h-full bg-[${currentColors.secondaryBg}]`}>
                <Camera className={`h-8 w-8 text-[${currentColors.primaryText}] opacity-70`} />
                <span className={`text-sm text-center text-[${currentColors.primaryText}] opacity-70 mt-1`}>Add Photo</span>
              </div>
            )}
            <input type="file" name="profilePhoto" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </div>
        <div>
          <label htmlFor="fullName" className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90`}>Full Name</label>
          <input type="text" id="fullName" name="fullName" value={profileData.fullName} onChange={handleChange} placeholder="Your full name" className={`w-full p-3 rounded-lg bg-[${currentColors.secondaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} required />
        </div>
        <div>
          <label htmlFor="caregiverName" className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90`}>Caregiver Name <span className="opacity-70 font-normal">(Optional)</span></label>
          <input type="text" id="caregiverName" name="caregiverName" value={profileData.caregiverName} onChange={handleChange} placeholder="Your caregiver's name" className={`w-full p-3 rounded-lg bg-[${currentColors.secondaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} />
        </div>
        <div>
          <label htmlFor="age" className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90`}>Age</label>
          <input type="number" id="age" name="age" value={profileData.age} onChange={handleChange} placeholder="Your age" min="1" max="120" className={`w-full p-3 rounded-lg bg-[${currentColors.secondaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] placeholder-[${currentColors.primaryText}] placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} required />
        </div>
        <div>
          <label htmlFor="gender" className={`block text-sm font-medium mb-2 text-[${currentColors.primaryText}] opacity-90`}>Gender</label>
          <select id="gender" name="gender" value={profileData.gender} onChange={handleChange} className={`w-full p-3 rounded-lg bg-[${currentColors.secondaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} required>
            <option value="" disabled className={`text-[${currentColors.primaryText}] opacity-50`}>Select your gender</option>
            <option value="male">Male</option> <option value="female">Female</option> <option value="non-binary">Non-binary</option> <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        <button type="submit" className={`w-full p-3 mt-8 rounded-lg bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold shadow-md transition-colors duration-300 transform hover:scale-105`}>Save Profile & Continue</button>
      </form>
    </motion.div>
  );
};

export default ProfileSetupPage;
