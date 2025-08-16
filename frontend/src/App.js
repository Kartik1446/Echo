// src/App.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Constants
import { themes } from './constants/themes';
import { faqData } from './constants/faqData';
import { featuresData } from './constants/featuresData';

// Import All Page and Layout Components
import Navbar from './components/landing/Navbar';
import FAQItem from './components/landing/FAQItem';
import TeamPage from './components/team/TeamPage';
import LoginPage from './components/auth/LoginPage';
import ProfileSetupPage from './components/auth/ProfileSetupPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import SettingsPage from './components/settings/SettingsPage';
import CaregiverPage from './components/caregiver/CaregiverPage';

// Import All Modal Components
import RecordMemoryModal from './components/modals/RecordMemoryModal';
import AddMomentModal from './components/modals/AddMomentModal';
import RemindersModal from './components/modals/RemindersModal';
import LogoutConfirmModal from './components/modals/LogoutConfirmModal';
import ListenToEchoModal from './components/modals/ListenToEchoModal';
import MemoryJournalModal from './components/modals/MemoryJournalModal';
import AddWriteUpModal from './components/modals/AddWriteUpModal';

// Import Icons (Only those used directly in App.js)
import { Music, Image as ImageIcon, Video, FileText, Github, Lightbulb, PlayCircle, Figma, Film, Presentation as PresentationIcon } from 'lucide-react';

