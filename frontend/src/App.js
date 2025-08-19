import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './landing/Navbar';
import TeamPage from './landing/TeamPage';
import { themes } from './styles/tailwindStyles';
import './App.css';
import MagnetLines from './shared/MagnetLines';
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
        <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 0 }}>
          <MagnetLines rows={12} columns={20} lineColor="#efefef22" style={{ width: '100vw', height: '100vh' }} />
        </div>
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
        <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 0 }}>
          <MagnetLines rows={12} columns={20} lineColor="#efefef22" style={{ width: '100vw', height: '100vh' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, color: currentColors.primaryText }}>
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
      <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 0 }}>
        <MagnetLines rows={12} columns={20} lineColor="#efefef22" style={{ width: '100vw', height: '100vh' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, color: currentColors.primaryText }}>
        <Navbar theme={theme} toggleTheme={toggleTheme} onGetStartedClick={handleGetStarted} onTeamClick={() => setCurrentPage('team')} isLoggedIn={isLoggedIn} currentPage={currentPage} />
        <main className="pt-20">
          <section id="home" className="relative flex flex-col md:flex-row items-center justify-center py-24 md:py-32 px-6 text-center md:text-left">
            <div className="md:w-1/2 p-4">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight" style={{ color: currentColors.primaryText }}>
                Reimagining <br /> Memories with AI
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: currentColors.primaryText }}>
                ECHO helps you capture, organize, and revisit life's precious moments through speech. Stay connected to your memories, effortlessly.
              </p>
              <button 
                onClick={handleGetStarted}
                className="px-8 py-3 rounded-lg font-semibold shadow-lg transition transform hover:scale-105" 
                style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}
              >
                Get Started
              </button>
            </div>
            <div className="md:w-1/2 p-4 mt-12 md:mt-0 flex justify-center">
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden flex items-center justify-center border-4 shadow-2xl" style={{ backgroundColor: currentColors.secondaryBg, borderColor: currentColors.accentGold }}>
                <span className="text-center text-xl" style={{ color: currentColors.primaryText }}>
                  [Circular Animatic/Video Placeholder]
                </span>
              </div>
            </div>
          </section>

          <motion.section id="features" className="py-24 md:py-32 px-6" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
                  <div className="h-10 w-10 rounded-lg mb-4" style={{ backgroundColor: currentColors.accentGold }} />
                  <h3 className="text-xl font-bold mb-2">Feature {i}</h3>
                  <p className="opacity-80 text-sm">Short description of a core capability. Fully responsive with Tailwind utility classes.</p>
                </div>
              ))}
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
