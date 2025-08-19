import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Battery, MapPin, AlertTriangle, Bell, CheckCircle, ChevronLeft } from 'lucide-react';
import { themes } from '../styles/tailwindStyles';

const PatientStatusSection = ({ theme, user, patientStatus }) => {
  const currentColors = themes[theme];
  const isOnline = patientStatus.status === 'Online';
  const isConnected = patientStatus.glassesStatus === 'Connected';

  return (
    <div className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
      <h2 className="text-2xl font-bold mb-6 border-b pb-4" style={{ color: currentColors.primaryText, borderColor: 'rgba(255,255,255,0.1)' }}>Patient Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex items-center gap-6">
          <img
            src={user?.photo || 'https://placehold.co/128x128/513524/F9E4C8?text=User'}
            alt="Patient"
            className="w-32 h-32 rounded-full object-cover border-4"
            style={{ borderColor: currentColors.accentGold }}
          />
          <div>
            <h3 className="text-3xl font-bold">{user?.name || 'Patient Name'}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`text-sm font-semibold ${isOnline ? 'text-green-400' : 'text-red-400'}`}>{patientStatus.status}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg flex justify-between items-center" style={{ backgroundColor: currentColors.primaryBg }}>
            <div className="flex items-center gap-4">
              {isConnected ? <Wifi size={24} className="text-green-400" /> : <WifiOff size={24} className="text-red-400" />}
              <div>
                <p className="font-semibold">Glasses Status</p>
                <p className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>{patientStatus.glassesStatus}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Battery size={24} className={patientStatus.battery > 20 ? 'text-green-400' : 'text-red-400'} />
              <span className="font-semibold">{patientStatus.battery}%</span>
            </div>
          </div>
          <div className="p-4 rounded-lg flex items-center gap-4" style={{ backgroundColor: currentColors.primaryBg }}>
            <MapPin size={24} style={{ color: currentColors.accentGold }} />
            <div>
              <p className="font-semibold">Last Known Location</p>
              <p className="text-sm opacity-70">{patientStatus.location}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="w-full h-64 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentColors.primaryBg }}>
          <p className="text-lg opacity-50">Map Placeholder</p>
        </div>
      </div>
    </div>
  );
};

const AlertsSection = ({ theme, alerts }) => {
  const currentColors = themes[theme];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'sos':
        return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'reminder':
        return <Bell className="w-6 h-6 text-yellow-400" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-400" />;
    }
  };

  return (
    <div className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: currentColors.secondaryBg }}>
      <h2 className="text-2xl font-bold mb-6 border-b pb-4" style={{ color: currentColors.primaryText, borderColor: 'rgba(255,255,255,0.1)' }}>Alerts & Notifications</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert.id} className="p-4 rounded-lg flex items-start gap-4" style={{ backgroundColor: currentColors.primaryBg }}>
            <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>
            <div className="flex-grow">
              <p className="font-semibold">{alert.title}</p>
              <p className="text-sm opacity-70">{alert.description}</p>
            </div>
            <div className="text-xs opacity-50 flex-shrink-0">{alert.time}</div>
          </div>
        )) : (
          <div className="text-center py-10 opacity-60">
            <CheckCircle size={48} className="mx-auto mb-4" />
            <p className="font-semibold">No new alerts.</p>
            <p className="text-sm">Everything seems to be in order.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CaregiverPage = ({ theme = 'dark', onBack, user, patientStatus, alerts }) => {
  const currentColors = themes[theme];
  const mainContentPadding = 'px-8 py-8';

  return (
    <motion.div
      key="caregiver-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen"
      style={{ backgroundColor: currentColors.dashboardBg, color: currentColors.primaryText }}
    >
      <div className={`max-w-7xl mx-auto ${mainContentPadding}`}>
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-5xl font-bold">Caregiver Dashboard</h1>
          <motion.button
            onClick={onBack}
            className="flex items-center gap-2 text-lg font-semibold transition-colors"
            style={{ color: currentColors.primaryText }}
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


