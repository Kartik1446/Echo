import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from './landing/Navbar';
import TeamPage from './landing/TeamPage';
import { themes } from './styles/tailwindStyles';
import './App.css';
import MagnetLines from './shared/MagnetLines';

const App = () => {
  const [theme, setTheme] = useState('dark');
  const [currentPage, setCurrentPage] = useState('landing');
  const currentColors = themes[theme];

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  if (currentPage === 'team') {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 0 }}>
          <MagnetLines rows={12} columns={20} lineColor="#efefef22" style={{ width: '100vw', height: '100vh' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 1, color: currentColors.primaryText }}>
          <Navbar theme={theme} toggleTheme={toggleTheme} onTeamClick={() => setCurrentPage('team')} />
          <TeamPage theme={theme} onBack={() => setCurrentPage('landing')} />
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
        <Navbar theme={theme} toggleTheme={toggleTheme} onGetStartedClick={() => {}} onTeamClick={() => setCurrentPage('team')} />
        <main className="pt-20">
          <section id="home" className="relative flex flex-col md:flex-row items-center justify-center py-24 md:py-32 px-6 text-center md:text-left">
            <div className="md:w-1/2 p-4">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight" style={{ color: currentColors.primaryText }}>
                Reimagining <br /> Memories with AI
              </h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: currentColors.primaryText }}>
                ECHO helps you capture, organize, and revisit life’s precious moments through speech. Stay connected to your memories, effortlessly.
              </p>
              <button className="px-8 py-3 rounded-lg font-semibold shadow-lg transition" style={{ backgroundColor: currentColors.accentGold, color: currentColors.secondaryText }}>
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
    </div>
  );
};

export default App;
