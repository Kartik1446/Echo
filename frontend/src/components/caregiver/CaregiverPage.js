import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { themes } from '../../constants/themes';
import PatientStatusSection from './PatientStatusSection';
import AlertsSection from './AlertsSection';

const CaregiverPage = ({ theme, onBack, user, patientStatus, alerts }) => {
  const currentColors = themes[theme];
  const mainContentPadding = 'px-8 py-8';

  return (
    <motion.div
      key="caregiver-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full min-h-screen bg-[${currentColors.dashboardBg}] text-[${currentColors.primaryText}]`}
    >
      <div className={`max-w-7xl mx-auto ${mainContentPadding}`}>
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-5xl font-bold">Caregiver Dashboard</h1>
          <motion.button
            onClick={onBack}
            className={`flex items-center gap-2 text-lg font-semibold text-[${currentColors.primaryText}] hover:text-[${currentColors.accentGold}] transition-colors`}
            whileHover={{ x: -5 }}
          >
            <ChevronLeft size={24} />
            <span>Back to Dashboard</span>
          </motion.button>
        </div>

        <div className="flex flex-col gap-12">
          <PatientStatusSection theme={theme} user={user} patientStatus={patientStatus} />
          <AlertsSection theme={theme} alerts={alerts} />
        </div>
      </div>
    </motion.div>
  );
};

export default CaregiverPage;
