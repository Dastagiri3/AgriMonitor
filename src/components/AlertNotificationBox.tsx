import React, { useState } from 'react';
import { FarmAlert } from '../types';
import { ShieldAlert, Info, BellRing, Eye, EyeOff, Trash2, CheckCheck, AlertCircle } from 'lucide-react';

interface AlertNotificationBoxProps {
  alerts: FarmAlert[];
  onDismissAlert: (id: string) => void;
  onClearAllAlerts: () => void;
}

export const AlertNotificationBox: React.FC<AlertNotificationBoxProps> = ({
  alerts,
  onDismissAlert,
  onClearAllAlerts
}) => {
  const unreadAlerts = alerts.filter(a => a.status === 'unread');
  const [showAll, setShowAll] = useState(false);

  // Filter based on whether user wants all alerts or just unread ones
  const filteredAlerts = showAll ? alerts : unreadAlerts;

  const getAlertStyles = (type: FarmAlert['alert_type']) => {
    switch (type) {
      case 'low_moisture':
        return {
          bg: 'bg-red-950/20 border-red-900 text-red-200',
          accent: 'border-red-500 text-red-400 bg-red-950/65',
          label: 'CRITICAL MOISTURE'
        };
      case 'high_temperature':
        return {
          bg: 'bg-amber-950/20 border-amber-900 text-amber-200',
          accent: 'border-amber-500 text-amber-400 bg-amber-950/65',
          label: 'CRITICAL TEMPERATURE'
        };
      case 'heavy_rain_prediction':
        return {
          bg: 'bg-blue-950/20 border-blue-900 text-blue-200',
          accent: 'border-blue-500 text-blue-400 bg-blue-950/65',
          label: 'CLIMATE FORECAST ALERT'
        };
      default:
        return {
          bg: 'bg-emerald-950/20 border-emerald-900 text-emerald-200',
          accent: 'border-emerald-500 text-emerald-400 bg-emerald-950/65',
          label: 'SYSTEM HUB DIAGNOSTIC'
        };
    }
  };

  return (
    <div className="bg-[#021d10] border border-emerald-900 rounded-2xl p-5 shadow-sm hover:shadow-emerald-950 transition duration-300">
      
      {/* Alert Container title & actions */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-900">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <BellRing className="h-5 w-5 text-emerald-400" />
            {unreadAlerts.length > 0 && (
              <span id="unread-alert-dot" className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight font-sans leading-none">
              Alerts & Critical Notifications
            </h3>
            <p className="text-[11px] text-emerald-400 font-mono mt-1 uppercase">
              {unreadAlerts.length} Active System Warning{unreadAlerts.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Action Toggle controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1.5 hover:text-white bg-emerald-950 border border-emerald-900 hover:border-emerald-800 text-[10px] font-mono px-2 py-1 rounded-xl transition cursor-pointer text-emerald-400"
            title="Toggle read and unread messages filter"
          >
            {showAll ? (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Unread Only
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" /> Show Archive ({alerts.length})
              </>
            )}
          </button>
          
          {alerts.length > 0 && (
            <button
              onClick={onClearAllAlerts}
              className="flex items-center gap-1 hover:text-white bg-emerald-950 hover:bg-red-950 border border-emerald-900 hover:border-red-900 text-[10px] font-mono px-2 py-1 rounded-xl transition cursor-pointer text-emerald-400"
              title="Clear all local alerts database records"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-400" /> Clear Logs
            </button>
          )}
        </div>
      </div>

      {/* Alert warning cards list */}
      <div className="pt-4 space-y-3.5">
        
        {filteredAlerts.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center text-emerald-500">
            <CheckCheck className="h-9 w-9 text-emerald-600 mb-2" />
            <p className="text-xs font-mono font-medium">All telemetry targets normalized.</p>
            <p className="text-[10px] text-emerald-600 mt-1">No pending notifications triggered.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-emerald-900">
            {filteredAlerts.map((alert) => {
              const styles = getAlertStyles(alert.alert_type);
              return (
                <div 
                  key={alert.id} 
                  id={`alert-card-${alert.id}`}
                  className={`border-l-4 rounded-xl p-3.5 transition duration-150 relative group/card flex justify-between gap-3 ${styles.bg} ${styles.accent}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono tracking-widest uppercase font-black bg-emerald-950/40 px-1 py-0.2 rounded leading-none border border-emerald-900/45">
                        {styles.label}
                      </span>
                      <span className="text-[9px] text-emerald-500 font-mono">
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed font-sans text-white/95 pr-2">
                      {alert.message}
                    </p>
                  </div>

                  {/* Mark as read individual button */}
                  {alert.status === 'unread' && (
                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="shrink-0 text-[10px] bg-emerald-950 hover:bg-emerald-800 border border-emerald-950 hover:border-emerald-700/80 p-2.5 rounded-xl cursor-pointer transition flex items-center justify-center"
                      title="Mark notification as read"
                    >
                      <Eye className="h-3.5 w-3.5 text-emerald-400 group-hover/card:scale-110" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
