import React from 'react';
import { Wifi, WifiOff, Battery, MapPin } from 'lucide-react';
import { themes } from '../../constants/themes';

const PatientStatusSection = ({ theme, user, patientStatus }) => {
  const currentColors = themes[theme];
  const isOnline = patientStatus.status === 'Online';
  const isConnected = patientStatus.glassesStatus === 'Connected';

  return (
    <div className={`bg-[${currentColors.secondaryBg}] p-8 rounded-2xl shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 text-[${currentColors.primaryText}] border-b border-white/10 pb-4`}>Patient Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Photo and Name */}
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

        {/* Right Side: Device Status and Location */}
        <div className="space-y-6">
          <div className={`bg-[${currentColors.primaryBg}] p-4 rounded-lg flex justify-between items-center`}>
            <div className="flex items-center gap-4">
              {isConnected ? <Wifi size={24} className="text-green-400" /> : <WifiOff size={24} className="text-red-400" />}
              <div>
                <p className="font-semibold">Glasses Status</p>
                <p className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>{patientStatus.glassesStatus}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Battery size={24} className={patientStatus.battery > 20 ? "text-green-400" : "text-red-400"} />
              <span className="font-semibold">{patientStatus.battery}%</span>
            </div>
          </div>
          <div className={`bg-[${currentColors.primaryBg}] p-4 rounded-lg flex items-center gap-4`}>
            <MapPin size={24} className={`text-[${currentColors.accentGold}]`} />
            <div>
              <p className="font-semibold">Last Known Location</p>
              <p className="text-sm opacity-70">{patientStatus.location}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Map Placeholder */}
      <div className="mt-8">
        <div className={`w-full h-64 bg-[${currentColors.primaryBg}] rounded-lg flex items-center justify-center`}>
          <p className="text-lg opacity-50">Map Placeholder</p>
        </div>
      </div>
    </div>
  );
};

export default PatientStatusSection;
