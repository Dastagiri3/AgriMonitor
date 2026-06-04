import React, { useState } from 'react';
import { UserProfile } from '../types';
import { getUsers, saveAlerts, getAlerts } from '../lib/agricultureDb';
import { Sprout, Lock, Mail, User, ShieldAlert, Sparkles, RefreshCw, KeyRound, CheckCircle } from 'lucide-react';

interface AuthenticationProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const Authentication: React.FC<AuthenticationProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'farmer' | 'admin'>('farmer');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Logins
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please supply both your registered email and passwords.');
      return;
    }

    // Read credentials database
    const rawCreds = localStorage.getItem('agri_credentials');
    const credentials = rawCreds ? JSON.parse(rawCreds) : {};
    const registeredUser = credentials[email.toLowerCase().trim()];

    if (registeredUser && registeredUser.password === password) {
      // Create user profile
      const userList = getUsers();
      let profile = userList.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      
      if (!profile) {
        // Fallback or mismatch safeguard
        profile = {
          id: registeredUser.id || 'usr-' + Math.random().toString(36).substr(2, 9),
          name: registeredUser.name,
          email: email.toLowerCase().trim(),
          role: registeredUser.role || 'farmer',
          created_at: new Date().toISOString()
        };
      }

      setSuccessMsg(`Welcome back, ${profile.name}! Booting dashboard...`);
      setTimeout(() => {
        onLoginSuccess(profile!);
      }, 800);
    } else {
      setErrorMsg('Invalid email or password. Hint: Use demo login badges for instant access!');
    }
  };

  // Handle Signup
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !email || !password) {
      setErrorMsg('All fields are requested for farm registration.');
      return;
    }

    const emailKey = email.toLowerCase().trim();
    const rawCreds = localStorage.getItem('agri_credentials');
    const credentials = rawCreds ? JSON.parse(rawCreds) : {};

    if (credentials[emailKey]) {
      setErrorMsg('This email address is already registered on our node.');
      return;
    }

    // Register inside mock DB
    const newUserId = 'usr-registered-' + Math.random().toString(36).substr(2, 9);
    credentials[emailKey] = {
      password: password,
      role: role,
      name: name,
      id: newUserId
    };
    localStorage.setItem('agri_credentials', JSON.stringify(credentials));

    // Save profile
    const users = getUsers();
    const newProfile: UserProfile = {
      id: newUserId,
      name,
      email: emailKey,
      role,
      created_at: new Date().toISOString()
    };
    users.push(newProfile);
    localStorage.setItem('agri_users', JSON.stringify(users));

    // Add telemetry log about user joining
    const rawAlerts = localStorage.getItem('agri_alerts');
    const alertsList = rawAlerts ? JSON.parse(rawAlerts) : [];
    alertsList.unshift({
      id: 'alert-' + Math.random().toString(36).substr(2, 9),
      alert_type: 'normal',
      message: `System node: New ${role} profile "${name}" registered successfully.`,
      status: 'unread',
      created_at: new Date().toISOString()
    });
    localStorage.setItem('agri_alerts', JSON.stringify(alertsList));

    setSuccessMsg('Registration completed! Redirecting to login session...');
    setTimeout(() => {
      setEmail(emailKey);
      setPassword(password);
      setView('login');
      setSuccessMsg('');
    }, 1200);
  };

  // Handle Password Reset
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please specify your registered agricultural email address.');
      return;
    }

    const emailKey = email.toLowerCase().trim();
    const rawCreds = localStorage.getItem('agri_credentials');
    const credentials = rawCreds ? JSON.parse(rawCreds) : {};

    if (!credentials[emailKey]) {
      setErrorMsg('That email is not assigned to any active agricultural node.');
      return;
    }

    setSuccessMsg(`Diagnostic recovery email triggered to ${emailKey}! Simulated reset link sent.`);
    setTimeout(() => {
      setView('login');
      setSuccessMsg('');
    }, 3000);
  };

  // Quick Account Login Action
  const triggerDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
    setSuccessMsg('Injecting demo credentials...');
    
    setTimeout(() => {
      // Simulate click login
      const rawCreds = localStorage.getItem('agri_credentials');
      const credentials = rawCreds ? JSON.parse(rawCreds) : {};
      const registeredUser = credentials[demoEmail];
      const userList = getUsers();
      let profile = userList.find(u => u.email.toLowerCase() === demoEmail.toLowerCase().trim());
      
      if (profile && registeredUser) {
        setSuccessMsg(`Authorizing session for ${profile.name}...`);
        setTimeout(() => {
          onLoginSuccess(profile!);
        }, 500);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-emerald-950 font-sans text-emerald-100">
      
      {/* Editorial Splash Left Banner */}
      <div 
        className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-cover bg-center relative overflow-hidden border-r border-emerald-900"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(2, 44, 25, 0.93), rgba(2, 16, 10, 0.98)), url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=1200')`
        }}
      >
        <div className="flex items-center space-x-2.5">
          <div className="bg-emerald-500 text-emerald-950 p-1.5 rounded-lg">
            <Sprout className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-wider font-mono text-emerald-400 text-xs">AGRI-METRIC NODE 7</span>
        </div>

        <div className="my-auto space-y-4">
          <h2 className="text-3xl font-display font-medium tracking-tight text-white">
            Cultivate Growth with Telemetry Insights
          </h2>
          <p className="text-sm text-emerald-300 leading-relaxed max-w-sm">
            Simulate precision farming telemetry. Access live microclimate reports, map soil compositions, verify dynamic crop recommendations, and manage agricultural alerts.
          </p>

          <div className="pt-6 border-t border-emerald-900 grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <p className="text-emerald-500 font-bold">SOIL BAROMETER</p>
              <p className="text-emerald-200 mt-0.5">10-100% Moisture Span</p>
            </div>
            <div>
              <p className="text-emerald-500 font-bold">SENSORY POOLS</p>
              <p className="text-emerald-200 mt-0.5">30-Second Polling Cycle</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-emerald-500 font-mono">
          Smart Agriculture Software Suite v1.0 • No physical hardware required.
        </p>
      </div>

      {/* Auth Fields Section */}
      <div className="flex flex-col justify-center p-6 sm:p-12 lg:col-span-7 bg-[#02170c] relative">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          <div className="text-left">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-900/40 rounded-2xl border border-emerald-800/50 text-emerald-400 mb-4 lg:hidden">
              <Sprout className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight text-white">
              {view === 'login' && 'Farm Control Login'}
              {view === 'register' && 'Setup Agriculture Node'}
              {view === 'forgot' && 'Simulate Account Recovery'}
            </h3>
            <p className="text-xs text-emerald-400 mt-1">
              {view === 'login' && 'Sow seeds of predictive analytics. Sign back into your hub.'}
              {view === 'register' && 'Establish credentials to monitor and override IoT parameters.'}
              {view === 'forgot' && 'Authenticate yourself to recover credentials.'}
            </p>
          </div>

          {/* Alerts / Error feedback box */}
          {errorMsg && (
            <div id="auth-error" className="bg-red-950/50 border border-red-900/60 text-red-200 p-3.5 rounded-xl text-xs flex items-start space-x-2.5">
              <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div id="auth-success" className="bg-emerald-900/30 border border-emerald-600/40 text-emerald-200 p-3.5 rounded-xl text-xs flex items-start space-x-2.5">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Interactive Form */}
          <form className="space-y-4" onSubmit={view === 'login' ? handleLogin : view === 'register' ? handleRegister : handleResetPassword}>
            
            {view === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-emerald-300 font-mono tracking-wide uppercase mb-1.5">
                  Full Farmer / Registrar Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-emerald-500" />
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-emerald-950/40 border border-emerald-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-emerald-300 font-mono tracking-wide uppercase mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-emerald-500" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm.com"
                  className="w-full bg-emerald-950/40 border border-emerald-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {view !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-emerald-300 font-mono tracking-wide uppercase">
                    Account Security Password
                  </label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-[11px] text-emerald-400 hover:text-white transition font-mono cursor-pointer"
                    >
                      Forgot code?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-emerald-500" />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-emerald-950/40 border border-emerald-800/80 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            {view === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-emerald-300 font-mono tracking-wide uppercase mb-1.5">
                  Assigned Workspace Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    className={`border py-2 px-3 rounded-xl text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      role === 'farmer' 
                        ? 'bg-emerald-900/60 border-emerald-500 text-white' 
                        : 'bg-emerald-950/20 border-emerald-800/80 text-emerald-400 hover:border-emerald-700'
                    }`}
                  >
                    <Sprout className="h-3.5 w-3.5" />
                    Farmer (Operator)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`border py-2 px-3 rounded-xl text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      role === 'admin' 
                        ? 'bg-emerald-900/60 border-red-500 text-white' 
                        : 'bg-emerald-950/20 border-emerald-800/80 text-emerald-400 hover:border-emerald-700'
                    }`}
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Administrator
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              id="submit-auth"
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-emerald-950 font-bold py-2.5 px-4 rounded-xl text-sm transition mt-2 cursor-pointer shadow-md select-none"
            >
              {view === 'login' && 'Authorize Dashboard'}
              {view === 'register' && 'Complete Node Setup'}
              {view === 'forgot' && 'Trigger Diagnostic Link'}
            </button>
          </form>

          {/* Toggle Views Footer */}
          <div className="text-center font-mono text-xs text-emerald-400/80 pt-2">
            {view === 'login' ? (
              <p>
                First time monitoring?{' '}
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="text-emerald-300 hover:text-white underline cursor-pointer font-bold leading-none"
                >
                  Create Farmer Profile
                </button>
              </p>
            ) : (
              <p>
                Already have farm credentials?{' '}
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-emerald-300 hover:text-white underline cursor-pointer font-bold leading-none"
                >
                  Return to login
                </button>
              </p>
            )}
          </div>

          {/* Fast Demonstration Quick Accounts Panel */}
          <div className="pt-6 border-t border-emerald-900/60">
            <p className="text-[10px] text-emerald-400 font-mono tracking-wider font-bold mb-3 flex items-center gap-1">
              <KeyRound className="h-3 w-3 text-emerald-500" />
              QUICK DEMO ACCS (PRD ROLES REQ)
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-left">
              {/* Farmer Demo Badge */}
              <button
                type="button"
                onClick={() => triggerDemoAccount('gurudastagiri3@gmail.com', 'password')}
                className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/80 hover:border-emerald-700/80 rounded-xl p-3 text-left transition duration-150 cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between font-bold text-white mb-0.5">
                  <span>Guru Dastagiri</span>
                  <span className="text-[9px] font-mono text-emerald-400 border border-emerald-800 px-1 py-0.2 rounded uppercase bg-emerald-900/40">FARMER</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-400 truncate">gurudastagiri3@gmail.com</div>
                <div className="font-mono text-[9px] text-emerald-500 mt-1">pass: password</div>
              </button>

              {/* Admin Demo Badge */}
              <button
                type="button"
                onClick={() => triggerDemoAccount('admin@smartfarm.com', 'admin')}
                className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/80 hover:border-emerald-700/80 rounded-xl p-3 text-left transition duration-150 cursor-pointer text-xs"
              >
                <div className="flex items-center justify-between font-bold text-white mb-0.5">
                  <span>Admin Desk</span>
                  <span className="text-[9px] font-mono text-red-300 border border-red-900/40 px-1 py-0.2 rounded uppercase bg-red-950/40">ADMIN</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-400 truncate">admin@smartfarm.com</div>
                <div className="font-mono text-[9px] text-red-400 mt-1 text-right">pass: admin</div>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
