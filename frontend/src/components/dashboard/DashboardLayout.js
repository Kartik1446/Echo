import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Book, Bell, User, Settings, LogOut, Volume2, VolumeX, ChevronLeft, AlignJustify, HeartHandshake, Plus, Mic, Headset } from 'lucide-react';
import NavItem from './NavItem';
import FeatureCards from './FeatureCards';
import { themes } from '../../styles/tailwindStyles';

const DashboardLayout = ({ theme = 'dark', onLogout, userName, isMicActive, onAddSpeechClick, onAddMomentClick, onListenClick, onRemindersClick, onJournalClick, onSettingsClick, onCaregiverClick }) => {
  const [open, setOpen] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const currentColors = themes[theme];
  const navItems = [
    { label: 'Home', icon: <Home className="w-6 h-6 text-white text-opacity-80" />, action: () => onCaregiverClick(false) },
    { label: 'Memory Journal', icon: <Book className="w-6 h-6 text-white text-opacity-80" />, action: onJournalClick },
    { label: 'Reminders', icon: <Bell className="w-6 h-6 text-white text-opacity-80" />, action: onRemindersClick },
    { label: 'Caregiver', icon: <User className="w-6 h-6 text-white text-opacity-80" />, action: () => onCaregiverClick(true) },
    { label: 'Settings', icon: <Settings className="w-6 h-6 text-white text-opacity-80" />, action: onSettingsClick },
  ];
  const mainContentPadding = open ? 'pl-[284px]' : 'pl-[116px]';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: currentColors.dashboardBg, color: currentColors.primaryText }}>
      <motion.button className="fixed top-6 right-6 z-50 p-3 rounded-full shadow-lg transition-colors duration-300 focus:outline-none" style={{ backgroundColor: currentColors.secondaryBg, color: '#fff' }} onClick={() => setIsAudioOn(!isAudioOn)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Toggle app sounds">{isAudioOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}</motion.button>

      <motion.aside initial={false} animate={{ width: open ? 260 : 92 }} transition={{ duration: 0.4, ease: 'easeInOut' }} className="fixed inset-y-0 left-0 z-40 backdrop-blur-xl shadow-2xl flex flex-col p-6 rounded-r-3xl border-r border-white border-opacity-10" style={{ backgroundColor: currentColors.sidebarBg }}>
        <div className="flex-shrink-0">
          <div className={`flex items-center ${open ? 'justify-end' : 'justify-center'} mb-8`}><button onClick={() => setOpen(!open)} className="p-2 rounded-lg transition-colors duration-300 hover:bg-white hover:bg-opacity-10">{open ? <ChevronLeft className="w-6 h-6 text-white" /> : <AlignJustify className="w-6 h-6 text-white" />}</button></div>
          <div className={`flex items-center mb-12 transition-all duration-300 ${open ? '' : 'justify-center'}`}><img src="/Echo-logo.png" alt="ECHO Logo" className="w-10 h-10 mr-3 object-contain rounded-full" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/40x40/513524/FFD700?text=E'; }}/><motion.span className={`text-3xl font-bold whitespace-nowrap overflow-hidden ${open ? 'w-full' : 'w-0'}`} style={{ color: currentColors.accentGold }} initial={{ opacity: 0 }} animate={{ opacity: open ? 1 : 0 }} transition={{ duration: 0.3 }}>ECHO</motion.span></div>
        </div>

        <nav className="flex-grow space-y-3">
          {navItems.map((item) => <NavItem key={item.label} icon={item.icon} text={item.label} open={open} onClick={item.action} />)}
        </nav>

        <div className="flex-shrink-0 mt-auto pt-5 border-t border-white border-opacity-10">
          <NavItem icon={<LogOut className="w-6 h-6 text-white text-opacity-80" />} text="Logout" open={open} onClick={onLogout} />
        </div>
      </motion.aside>

      <main className={`flex-1 transition-all duration-300 ${mainContentPadding} p-8`}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="w-full h-full flex flex-col">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between p-8 rounded-2xl mb-8" style={{ backgroundColor: currentColors.warmBronze }}>
              <div>
                <h1 className="text-5xl font-bold mb-2" style={{ color: currentColors.primaryText }}>Hi {userName || 'there'}!</h1>
                <p className="text-lg" style={{ color: currentColors.primaryText, opacity: 0.8 }}>Today is a good day to remember</p>
              </div>
              <div className="hidden md:block"><HeartHandshake style={{ color: currentColors.accentGold, opacity: 0.5 }} size={80} strokeWidth={1.5} /></div>
            </div>
            <FeatureCards theme={theme} isMicActive={isMicActive} onAddSpeechClick={onAddSpeechClick} onAddMomentClick={onAddMomentClick} onListenClick={onListenClick} />
          </div>
          <div className="flex-grow p-8 rounded-2xl shadow-xl mt-8 flex flex-col" style={{ backgroundColor: currentColors.secondaryBg }}>
            <h2 className="text-2xl font-semibold text-white mb-6 flex-shrink-0">Memory Journal Feed</h2>
            <div className="flex-grow overflow-y-auto">
              <p className="text-gray-400">Content for the memory journal will be displayed here.</p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;

