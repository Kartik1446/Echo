import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin } from 'lucide-react';
import { themes } from '../../constants/themes';

const TeamMemberCard = ({ theme, member }) => {
  const currentColors = themes[theme];
  return (
    <motion.div
      className={`bg-[${currentColors.secondaryBg}] rounded-2xl p-6 text-center shadow-xl border-2 border-transparent hover:border-[${currentColors.accentGold}] transition-all duration-300 group`}
      whileHover={{ y: -10 }}
    >
      <div className="w-40 h-40 mx-auto rounded-full overflow-hidden mb-6 border-4" style={{ borderColor: currentColors.darkGold }}>
        <img
          src={member.photoUrl}
          alt={member.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x300/2C2623/F9E4C8?text=Photo"; }}
        />
      </div>
      <h3 className={`text-2xl font-bold text-[${currentColors.primaryText}]`}>{member.name}</h3>
      <p className={`text-lg text-[${currentColors.accentGold}] font-medium mb-6`}>{member.role}</p>
      <div className="flex justify-center items-center space-x-5">
        <a href={member.githubUrl} target="_blank" rel="noopener noreferrer" className={`text-[${currentColors.primaryText}] opacity-70 hover:opacity-100 hover:text-[${currentColors.accentGold}] transition-colors`}>
          <Github size={28} />
        </a>
        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className={`text-[${currentColors.primaryText}] opacity-70 hover:opacity-100 hover:text-[${currentColors.accentGold}] transition-colors`}>
          <Linkedin size={28} />
        </a>
      </div>
    </motion.div>
  );
};

export default TeamMemberCard;