const App = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [theme, setTheme] = useState('dark');
    const [showLogin, setShowLogin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [user, setUser] = useState(null);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [showMomentModal, setShowMomentModal] = useState(false);
    const [showRemindersModal, setShowRemindersModal] = useState(false);
    const [showListenModal, setShowListenModal] = useState(false);
    const [showJournalModal, setShowJournalModal] = useState(false);
    const [showWriteUpModal, setShowWriteUpModal] = useState(false);
    const [currentPage, setCurrentPage] = useState('landing');
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isMicActive, setIsMicActive] = useState(false);
    const [reminders, setReminders] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);

    // Mock data for caregiver page
    const [patientStatus] = useState({
        status: 'Online',
        location: 'Home - 123 Memory Lane',
        glassesStatus: 'Connected',
        battery: 82,
    });
    const [alerts] = useState([
        { id: 1, type: 'sos', title: 'SOS Triggered', description: 'Patient may be in distress.', time: '2 min ago' },
        { id: 2, type: 'reminder', title: 'Missed Reminder', description: 'Patient missed "Take morning medication" reminder.', time: '1 hour ago' },
        { id: 3, type: 'reminder', title: 'Missed Reminder', description: 'Patient missed "Doctor\'s Appointment" reminder.', time: '3 hours ago' },
    ]);

    const addSpeechEntry = (title) => {
        const newSpeech = { id: Date.now(), type: 'speech', title: title, date: new Date().toISOString(), icon: <Music /> };
        setJournalEntries(prevEntries => [newSpeech, ...prevEntries]);
    };

    const addMomentEntry = (title, momentType) => {
        const newMoment = { id: Date.now(), type: 'moment', title: title, date: new Date().toISOString(), icon: momentType === 'Photo' ? <ImageIcon /> : <Video /> };
        setJournalEntries(prevEntries => [newMoment, ...prevEntries]);
    };

    const addWriteUpEntry = (title, content) => {
        const newWriteUp = { id: Date.now(), type: 'write-up', title: title, content: content, date: new Date().toISOString(), icon: <FileText /> };
        setJournalEntries(prevEntries => [newWriteUp, ...prevEntries]);
        setShowWriteUpModal(false);
    };

    const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    const currentColors = themes[theme];

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const isModalOpen = showLogin || (isAuthenticated && !isProfileComplete) || showRecordModal || showMomentModal || showRemindersModal || showLogoutModal || showListenModal || showJournalModal || showWriteUpModal;
        document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showLogin, isAuthenticated, isProfileComplete, showRecordModal, showMomentModal, showRemindersModal, showLogoutModal, showListenModal, showJournalModal, showWriteUpModal]);

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    const handleLoginSuccess = () => {
        setShowLogin(false);
        setIsAuthenticated(true);
        setIsProfileComplete(false);
    };

    const handleProfileComplete = (profileData) => {
        setUser({
            name: profileData.fullName,
            gender: profileData.gender,
            photo: profileData.profilePhoto,
            dob: '',
        });
        setIsProfileComplete(true);
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setIsProfileComplete(false);
        setUser(null);
        setShowLogoutModal(false);
        setCurrentPage('landing');
    };

    const handleUpdateUser = (updatedData) => {
        setUser(prevUser => ({ ...prevUser, ...updatedData }));
    };

    const handleAddSpeechClick = () => {
        setShowRecordModal(true);
        setIsMicActive(true);
    };

    const handleCloseRecordModal = () => {
        setShowRecordModal(false);
        setIsMicActive(false);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowLogin(false);
            setShowRecordModal(false);
            setIsMicActive(false);
            setShowMomentModal(false);
            setShowRemindersModal(false);
            setShowLogoutModal(false);
            setShowListenModal(false);
            setShowJournalModal(false);
            setShowWriteUpModal(false);
        }
    };

    const renderLandingPage = () => (
        <motion.div key="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col w-full min-h-screen">
            <Navbar theme={theme} toggleTheme={toggleTheme} onGetStartedClick={() => setShowLogin(true)} onTeamClick={() => setCurrentPage('team')} />
            <div className="pt-20">
                <section id="home" className="relative flex flex-col md:flex-row items-center justify-center py-24 md:py-32 px-6 text-center md:text-left min-h-screen-minus-nav">
                    <div className="md:w-1/2 p-4">
                        <h2 className={`text-5xl md:text-7xl font-extrabold mb-6 text-[${currentColors.primaryText}] leading-tight`}>Reimagining <br /> Memories with AI</h2>
                        <p className={`text-lg md:text-xl text-[${currentColors.primaryText}] max-w-2xl mx-auto mb-10`}>ECHO helps you capture, organize, and revisit life’s precious moments through speech. Stay connected to your memories, effortlessly.</p>
                        <button onClick={() => setShowLogin(true)} className={`px-10 py-4 bg-[${currentColors.accentGold}] hover:bg-[${currentColors.darkGold}] text-[${currentColors.secondaryText}] font-semibold rounded-lg shadow-lg transition duration-300 ease-in-out text-lg`}>Get Started</button>
                    </div>
                    <div className="md:w-1/2 p-4 mt-12 md:mt-0 flex justify-center">
                        <div className={`w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden flex items-center justify-center bg-[${currentColors.secondaryBg}] border-4 border-[${currentColors.accentGold}] shadow-2xl`}>
                            <span className={`text-center text-[${currentColors.primaryText}] text-xl`}>[Circular Animatic/Video Placeholder]</span>
                        </div>
                    </div>
                </section>
                <motion.section id="how-it-works" className={`py-24 md:py-32 px-6 bg-[${currentColors.secondaryBg}] text-center`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                    <h2 className={`text-5xl font-extrabold mb-6 text-[${currentColors.primaryText}]`}>How ECHO Works</h2>
                    <p className={`text-xl text-[${currentColors.primaryText}] mb-16 opacity-80`}>Simple steps to create lasting memory connections</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        <motion.div className={`relative bg-[${currentColors.primaryBg}] p-8 rounded-lg shadow-xl border border-[${currentColors.accentGold}]`}>
                            <span className={`absolute -top-5 -left-5 w-12 h-12 flex items-center justify-center bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] font-bold rounded-full text-2xl`}>1</span>
                            <h3 className={`text-3xl font-bold mb-4 text-[${currentColors.accentGold}]`}>Speak or Upload</h3>
                            <p className={`text-[${currentColors.primaryText}] leading-relaxed`}>Record a voice memory or upload an image, text, or video. Add details like dates, faces, places, and special moments.</p>
                        </motion.div>
                        <motion.div className={`relative bg-[${currentColors.primaryBg}] p-8 rounded-lg shadow-xl border border-[${currentColors.accentGold}]`}>
                            <span className={`absolute -top-5 -left-5 w-12 h-12 flex items-center justify-center bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] font-bold rounded-full text-2xl`}>2</span>
                            <h3 className={`text-3xl font-bold mb-4 text-[${currentColors.accentGold}]`}>ECHO Processes</h3>
                            <p className={`text-[${currentColors.primaryText}] leading-relaxed`}>Just connect the glasses via bluetooth.Our AI analyzes and anchors the memory, establishing context and relationships for future recall.</p>
                        </motion.div>
                        <motion.div className={`relative bg-[${currentColors.primaryBg}] p-8 rounded-lg shadow-xl border border-[${currentColors.accentGold}]`}>
                            <span className={`absolute -top-5 -left-5 w-12 h-12 flex items-center justify-center bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] font-bold rounded-full text-2xl`}>3</span>
                            <h3 className={`text-3xl font-bold mb-4 text-[${currentColors.accentGold}]`}>Gentle Reminders</h3>
                            <p className={`text-[${currentColors.primaryText}] leading-relaxed`}>Caregivers receive alerts and reminders, while patients get calm, empathetic responses when they need them.</p>
                        </motion.div>
                    </div>
                </motion.section>
                <motion.section id="features" className={`py-24 md:py-32 px-6 bg-[${currentColors.primaryBg}]`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
                    <div className="max-w-7xl mx-auto text-center">
                        <h2 className={`text-5xl font-extrabold mb-6 text-[${currentColors.primaryText}]`}>ECHO's Core Features</h2>
                        <p className={`text-xl text-[${currentColors.primaryText}] opacity-80 max-w-4xl mx-auto mb-20`}>A suite of tools designed with empathy to support memory, connection, and daily life for patients and caregivers.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
                            {featuresData.map((feature, index) => (
                                <motion.div key={index} className={`bg-[${currentColors.secondaryBg}] p-8 rounded-2xl shadow-xl border border-transparent hover:border-[${currentColors.glassBorder}] transition-colors duration-300 flex flex-col`} variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } } }}>
                                    <div className="flex items-center mb-6">
                                        <div className={`flex items-center justify-center w-16 h-16 rounded-lg bg-[${currentColors.primaryBg}] text-[${currentColors.accentGold}] mr-5`}>{feature.icon}</div>
                                        <span className={`text-6xl font-bold text-[${currentColors.primaryText}] opacity-20`}>{String(index + 1).padStart(2, '0')}</span>
                                    </div>
                                    <h3 className={`text-2xl font-bold mb-4 text-[${currentColors.accentGold}]`}>{feature.title}</h3>
                                    <p className={`text-[${currentColors.primaryText}] opacity-80 text-base leading-relaxed flex-grow`}>{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>
                <motion.section id="prototype-handling" className={`py-24 md:py-32 px-6 bg-[${currentColors.secondaryBg}] text-center`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                    <h2 className={`text-5xl font-extrabold mb-6 text-[${currentColors.primaryText}]`}>Prototype Handling</h2>
                    <p className={`text-xl text-[${currentColors.primaryText}] max-w-3xl mx-auto mb-16 opacity-80`}>Explore the interactive prototypes and how ECHO's features come to life.</p>
                    <div className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl overflow-hidden border-2" style={{ borderColor: currentColors.accentGold }}>
                        <video
                            className="w-full h-full object-cover"
                            src="/echo-demo.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </motion.section>
                <motion.section id="where-echo-fits" className={`py-24 md:py-32 px-6 bg-[${currentColors.primaryBg}] text-center`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                    <h2 className={`text-5xl font-extrabold mb-6 text-[${currentColors.primaryText}]`}>Where ECHO Fits</h2>
                    <p className={`text-xl text-[${currentColors.primaryText}] max-w-3xl mx-auto mb-16 opacity-80`}>Understand how ECHO seamlessly integrates into daily life, providing support for both patients and caregivers.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-7xl mx-auto">
                        <motion.div className={`bg-[${currentColors.secondaryBg}] p-10 rounded-lg shadow-xl border border-[${currentColors.accentGold}]`}>
                            <h3 className={`text-3xl font-bold mb-4 text-[${currentColors.accentGold}]`}>For Patients</h3>
                            <p className={`text-[${currentColors.primaryText}] leading-relaxed`}>ECHO offers personalized memory prompts, conversational support, and a sense of connection.</p>
                        </motion.div>
                        <motion.div className={`bg-[${currentColors.secondaryBg}] p-10 rounded-lg shadow-xl border border-[${currentColors.accentGold}]`}>
                            <h3 className={`text-3xl font-bold mb-4 text-[${currentColors.accentGold}]`}>For Caregivers</h3>
                            <p className={`text-[${currentColors.primaryText}] leading-relaxed`}>Simplify daily routines, access memory logs, and gain insights into patient well-being.</p>
                        </motion.div>
                    </div>
                </motion.section>
                <motion.section id="stories" className={`py-24 md:py-32 px-6 bg-[${currentColors.secondaryBg}] text-center`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                    <h2 className={`text-5xl font-extrabold mb-6 text-[${currentColors.primaryText}]`}>Stories of Connection</h2>
                    <p className={`text-xl text-[${currentColors.primaryText}] mb-16 opacity-80`}>Real experiences from families using ECHO</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto">
                        <motion.div className={`bg-[${currentColors.primaryBg}] p-8 rounded-xl shadow-xl border border-[${currentColors.accentGold}] text-left flex flex-col justify-between`}>
                            <p className={`text-[${currentColors.primaryText}] text-base mb-6 italic leading-relaxed`}>"ECHO helped my mother remember my name. She hadn't called me by my first name in months. It was a small thing, but it felt like having her back."</p>
                            <div className="flex items-center mt-auto">
                                <div className={`w-12 h-12 flex items-center justify-center bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] font-bold rounded-full text-xl mr-4`}>A</div>
                                <div><p className={`font-semibold text-[${currentColors.primaryText}]`}>Ananya Sharma</p><p className={`text-sm text-[${currentColors.primaryText}] opacity-80`}>Designer & Primary Caregiver</p></div>
                            </div>
                        </motion.div>
                        <motion.div className={`bg-[${currentColors.primaryBg}] p-8 rounded-xl shadow-xl border border-[${currentColors.accentGold}] text-left flex flex-col justify-between`}>
                            <p className={`text-[${currentColors.primaryText}] text-base mb-6 italic leading-relaxed`}>"The gentle voice reminders help my cousin with her daily tasks. ECHO doesn't just provide information—it provides comfort."</p>
                            <div className="flex items-center mt-auto">
                                <div className={`w-12 h-12 flex items-center justify-center bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] font-bold rounded-full text-xl mr-4`}>R</div>
                                <div><p className={`font-semibold text-[${currentColors.primaryText}]`}>Raj Patel</p><p className={`text-sm text-[${currentColors.primaryText}] opacity-80`}>Son & Technology Advocate</p></div>
                            </div>
                        </motion.div>
                        <motion.div className={`bg-[${currentColors.primaryBg}] p-8 rounded-xl shadow-xl border border-[${currentColors.accentGold}] text-left flex flex-col justify-between`}>
                            <p className={`text-[${currentColors.primaryText}] text-base mb-6 italic leading-relaxed`}>"As someone with early-stage Alzheimer's, ECHO gives me confidence. I know I can ask about anyone or anywhere, and get a calm, helpful answer."</p>
                            <div className="flex items-center mt-auto">
                                <div className={`w-12 h-12 flex items-center justify-center bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] font-bold rounded-full text-xl mr-4`}>M</div>
                                <div><p className={`font-semibold text-[${currentColors.primaryText}]`}>Meena K.</p><p className={`text-sm text-[${currentColors.primaryText}] opacity-80`}>ECHO User</p></div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>
                <motion.section id="resources" className={`py-24 md:py-32 px-6 bg-[${currentColors.secondaryBg}] text-center`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                    <h2 className={`text-5xl font-extrabold mb-12 uppercase text-[${currentColors.primaryText}]`}>Resources</h2>
                    <div className="flex flex-col items-center justify-center gap-6">
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                            <a href="https://github.com/Satyabrat2005/Echo" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-3 bg-[${currentColors.primaryBg}] text-[${currentColors.primaryText}] hover:bg-[${currentColors.accentGold}] hover:text-[${currentColors.secondaryText}] font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-md transform hover:scale-105`}><Github className="w-5 h-5" /><span>GitHub</span></a>
                            <a href="#" className={`inline-flex items-center justify-center gap-3 bg-[${currentColors.primaryBg}] text-[${currentColors.primaryText}] hover:bg-[${currentColors.accentGold}] hover:text-[${currentColors.secondaryText}] font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-md transform hover:scale-105`}><Lightbulb className="w-5 h-5" /><span>Core Idea</span></a>
                            <a href="#" className={`inline-flex items-center justify-center gap-3 bg-[${currentColors.primaryBg}] text-[${currentColors.primaryText}] hover:bg-[${currentColors.accentGold}] hover:text-[${currentColors.secondaryText}] font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-md transform hover:scale-105`}><PlayCircle className="w-5 h-5" /><span>Watch Demo</span></a>
                            <a href="https://www.figma.com/design/v6ZafqBMxTN2OVcaaG2yEJ/ECHO-UI?node-id=0-1&t=ghgX9xhIHeBkepiB-1" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center justify-center gap-3 bg-[${currentColors.primaryBg}] text-[${currentColors.primaryText}] hover:bg-[${currentColors.accentGold}] hover:text-[${currentColors.secondaryText}] font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-md transform hover:scale-105`}><Figma className="w-5 h-5" /><span>Figma Link</span></a>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                            <a href="#" className={`inline-flex items-center justify-center gap-3 bg-[${currentColors.primaryBg}] text-[${currentColors.primaryText}] hover:bg-[${currentColors.accentGold}] hover:text-[${currentColors.secondaryText}] font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-md transform hover:scale-105`}><Film className="w-5 h-5" /><span>Watch Documentary</span></a>
                            <a href="#" className={`inline-flex items-center justify-center gap-3 bg-[${currentColors.primaryBg}] text-[${currentColors.primaryText}] hover:bg-[${currentColors.accentGold}] hover:text-[${currentColors.secondaryText}] font-semibold px-8 py-4 rounded-full transition-all duration-300 shadow-md transform hover:scale-105`}><PresentationIcon className="w-5 h-5" /><span>Presentation</span></a>
                        </div>
                    </div>
                </motion.section>
                <motion.section id="faq" className={`py-24 md:py-32 px-6 bg-[${currentColors.primaryBg}]`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
                    <div className="max-w-5xl mx-auto text-center">
                        <h2 className={`text-5xl font-extrabold mb-16 text-[${currentColors.primaryText}]`}>Frequently Asked Questions</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                            {faqData.map((faq, index) => <FAQItem key={index} theme={theme} question={faq.question} answer={faq.answer} />)}
                        </div>
                    </div>
                </motion.section>
                <footer className={`bg-[${currentColors.secondaryBg}] py-20 px-6 text-[${currentColors.primaryText}]`}>
                    <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <div className="flex items-center mb-4">
                                <img src="Echo-logo.png" alt="ECHO Logo" className="w-12 h-12 mr-3 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/48x48/513524/F9E4C8?text=Logo"; }} />
                                <span className={`text-3xl font-bold text-[${currentColors.accentGold}]`}>ECHO</span>
                            </div>
                            <p className="text-sm leading-relaxed">Empowering families affected by Alzheimer's through compassionate AI technology. Creating connections that last, one memory at a time.</p>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className={`text-lg font-semibold mb-5 text-[${currentColors.accentGold}]`}>Product</h3>
                            <ul className="space-y-3 text-sm"><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#features">Features</a></li><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#how-it-works">How It Works</a></li><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#stories">Stories</a></li></ul>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className={`text-lg font-semibold mb-5 text-[${currentColors.accentGold}]`}>Support</h3>
                            <ul className="space-y-3 text-sm"><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#help-center">Help Center</a></li><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#caregiver-guide">Caregiver Guide</a></li><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#developer-api">Developer API</a></li><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#community">Community</a></li></ul>
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className={`text-lg font-semibold mb-5 text-[${currentColors.accentGold}]`}>Company</h3>
                            <ul className="space-y-3 text-sm"><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#about-us">About Us</a></li><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#careers">Careers</a></li><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#privacy-policy">Privacy Policy</a></li><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#terms-of-service">Terms of Service</a></li><li className={`hover:text-[${currentColors.accentGold}] transition-colors duration-300`}><a href="#accessibility">Accessibility</a></li></ul>
                        </div>
                    </div>
                    <div className={`border-t border-[${currentColors.warmBronze}] mt-16 pt-8 text-center text-sm`}><p>&copy; 2025 Memory Assistant. Made with ❤️ for families everywhere.</p></div>
                </footer>
            </div>
        </motion.div>
    );


    const renderContent = () => {
        // ... this function needs to be defined or called
        if (isAuthenticated && isProfileComplete) {
            // ... authenticated flow
        } else if (currentPage === 'team') {
            return <TeamPage theme={theme} onBack={() => setCurrentPage('landing')} />;
        } else {
            return renderLandingPage();
        }
    };


    return (
        <div className={`relative min-h-screen bg-[${currentColors.primaryBg}] text-[${currentColors.primaryText}] overflow-hidden flex flex-col items-center justify-center`}>
            <div className="absolute inset-0 z-0 opacity-50">
                <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-[${currentColors.glow}] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob`}></div>
                <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-[${currentColors.accentGold}] rounded-full opacity-20 blur-xl animate-float-two`} style={{ bottom: '20%', right: '10%' }}></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[${currentColors.darkGold}] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000`}></div>
            </div>
            <AnimatePresence mode="wait">
                {showSplash ? (
                    <motion.div key="splash-screen" className="flex items-center justify-center h-screen w-full relative z-10" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0, scale: [1, 1.05, 1], filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'], transition: { duration: 1.5, ease: "easeInOut", opacity: { delay: 0, duration: 1.5 }, y: { delay: 0, duration: 1.5 }, scale: { delay: 0.5, duration: 1 }, filter: { delay: 0.5, duration: 1 } } }} exit={{ opacity: 0, y: -100, scale: 0.8, transition: { delay: 0.5, duration: 0.8, ease: "easeOut" } }}>
                        <img src="Echo-logo.png" alt="ECHO Logo" className="w-24 h-24 md:w-32 md:h-32 mr-4 object-contain" onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/128x128/513524/F9E4C8?text=Logo"; }} />
                        <h1 className={`text-6xl md:text-8xl font-bold text-[${currentColors.accentGold}] tracking-wide`}>ECHO</h1>
                    </motion.div>
                ) : (
                    renderContent()
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showLogin && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleBackdropClick}><LoginPage theme={theme} onClose={() => setShowLogin(false)} onLoginSuccess={handleLoginSuccess} /></div>)}
                {isAuthenticated && !isProfileComplete && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleBackdropClick}><ProfileSetupPage theme={theme} onProfileComplete={handleProfileComplete} /></div>)}
                {showRecordModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleBackdropClick}><RecordMemoryModal theme={theme} onClose={handleCloseRecordModal} onSaveSpeech={addSpeechEntry} /></div>)}
                {showMomentModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleBackdropClick}><AddMomentModal theme={theme} onClose={() => setShowMomentModal(false)} onSaveMoment={addMomentEntry} /></div>)}
                {showRemindersModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleBackdropClick}><RemindersModal theme={theme} onClose={() => setShowRemindersModal(false)} reminders={reminders} setReminders={setReminders} /></div>)}
                {showLogoutModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleBackdropClick}><LogoutConfirmModal theme={theme} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} /></div>)}
                {showListenModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleBackdropClick}><ListenToEchoModal theme={theme} onClose={() => setShowListenModal(false)} /></div>)}
                {showJournalModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleBackdropClick}><MemoryJournalModal theme={theme} onClose={() => setShowJournalModal(false)} journalEntries={journalEntries} onAddNewWriteUp={() => setShowWriteUpModal(true)} /></div>)}
                {showWriteUpModal && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleBackdropClick}><AddWriteUpModal theme={theme} onClose={() => setShowWriteUpModal(false)} onSaveWriteUp={addWriteUpEntry} /></div>)}
            </AnimatePresence>
        </div>
    );
};

export default App;
