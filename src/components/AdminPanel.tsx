import React, { useState, useEffect } from 'react';
import { UserProfile, SensorReading } from '../types';
import { getUsers, saveSensorReadings } from '../lib/agricultureDb';
import { Shield, Users, RefreshCw, Trash2, Sprout, Database, HardDrive, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  currentAdmin: UserProfile;
  sensorReadings: SensorReading[];
  onWipeSensorsHistory: () => void;
  onRefreshData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentAdmin,
  sensorReadings,
  onWipeSensorsHistory,
  onRefreshData
}) => {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [successNotice, setSuccessNotice] = useState('');

  const loadUsers = () => {
    const allUsers = getUsers();
    setUsersList(allUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you absolutely sure you want to remove this user profile from the agricultural registries?')) {
      // Don't delete the current admin
      if (userId === currentAdmin.id) {
        alert('You cannot delete your own active administrator profile!');
        return;
      }

      // Read users
      const rawUsers = localStorage.getItem('agri_users');
      const users: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
      const updatedUsers = users.filter(u => u.id !== userId);
      localStorage.setItem('agri_users', JSON.stringify(updatedUsers));

      // Also remove login credential entries
      const targetUser = users.find(u => u.id === userId);
      if (targetUser) {
        const rawCreds = localStorage.getItem('agri_credentials');
        const creds = rawCreds ? JSON.parse(rawCreds) : {};
        delete creds[targetUser.email.toLowerCase().trim()];
        localStorage.setItem('agri_credentials', JSON.stringify(creds));
      }

      setSuccessNotice(`Removed user profile successfully.`);
      loadUsers();
      onRefreshData();

      setTimeout(() => setSuccessNotice(''), 2500);
    }
  };

  return (
    <div className="bg-[#021d10] border border-emerald-950 rounded-2xl p-5 shadow-sm space-y-6">
      
      {/* Admin Title Block */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-900">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight font-sans flex items-center gap-1.5 leading-none">
            <Shield className="h-4.5 w-4.5 text-red-400" />
            Global Administrator Control Center
          </h3>
          <p className="text-[11px] text-emerald-400 font-mono mt-1 uppercase">ADMINISTRATIVE ANALYTICS & DIRECTORIES</p>
        </div>
        <span className="bg-red-950/40 text-red-300 border border-red-900/30 text-[10px] font-mono px-2 py-0.5 rounded leading-none">
          SYSTEM LEVEL ACCESS
        </span>
      </div>

      {successNotice && (
        <div className="bg-emerald-900/30 border border-emerald-600/40 text-emerald-100 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Grid summarizing platform status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        
        {/* Users total counts card */}
        <div className="bg-[#02170c] border border-emerald-900/40 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-emerald-900/40 text-emerald-300 rounded-lg">
            <Users className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[9px] text-emerald-500 uppercase leading-none">REGISTRARS</p>
            <p className="text-lg font-bold text-white mt-1">{usersList.length} Active</p>
          </div>
        </div>

        {/* Telemetry records length card */}
        <div className="bg-[#02170c] border border-emerald-900/40 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-emerald-900/40 text-emerald-300 rounded-lg">
            <Database className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[9px] text-emerald-500 uppercase leading-none">DATABASE LOGS</p>
            <p className="text-lg font-bold text-white mt-1">{sensorReadings.length} Telemetries</p>
          </div>
        </div>

        {/* Platform security card */}
        <div className="bg-[#02170c] border border-emerald-900/40 rounded-xl p-3.5 flex items-center space-x-3">
          <div className="p-2 bg-red-950/40 text-red-400 rounded-lg border border-red-950">
            <HardDrive className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-[9px] text-red-400 uppercase leading-none">SYSTEM BULK</p>
            <button
              onClick={() => {
                if (confirm('Wipe simulated sensor histories database? All data points back to 24 hours will clear. Recommendations logs will reset.')) {
                  onWipeSensorsHistory();
                  setSuccessNotice('Simulated tables flushed successfully.');
                  setTimeout(() => setSuccessNotice(''), 2000);
                }
              }}
              className="text-[10px] font-sans font-bold text-red-300 hover:text-red-200 hover:underline transition mt-0.5 select-none block text-left"
            >
              Wipe Database Log Table
            </button>
          </div>
        </div>

      </div>

      {/* Directory list of all farmers and registrars */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <p className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-emerald-500" />
            Registry Users Directories
          </p>
          <button 
            onClick={loadUsers} 
            className="text-emerald-400 hover:text-white transition cursor-pointer"
            title="Refresh Users Directory"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>

        <div className="border border-emerald-900/60 rounded-xl overflow-hidden bg-[#02170c] overflow-x-auto">
          <table className="w-full text-left font-mono text-[10.5px] border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-emerald-950 border-b border-emerald-900 text-emerald-300">
                <th className="p-3">INDEX ID</th>
                <th className="p-3">PROFILE NAME</th>
                <th className="p-3">EMAIL ADDRESS</th>
                <th className="p-3">REGISTERED AT</th>
                <th className="p-3">MEMBER ROLE</th>
                <th className="p-3 text-right">CONTROLS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950">
              {usersList.map((usr) => (
                <tr key={usr.id} className="hover:bg-emerald-950/30 text-emerald-100 transition">
                  <td className="p-3 text-emerald-400 truncate max-w-[80px]">{usr.id}</td>
                  <td className="p-3 font-semibold text-white">{usr.name}</td>
                  <td className="p-3 tracking-tight">{usr.email}</td>
                  <td className="p-3 text-emerald-500 text-[10px]">{new Date(usr.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${
                      usr.role === 'admin' 
                        ? 'bg-red-950/40 border-red-900/65 text-red-300' 
                        : 'bg-emerald-900/50 border-emerald-800 text-emerald-300'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {usr.id === currentAdmin.id ? (
                      <span className="text-[9px] text-emerald-600 block pl-2 pr-2">Self active</span>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(usr.id)}
                        className="bg-emerald-950 hover:bg-red-950 border border-emerald-900 hover:border-red-900 text-emerald-400 hover:text-red-300 p-1.5 rounded transition cursor-pointer inline-flex items-center"
                        title="Delete profile entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
