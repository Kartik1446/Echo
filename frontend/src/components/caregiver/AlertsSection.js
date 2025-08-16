import React from 'react';
import { AlertTriangle, Bell, CheckCircle } from 'lucide-react';
import { themes } from '../../constants/themes';

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
    <div className={`bg-[${currentColors.secondaryBg}] p-8 rounded-2xl shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 text-[${currentColors.primaryText}] border-b border-white/10 pb-4`}>Alerts & Notifications</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {alerts.length > 0 ? alerts.map(alert => (
          <div key={alert.id} className={`bg-[${currentColors.primaryBg}] p-4 rounded-lg flex items-start gap-4`}>
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

export default AlertsSection;
