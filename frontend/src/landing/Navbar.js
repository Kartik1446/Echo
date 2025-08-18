import React from 'react';
import { themes } from '../styles/tailwindStyles';

const Navbar = ({ theme = 'dark', toggleTheme, onGetStartedClick, onTeamClick }) => {
  const currentColors = themes[theme];
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50`} style={{ backgroundColor: currentColors.primaryBg, opacity: 0.9, backdropFilter: 'blur(4px)' }}>
      <div className="container mx-auto flex justify-between items-center h-20 px-6">
        <div className="flex items-center flex-shrink-0">
          <img
            src="/Echo-logo.png"
            alt="ECHO Logo"
            className="w-12 h-12 mr-3 object-contain rounded-full"
            onError={(e) => { e.target.onerror = null; e.target.src = `${process.env.PUBLIC_URL}/logo192.png`; }}
          />
          <span style={{ color: currentColors.accentGold }} className="text-3xl font-bold">ECHO</span>
        </div>
        <div className="hidden md:flex space-x-10 items-center">
          <a href="#home" style={{ color: currentColors.primaryText }} className="hover:opacity-80 transition-colors duration-300">Home</a>
          <a href="#how-it-works" style={{ color: currentColors.primaryText }} className="hover:opacity-80 transition-colors duration-300">How It Works</a>
          <a href="#features" style={{ color: currentColors.primaryText }} className="hover:opacity-80 transition-colors duration-300">Features</a>
          <a href="#stories" style={{ color: currentColors.primaryText }} className="hover:opacity-80 transition-colors duration-300">Stories</a>
          <a href="#resources" style={{ color: currentColors.primaryText }} className="hover:opacity-80 transition-colors duration-300">Resources</a>
          <a href="#team" onClick={(e) => { e.preventDefault(); onTeamClick && onTeamClick(); }} style={{ color: currentColors.primaryText }} className="hover:opacity-80 transition-colors duration-300">Team</a>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors duration-300 focus:outline-none"
            style={{ backgroundColor: currentColors.secondaryBg, color: currentColors.primaryText }}
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h1M3 12H2m15.325-4.275l-.707-.707M6.382 17.618l-.707-.707M18.364 18.364l-.707-.707M6.343 6.343l-.707-.707M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
        <div className="md:hidden">
          <button className="focus:outline-none" style={{ color: currentColors.primaryText }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


