import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './landing/Navbar';
import TeamPage from './landing/TeamPage';
import { themes } from './styles/tailwindStyles';
import './App.css';
import PixelBlast from './PixelBlast';
import DarkVeil from './DarkVeil';

import LoginPage from './modals/LoginPage';
import ProfileSetupPage from './modals/ProfileSetupPage';
import LogoutConfirmModal from './modals/LogoutConfirmModal';
import ListenToEchoModal from './modals/ListenToEchoModal';
import AddMomentModal from './modals/AddMomentModal';
import RecordMemoryModal from './modals/RecordMemoryModal';
import MemoryJournalModal from './modals/MemoryJournalModal';
import RemindersModal from './modals/RemindersModal';
import AddWriteUpModal from './modals/AddWriteUpModal';
import DashboardModal from './modals/DashboardModal';

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [currentPage, setCurrentPage] = useState('landing');
  const [activeModal, setActiveModal] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const currentColors = themes[theme];

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const handleGetStarted = () => {
    if (isLoggedIn) {
      setCurrentPage('dashboard');
    } else {
      setActiveModal('login');
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUserProfile(userData);
    setActiveModal('profile-setup');
  };

  const handleProfileComplete = (profileData) => {
    setUserProfile(prev => ({ ...prev, ...profileData }));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserProfile(null);
    setCurrentPage('landing');
    setActiveModal(null);
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const renderModal = () => {
    switch (activeModal) {
      case 'login':
        return (
          <LoginPage
            theme={theme}
            onClose={handleCloseModal}
            onLoginSuccess={handleLoginSuccess}
          />
        );
      case 'profile-setup':
        return (
          <ProfileSetupPage
            theme={theme}
            onClose={handleCloseModal}
            onProfileComplete={handleProfileComplete}
          />
        );
      case 'logout-confirm':
        return (
          <LogoutConfirmModal
            theme={theme}
            onClose={handleCloseModal}
            onConfirmLogout={handleLogout}
          />
        );
      case 'listen-echo':
        return (
          <ListenToEchoModal
            theme={theme}
            onClose={handleCloseModal}
          />
        );
      case 'add-moment':
        return (
          <AddMomentModal
            theme={theme}
            onClose={handleCloseModal}
            onSaveMoment={(title, type) => {
              console.log('Moment saved:', { title, type });
              handleCloseModal();
            }}
          />
        );
      case 'record-memory':
        return (
          <RecordMemoryModal
            theme={theme}
            onClose={handleCloseModal}
            onSaveMemory={(title, audioBlob) => {
              console.log('Memory saved:', { title, audioBlob });
              handleCloseModal();
            }}
          />
        );
      case 'memory-journal':
        return (
          <MemoryJournalModal
            theme={theme}
            onClose={handleCloseModal}
          />
        );
      case 'reminders':
        return (
          <RemindersModal
            theme={theme}
            onClose={handleCloseModal}
          />
        );
      case 'add-writeup':
        return (
          <AddWriteUpModal
            theme={theme}
            onClose={handleCloseModal}
            onSaveWriteUp={(title, content) => {
              console.log('Write-up saved:', { title, content });
              handleCloseModal();
            }}
          />
        );
      default:
        return null;
    }
  };

  if (currentPage === 'team') {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: 1, color: currentColors.primaryText }}>
          <Navbar theme={theme} toggleTheme={toggleTheme} onGetStartedClick={handleGetStarted} onTeamClick={() => setCurrentPage('team')} isLoggedIn={isLoggedIn} currentPage={currentPage} />
          <TeamPage theme={theme} onBack={() => setCurrentPage('landing')} />
        </div>
      </div>
    );
  }

  if (currentPage === 'dashboard') {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <div style={{ position: 'relative', zIndex: -1, color: currentColors.primaryText }}>
          <Navbar theme={theme} toggleTheme={toggleTheme} onGetStartedClick={handleGetStarted} onTeamClick={() => setCurrentPage('team')} isLoggedIn={isLoggedIn} currentPage={currentPage} />
          <DashboardModal
            theme={theme}
            onClose={handleBackToLanding}
            onLogout={() => setActiveModal('logout-confirm')}
            userProfile={userProfile}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#B19EEF"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1, color: currentColors.primaryText }}>
        <Navbar theme={theme} toggleTheme={toggleTheme} onGetStartedClick={handleGetStarted} onTeamClick={() => setCurrentPage('team')} isLoggedIn={isLoggedIn} currentPage={currentPage} />
        <main className="pt-20">
          <section id="home" className="relative flex flex-col md:flex-row items-center justify-center py-24 md:py-32 px-6 text-center md:text-left">
            <div style={{ width: '100%', height: '600px', position: 'absolute', top: 0, left: 0, overflow: 'hidden' }}>
              <DarkVeil />
            </div>
            <div className="md:w-1/2 p-4 relative z-10">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight" style={{ color: currentColors.primaryText }}>
                Reimagining <br /> Memories with AI
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: currentColors.primaryText }}>
                ECHO helps you capture, organize, and revisit life's precious moments through speech. Stay connected to your memories, effortlessly.
              </p>
            </div>
          </section>

          <motion.section id="how-it-works" className="py-24 md:py-32 px-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center" style={{ color: currentColors.primaryText }}>How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[{title: 'Capture', desc: 'Record memories by speaking naturally to ECHO.'}, {title: 'Organize', desc: 'Your memories are categorized and searchable.'}, {title: 'Revisit', desc: 'Listen back and relive stories anytime.'}].map((step, idx) => (
                  <div key={step.title} className="p-8 rounded-2xl text-center shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>{idx + 1}</div>
                    <h3 className="text-2xl font-bold mb-2" style={{ color: currentColors.primaryText }}>{step.title}</h3>
                    <p className="opacity-80 text-sm" style={{ color: currentColors.primaryText }}>{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section id="features" className="py-24 md:py-32 px-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
                <div className="h-10 w-10 rounded-lg mb-4" style={{ backgroundColor: currentColors.accentGold }} />
                <h3 className="text-xl font-bold mb-2">Secure On-Chain Memory & Logic</h3>
                <p className="opacity-80 text-sm">Short description of a core capability. Fully responsive with Tailwind utility classes.</p>
              </div>
              <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
                <div className="h-10 w-10 rounded-lg mb-4" style={{ backgroundColor: currentColors.accentGold }} />
                <h3 className="text-xl font-bold mb-2">Smart Memory Recall & Caregiver Anchoring</h3>
                <p className="opacity-80 text-sm">Short description of a core capability. Fully responsive with Tailwind utility classes.</p>
              </div>
              <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
                <div className="h-10 w-10 rounded-lg mb-4" style={{ backgroundColor: currentColors.accentGold }} />
                <h3 className="text-xl font-bold mb-2">Emotion & Behavior Detection</h3>
                <p className="opacity-80 text-sm">Short description of a core capability. Fully responsive with Tailwind utility classes.</p>
              </div>
              <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
                <div className="h-10 w-10 rounded-lg mb-4" style={{ backgroundColor: currentColors.accentGold }} />
                <h3 className="text-xl font-bold mb-2">Adaptive AI Reasoning & Empathetic Responses</h3>
                <p className="opacity-80 text-sm">Short description of a core capability. Fully responsive with Tailwind utility classes.</p>
              </div>
              <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
                <div className="h-10 w-10 rounded-lg mb-4" style={{ backgroundColor: currentColors.accentGold }} />
                <h3 className="text-xl font-bold mb-2">Real-Time Caregiver Alerts & Monitoring</h3>
                <p className="opacity-80 text-sm">Short description of a core capability. Fully responsive with Tailwind utility classes.</p>
              </div>
              <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
                <div className="h-10 w-10 rounded-lg mb-4" style={{ backgroundColor: currentColors.accentGold }} />
                <h3 className="text-xl font-bold mb-2">Modular, Extensible Architecture</h3>
                <p className="opacity-80 text-sm">Short description of a core capability. Fully responsive with Tailwind utility classes.</p>
              </div>
            </div>
          </motion.section>

          <motion.section id="stories" className="py-24 md:py-32 px-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center" style={{ color: currentColors.primaryText }}>Stories</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {["ECHO helped me remember my grandfather's stories.", "We revisit our travel memories together.", "Recording daily moments has been life-changing."].map((quote, i) => (
                  <div key={i} className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
                    <p className="text-sm leading-relaxed" style={{ color: currentColors.primaryText }}>
                      “{quote}”
                    </p>
                    <div className="mt-4 h-1 w-12 rounded" style={{ backgroundColor: currentColors.accentGold }} />
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section id="resources" className="py-24 md:py-32 px-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center" style={{ color: currentColors.primaryText, textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[{title: 'Getting Started', desc: 'Learn the basics of ECHO.'}, {title: 'Tips & Tricks', desc: 'Make the most of your memory journal.'}, {title: 'Support', desc: 'Need help? Start here.'}].map((res) => (
                  <a key={res.title} href="#" className="p-6 rounded-2xl shadow-lg block hover:opacity-90 transition" style={{ backgroundColor: currentColors.secondaryBg }}>
                    <h3 className="text-xl font-bold mb-2" style={{ color: currentColors.primaryText }}>{res.title}</h3>
                    <p className="opacity-80 text-sm" style={{ color: currentColors.primaryText }}>{res.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </motion.section>
        </main>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {renderModal()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
