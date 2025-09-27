import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mic, 
  Headphones, 
  Plus, 
  BookOpen, 
  Bell, 
  Edit3, 
  LogOut,
  User,
  Settings
} from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const DashboardModal = ({ theme = 'dark', onClose, onLogout, userProfile }) => {
  const currentColors = themes[theme];

  const dashboardFeatures = [
    {
      icon: <Mic size={32} />,
      title: 'Record Memory',
      description: 'Capture new memories with voice',
      action: 'record-memory'
    },
    {
      icon: <Headphones size={32} />,
      title: 'Listen to Echo',
      description: 'Relive your recorded memories',
      action: 'listen-echo'
    },
    {
      icon: <Plus size={32} />,
      title: 'Add Moment',
      description: 'Upload photos and videos',
      action: 'add-moment'
    },
    {
      icon: <BookOpen size={32} />,
      title: 'Memory Journal',
      description: 'Browse all your memories',
      action: 'memory-journal'
    },
    {
      icon: <Bell size={32} />,
      title: 'Reminders',
      description: 'Set memory reminders',
      action: 'reminders'
    },
    {
      icon: <Edit3 size={32} />,
      title: 'Add Write-up',
      description: 'Write about your memories',
      action: 'add-writeup'
    }
  ];

  const handleFeatureClick = (action) => {
    // This would trigger the specific modal
    console.log('Opening:', action);
    // For now, just log the action
  };

  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ color: currentColors.primaryText }}>
            Welcome to ECHO
          </h1>
          <p className="text-xl" style={{ color: currentColors.primaryText, opacity: 0.8 }}>
            Your personal memory companion
          </p>
          {userProfile && (
            <div className="mt-6 p-6 rounded-xl inline-block" style={{ backgroundColor: currentColors.secondaryBg }}>
              <div className="flex items-center space-x-4">
                {userProfile.profileImage ? (
                  <img
                    src={URL.createObjectURL(userProfile.profileImage)}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User size={64} style={{ color: currentColors.accentGold }} />
                )}
                <div className="text-left">
                  <p className="text-xl font-semibold" style={{ color: currentColors.primaryText }}>
                    {userProfile.name || 'User'}
                  </p>
                  <p className="text-base" style={{ color: currentColors.primaryText, opacity: 0.7 }}>
                    {userProfile.location || 'Location not set'}
                  </p>
                  <p className="text-sm" style={{ color: currentColors.primaryText, opacity: 0.6 }}>
                    {userProfile.email || 'Email not set'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: currentColors.secondaryBg }}>
            <div className="text-3xl font-bold mb-2" style={{ color: currentColors.accentGold }}>12</div>
            <div className="text-base" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Memories</div>
          </div>
          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: currentColors.secondaryBg }}>
            <div className="text-3xl font-bold mb-2" style={{ color: currentColors.accentGold }}>3</div>
            <div className="text-base" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Reminders</div>
          </div>
          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: currentColors.secondaryBg }}>
            <div className="text-3xl font-bold mb-2" style={{ color: currentColors.accentGold }}>8</div>
            <div className="text-base" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Moments</div>
          </div>
          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: currentColors.secondaryBg }}>
            <div className="text-3xl font-bold mb-2" style={{ color: currentColors.accentGold }}>5</div>
            <div className="text-base" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Write-ups</div>
          </div>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {dashboardFeatures.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-8 rounded-xl cursor-pointer transition-all duration-300"
              style={{ backgroundColor: currentColors.secondaryBg }}
              onClick={() => handleFeatureClick(feature.action)}
            >
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-xl flex items-center justify-center" 
                     style={{ backgroundColor: currentColors.accentGold }}>
                  <div style={{ color: currentColors.secondaryText }}>
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: currentColors.primaryText }}>
                  {feature.title}
                </h3>
                <p className="text-base" style={{ color: currentColors.primaryText, opacity: 0.8 }}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-6">
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-lg font-semibold transition-colors duration-300 text-lg"
            style={{ color: currentColors.primaryText, border: `2px solid ${currentColors.darkGold}` }}
          >
            Back to Landing
          </button>
          <button
            onClick={onLogout}
            className="px-8 py-4 rounded-lg font-semibold shadow-lg transition-colors duration-300 flex items-center text-lg"
            style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
          >
            <LogOut size={24} className="mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;
