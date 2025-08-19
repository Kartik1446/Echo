import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Heart } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const ProfileSetupPage = ({ theme = 'dark', onClose, onProfileComplete = () => {} }) => {
  const currentColors = themes[theme];
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    location: '',
    interests: [],
    profileImage: null,
    relationshipStatus: '',
    familyMembers: []
  });

  const handleInputChange = (e) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInterestToggle = (interest) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData(prev => ({ ...prev, profileImage: file }));
    }
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    onProfileComplete(profileData);
  };

  const interests = ['Travel', 'Music', 'Cooking', 'Sports', 'Reading', 'Photography', 'Art', 'Technology'];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="relative backdrop-blur-xl rounded-2xl p-10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border"
      style={{ borderColor: currentColors.glassBorder, background: currentColors.glassBg }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 transition-colors duration-300"
        style={{ color: currentColors.primaryText }}
        aria-label="Close profile setup"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-2" style={{ color: currentColors.primaryText }}>
          Complete Your Profile
        </h2>
        <p className="text-lg" style={{ color: currentColors.primaryText, opacity: 0.8 }}>
          Step {step} of 3
        </p>
      </div>

      <div className="mb-8">
        <div className="flex justify-center space-x-2">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                stepNum <= step ? 'bg-yellow-400' : 'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <User size={60} className="mx-auto mb-4" style={{ color: currentColors.accentGold }} />
            <h3 className="text-2xl font-semibold mb-2" style={{ color: currentColors.primaryText }}>
              Basic Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentColors.primaryText }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: currentColors.secondaryBg,
                  border: `1px solid ${currentColors.darkGold}`,
                  color: currentColors.primaryText
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentColors.primaryText }}>
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={profileData.age}
                  onChange={handleInputChange}
                  placeholder="Age"
                  className="w-full p-3 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: currentColors.secondaryBg,
                    border: `1px solid ${currentColors.darkGold}`,
                    color: currentColors.primaryText
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentColors.primaryText }}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  className="w-full p-3 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: currentColors.secondaryBg,
                    border: `1px solid ${currentColors.darkGold}`,
                    color: currentColors.primaryText
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <Heart size={60} className="mx-auto mb-4" style={{ color: currentColors.accentGold }} />
            <h3 className="text-2xl font-semibold mb-2" style={{ color: currentColors.primaryText }}>
              Interests & Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-4" style={{ color: currentColors.primaryText }}>
                Select your interests (choose up to 5):
              </label>
              <div className="grid grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      profileData.interests.includes(interest)
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentColors.primaryText }}>
                Relationship Status
              </label>
              <select
                name="relationshipStatus"
                value={profileData.relationshipStatus}
                onChange={handleInputChange}
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: currentColors.secondaryBg,
                  border: `1px solid ${currentColors.darkGold}`,
                  color: currentColors.primaryText
                }}
              >
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="in-relationship">In a Relationship</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-6">
            <Camera size={60} className="mx-auto mb-4" style={{ color: currentColors.accentGold }} />
            <h3 className="text-2xl font-semibold mb-2" style={{ color: currentColors.primaryText }}>
              Profile Picture
            </h3>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-dashed flex items-center justify-center"
                   style={{ borderColor: currentColors.darkGold }}>
                {profileData.profileImage ? (
                  <img
                    src={URL.createObjectURL(profileData.profileImage)}
                    alt="Profile preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Camera size={40} style={{ color: currentColors.darkGold }} />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-image"
              />
              <label
                htmlFor="profile-image"
                className="px-6 py-3 rounded-lg font-semibold cursor-pointer transition-colors duration-300 inline-block"
                style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
              >
                Upload Photo
              </label>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex justify-between mt-10">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
            style={{ color: currentColors.primaryText, border: `1px solid ${currentColors.darkGold}` }}
          >
            Back
          </button>
        )}
        
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-lg font-semibold shadow-md transition-colors duration-300 ml-auto"
            style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="px-6 py-3 rounded-lg font-semibold shadow-md transition-colors duration-300 ml-auto"
            style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
          >
            Complete Setup
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProfileSetupPage;
