import React, { useState } from 'react';
import { Smartphone, Battery } from 'lucide-react';
import { themes } from '../../constants/themes';

const DeviceSettingsSection = ({ theme }) => {
  const currentColors = themes[theme];
  const [isPaired, setIsPaired] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(78);

  return (
    <div className={`bg-[${currentColors.secondaryBg}] p-8 rounded-2xl shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 text-[${currentColors.primaryText}]`}>Device Settings</h2>
      <div className={`bg-[${currentColors.primaryBg}] p-6 rounded-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Smartphone size={28} className={`text-[${currentColors.accentGold}]`} />
            <div>
              <p className="font-semibold text-lg">Smart Glasses</p>
              <p className={`text-sm opacity-70 ${isPaired ? 'text-green-400' : 'text-red-400'}`}>
                {isPaired ? 'Paired & Connected' : 'Not Paired'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPaired(!isPaired)}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${isPaired ? `bg-red-600/20 text-red-400 hover:bg-red-600/40` : `bg-[${currentColors.accentGold}] text-[${currentColors.secondaryText}] hover:bg-[${currentColors.darkGold}]`}`}
          >
            {isPaired ? 'Unpair' : 'Pair'}
          </button>
        </div>
        {isPaired && (
          <div className="mt-6">
            <label className="text-sm font-medium opacity-80 mb-2 flex items-center justify-between">
              <span>Battery</span>
              <span className="flex items-center gap-2"><Battery /> {batteryLevel}%</span>
            </label>
            <div className={`w-full bg-[${currentColors.secondaryBg}] rounded-full h-2.5`}>
              <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${batteryLevel}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceSettingsSection;
