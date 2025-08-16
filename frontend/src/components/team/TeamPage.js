import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { themes } from '../../constants/themes';
import { teamMembers } from '../../constants/teamData';
import TeamMemberCard from './TeamMemberCard';

const TeamPage = ({ theme, onBack }) => {
  const currentColors = themes[theme];
  return (
    <motion.div
      key="team-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full min-h-screen bg-[${currentColors.primaryBg}] pt-24 md:pt-32 px-6`}
    >
      <div className="max-w-7xl mx-auto">
        <motion.button
          onClick={onBack}
          className={`flex items-center gap-2 mb-10 text-[${currentColors.primaryText}] hover:text-[${currentColors.accentGold}] transition-colors`}
          whileHover={{ x: -5 }}
        >
          <ChevronLeft size={24} />
          <span className="text-lg font-semibold">Back to Home</span>
        </motion.button>
        
        <div className="text-center">
          <h1 className={`text-5xl md:text-6xl font-extrabold mb-16 text-[${currentColors.primaryText}]`}>Meet the Team Behind ECHO</h1>
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
