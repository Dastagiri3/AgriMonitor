import React from 'react';
import { UserProfile } from '../types';
import { Sprout, LogOut, User, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onLogout: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationInterval: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  isSimulating,
  onToggleSimulation,
  simulationInterval
}) => {
  return (
    <header className="bg-emerald-950 text-emerald-50 border-b border-emerald-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-500 text-emerald-950 p-2 rounded-xl shadow-inner animate-pulse">
              <Sprout className="h-6 w-6" id="logo-icon" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white font-sans flex items-center gap-1.5 leading-none">
                Smart Agriculture <span className="text-[10px] bg-emerald-600/60 text-emerald-100 px-1.5 py-0.5 rounded font-mono font-normal">SIMULATOR</span>
              </h1>
              <p className="text-[11px] text-emerald-400 font-mono tracking-wider mt-0.5">IOT TELEMETRY HUB</p>
            </div>
          </div>

          {/* Active Sim State & Profile Details */}
          <div className="flex items-center space-x-4">
            {/* Simulation Status Tag */}
            <div className="hidden sm:flex items-center bg-emerald-900/60 border border-emerald-800 rounded-full px-3 py-1 text-xs">
              <span className="relative flex h-2 w-2 mr-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              </span>
              <span className="text-emerald-300 font-mono">
                Auto-Telemetry: <strong className={isSimulating ? 'text-amber-300' : 'text-emerald-400'}>{isSimulating ? `Active (${simulationInterval}s)` : 'Stopped'}</strong>
              </span>
              <button
                onClick={onToggleSimulation}
                className="ml-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-200 hover:text-white px-2 py-0.5 rounded text-[10px] font-sans font-medium transition cursor-pointer flex items-center gap-1"
                title="Toggle automatical 30-second simulation cycle"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isSimulating ? 'animate-spin' : ''}`} />
                {isSimulating ? 'Mute' : 'Start'}
              </button>
            </div>

            {/* Profile Pill */}
            <div className="flex items-center bg-emerald-900 border border-emerald-800/80 rounded-xl px-3 py-1.5 space-x-2">
              <div className="bg-emerald-800 rounded-full p-1 text-emerald-300">
                {user.role === 'admin' ? (
                  <ShieldAlert className="h-4 w-4 text-emerald-400" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold leading-tight text-emerald-100 flex items-center gap-1">
                  {user.name}
                  {user.role === 'admin' && (
                    <span className="bg-red-500/20 text-red-300 text-[9px] px-1 py-0.2 rounded border border-red-500/30">ADMIN</span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 lowercase leading-none">{user.email}</div>
              </div>
            </div>

            {/* Logout CTA */}
            <button
              onClick={onLogout}
              id="logout-btn"
              className="bg-emerald-900 hover:bg-red-950 hover:text-red-200 border border-emerald-800 hover:border-red-900 text-emerald-300 p-2.5 rounded-xl transition cursor-pointer"
              title="Logout session"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
