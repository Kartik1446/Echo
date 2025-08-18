import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, ChevronLeft } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';
import satyabratImg from './satyabrat.jpeg';
import kartikImg from './kartik.jpeg';
import ashutoshImg from './ashutosh.jpeg';
import archanaImg from './archana.jpeg';

const teamMembers = [
  {
    name: 'Satyabrat Sahu',
    role: 'ML Engineer',
    photoUrl: satyabratImg,
    githubUrl: 'https://github.com/Satyabrat2005',
    linkedinUrl: 'https://www.linkedin.com/in/satyabrat-sahu-638726324/',
  },
  {
    name: 'Kartik Bhardwaj',
    role: 'ML Engineer',
    photoUrl: kartikImg,
    githubUrl: 'https://github.com/Kartik1446',
    linkedinUrl: 'https://www.linkedin.com/in/kartik1446',
  },
  {
    name: 'Ashutosh Rath',
    role: 'IOT Squad',
    photoUrl: ashutoshImg,
    githubUrl: 'https://github.com/GitGudScrubss',
    linkedinUrl: 'https://www.linkedin.com/in/ashutosh-rath-904687300/',
  },
  {
    name: 'Archana Gupta',
    role: 'UI/UX Designer',
    photoUrl: archanaImg,
    githubUrl: 'https://github.com/Archana15-codes',
    linkedinUrl: 'https://www.linkedin.com/in/archana-gupta2006',
  },
];

const TeamMemberCard = ({ theme, member }) => {
  const currentColors = themes[theme];
  return (
    <motion.div
      className="rounded-2xl p-6 text-center shadow-xl border-2 border-transparent transition-all duration-300 group"
      style={{ backgroundColor: currentColors.secondaryBg, borderColor: 'transparent' }}
      whileHover={{ y: -10 }}
    >
      <div className="w-40 h-40 mx-auto rounded-full overflow-hidden mb-6 border-4" style={{ borderColor: currentColors.darkGold }}>
        <img
          src={member.photoUrl}
          alt={member.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x300/2C2623/F9E4C8?text=Photo"; }}
        />
      </div>
      <h3 className="text-2xl font-bold" style={{ color: currentColors.primaryText }}>{member.name}</h3>
      <p className="text-lg font-medium mb-6" style={{ color: currentColors.accentGold }}>{member.role}</p>
      <div className="flex justify-center items-center space-x-5">
        <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-colors" style={{ color: currentColors.primaryText }}>
          <Github size={28} />
        </a>
        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-colors" style={{ color: currentColors.primaryText }}>
          <Linkedin size={28} />
        </a>
      </div>
    </motion.div>
  );
};

const TeamPage = ({ theme = 'dark', onBack }) => {
  const currentColors = themes[theme];
  return (
    <motion.div
      key="team-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen pt-24 md:pt-32 px-6"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 mb-10"
          style={{ color: currentColors.primaryText }}
          whileHover={{ x: -5 }}
        >
          <ChevronLeft size={24} />
          <span className="text-lg font-semibold">Back to Home</span>
        </motion.button>

        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-16" style={{ color: currentColors.primaryText }}>Meet the Team Behind ECHO</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.15 }}
              >
                <TeamMemberCard theme={theme} member={member} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TeamPage;


