import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { themes } from '../../constants/themes';

const UserInfoSection = ({ theme, user, onUpdateUser }) => {
  const currentColors = themes[theme];
  const [formData, setFormData] = useState({
    name: user.name || '',
    dob: user.dob || '',
    gender: user.gender || '',
    photo: user.photo || null,
  });
  const photoInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
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
    // You can add a success message here
  };

  return (
    <div className={`bg-[${currentColors.secondaryBg}] p-8 rounded-2xl shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 text-[${currentColors.primaryText}]`}>User Info</h2>
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
            onClick={() => photoInputRef.current.click()}
            className={`absolute bottom-0 right-0 p-2 bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] rounded-full hover:bg-[${currentColors.darkGold}] transition-colors`}
          >
            <Camera size={18} />
          </button>
        </div>
        <div className="w-full space-y-4 text-left">
          <div>
            <label className={`block text-sm font-medium mb-1 text-[${currentColors.primaryText}] opacity-80`}>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 text-[${currentColors.primaryText}] opacity-80`}>Date of Birth</label>
            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}] dark:[color-scheme:dark]`} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 text-[${currentColors.primaryText}] opacity-80`}>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full p-3 rounded-lg bg-[${currentColors.primaryBg}] border border-[${currentColors.darkGold}] text-[${currentColors.primaryText}] focus:outline-none focus:ring-2 focus:ring-[${currentColors.accentGold}]`}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>
      <button onClick={handleSaveChanges} className={`w-full mt-8 p-3 rounded-lg bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold shadow-md transition-colors`}>
        Save Changes
      </button>
    </div>
  );
};

export default UserInfoSection;
