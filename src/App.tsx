import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, SensorReading, CropRecommendation, FarmAlert, WeatherData } from './types';
import { Header } from './components/Header';
import { Authentication } from './components/Authentication';
import { MetricCard } from './components/MetricCard';
import { WeatherWidget } from './components/WeatherWidget';
import { CropRecommendationCard } from './components/CropRecommendationCard';
import { AlertNotificationBox } from './components/AlertNotificationBox';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { AdminPanel } from './components/AdminPanel';
import { LocationOption, AGRICULTURAL_LOCATIONS } from './lib/weatherService';
import { 
  getUsers, 
  getSession, 
  setSession, 
  getSensorReadings, 
  getRecommendations, 
  getAlerts, 
  createSensorReading, 
  clearAlerts, 
  dismissAlert,
  addAlert
} from './lib/agricultureDb';

// Lucide Icons
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Settings, 
  RefreshCw,
  Sliders,
  Play,
  Cpu
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeLocation, setActiveLocation] = useState<LocationOption>(AGRICULTURAL_LOCATIONS[0]);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);

  // Database core state
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [recommendations, setRecommendations] = useState<CropRecommendation[]>([]);
  const [alerts, setAlerts] = useState<FarmAlert[]>([]);

  // Simulation parameters
  const [simMode, setSimMode] = useState<'manual' | 'auto'>('manual');
  const [simTemp, setSimTemp] = useState<number>(29);
  const [simHumidity, setSimHumidity] = useState<number>(55);
  const [simMoisture, setSimMoisture] = useState<number>(45);
  const [isSimulating, setIsSimulating] = useState(false);
  const [toastQueue, setToastQueue] = useState<{ id: string; message: string; type: string }[]>([]);

  // Active view toggle between operator dashboard, or stats, or settings/about panels helper
  const [activeTab, setActiveTab] = useState<'hub' | 'admin'>('hub');

  // Trigger loading initial database layers
  const refreshDatabaseLogs = () => {
    const readingsRaw = getSensorReadings();
    setSensorReadings(readingsRaw);

    const recsRaw = getRecommendations();
    setRecommendations(recsRaw);

    const alertsRaw = getAlerts();
    setAlerts(alertsRaw);
  };

  // Check login session on startup
  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser(session);
    }
    refreshDatabaseLogs();
  }, []);

  // Sync simulation sliders with initial weather once loaded
  useEffect(() => {
    if (currentWeather) {
      setSimTemp(currentWeather.temperature);
      setSimHumidity(currentWeather.humidity);
    }
  }, [currentWeather]);

  // Toast helper triggers
  const addToast = (message: string, type = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToastQueue(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToastQueue(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Monitor auto simulation loop
  const simulationTimer = useRef<NodeJS.Timeout | null>(null);

  const triggerSingleSimulationStep = () => {
    // Generate organic walking numbers centered slightly on regional averages
    const baseTemp = currentWeather?.temperature || 28;
    const baseHum = currentWeather?.humidity || 55;
    const rainProb = currentWeather?.rain_probability || 10;

    // Small random drifts
    const newTemp = Number(Math.min(45, Math.max(15, simTemp + (Math.random() * 3 - 1.5))).toFixed(1));
    const newHum = Number(Math.min(95, Math.max(25, simHumidity + (Math.random() * 6 - 3))).toFixed(1));
    
    // Soil moisture slowly drains depending on temperature, spikes if raining
    let moistureDrift = -1.2; // naturally dries
    if (rainProb >= 70) {
      moistureDrift = 8.5; // heavy rain adds water
    } else if (newTemp > 38) {
      moistureDrift = -2.5; // quick evaporation
    }
    const newMoisture = Number(Math.min(100, Math.max(8, simMoisture + moistureDrift + (Math.random() * 2 - 1))).toFixed(1));

    // Update state variables so sliders match nicely
    setSimTemp(newTemp);
    setSimHumidity(newHum);
    setSimMoisture(newMoisture);

    // Commit telemetry read to database list!
    const entry = createSensorReading(newTemp, newHum, newMoisture, rainProb);
    refreshDatabaseLogs();

    // Check if new critical alert arose
    if (newMoisture < 20) {
      addToast(`Alert: Critic low soil moisture (${newMoisture}%). Irrigation required!`, 'warning');
    }
    if (newTemp > 40) {
      addToast(`Alert: Extreme high thermal stress (${newTemp}°C). Evaporation critical.`, 'warning');
    }
  };

  useEffect(() => {
    if (isSimulating) {
      // Periodic ticker: every 30 seconds as requested in Module 3. We use 10-seconds to keep the demo pacing highly interactive if they wish, but conform fully to 30s. Let's make it 30 seconds by default.
      simulationTimer.current = setInterval(() => {
        triggerSingleSimulationStep();
      }, 30000);
    } else {
      if (simulationTimer.current) {
        clearInterval(simulationTimer.current);
      }
    }

    return () => {
      if (simulationTimer.current) {
        clearInterval(simulationTimer.current);
      }
    };
  }, [isSimulating, simTemp, simHumidity, simMoisture, currentWeather]);

  // Handle manually publishing overrides
  const handlePublishManualTelemetry = (e: React.FormEvent) => {
    e.preventDefault();
    const rainProb = currentWeather?.rain_probability || 20;
    createSensorReading(simTemp, simHumidity, simMoisture, rainProb);
    refreshDatabaseLogs();
    addToast('Published manual agricultural telemetry record to tables.', 'success');
  };

  // Handles overall location updates
  const handleLocationChange = (loc: LocationOption, weather: WeatherData) => {
    setActiveLocation(loc);
    setCurrentWeather(weather);
  };

  const latestReading: SensorReading = sensorReadings[sensorReadings.length - 1] || {
    id: 'fallback-latest',
    temperature: 28.5,
    humidity: 55,
    soil_moisture: 42,
    timestamp: new Date().toISOString()
  };

  // Mark single alerts as read
  const handleDismissAlert = (id: string) => {
    dismissAlert(id);
    refreshDatabaseLogs();
  };

  // Flush alerts list
  const handleClearAlerts = () => {
    clearAlerts();
    refreshDatabaseLogs();
    addToast('Cleared agricultural alert database records.', 'info');
  };

  // Admin database wipes
  const handleWipeSensorsHistory = () => {
    localStorage.removeItem('agri_sensor_readings');
    localStorage.removeItem('agri_recommendations');
    localStorage.removeItem('smart_agri_initialized');
    refreshDatabaseLogs();
    addToast('Simulated telemetry database flushed successfully.', 'info');
  };

  // Auth exit sessions
  const handleLogout = () => {
    setSession(null);
    setCurrentUser(null);
    setIsSimulating(false);
  };

  if (!currentUser) {
    return <Authentication onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // Define thresholds colors dynamic badges
  const getMoistureBadgeMeta = (val: number) => {
    if (val < 20) return { label: 'CRITICAL DRYNESS', color: 'text-red-400 bg-red-950/40 border-red-900', statusColor: 'bg-red-500' };
    if (val < 45) return { label: 'MODERATE HUMIDITY', color: 'text-amber-400 bg-amber-950/40 border-amber-900', statusColor: 'bg-amber-400' };
    return { label: 'WELL IRRIGATED', color: 'text-emerald-400 bg-emerald-900/60 border-emerald-500/30', statusColor: 'bg-emerald-400' };
  };

  const getTempBadgeMeta = (val: number) => {
    if (val > 40) return { label: 'HEATWAVE STRESS', color: 'text-red-400 bg-red-950/40 border-red-900', statusColor: 'bg-red-500' };
    if (val < 18) return { label: 'CHILLY COOLDOWN', color: 'text-blue-400 bg-blue-950/40 border-blue-900', statusColor: 'bg-blue-400' };
    return { label: 'HEAL CLIMATE', color: 'text-emerald-400 bg-emerald-900/60 border-emerald-500/30', statusColor: 'bg-emerald-400' };
  };

  const moistureBadge = getMoistureBadgeMeta(latestReading.soil_moisture);
  const tempBadge = getTempBadgeMeta(latestReading.temperature);

  return (
    <div className="bg-[#01140a] min-h-screen text-slate-100 flex flex-col font-sans antialiased pb-12 selection:bg-emerald-500 selection:text-emerald-950">
      
      {/* Absolute floating toast notification queue */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        {toastQueue.map((toast) => (
          <div 
            key={toast.id} 
            className={`p-4 rounded-xl shadow-2xl border flex items-start space-x-2.5 pointer-events-auto animate-bounce transition-all ${
              toast.type === 'warning' 
                ? 'bg-red-950 border-red-800 text-red-200' 
                : toast.type === 'success' 
                  ? 'bg-emerald-900 border-emerald-700 text-emerald-100'
                  : 'bg-emerald-950 border-emerald-800 text-emerald-100'
            }`}
          >
            <Cpu className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-xs font-medium font-sans">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Main Top Header Navigation */}
      <Header 
        user={currentUser} 
        onLogout={handleLogout} 
        isSimulating={isSimulating}
        onToggleSimulation={() => {
          setIsSimulating(!isSimulating);
          addToast(isSimulating ? 'Auto telemetry stream paused.' : 'Telemetry streaming started. Tick every 30 seconds.');
        }}
        simulationInterval={30}
      />

      {/* Primary body view content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-grow space-y-6">
        
        {/* Workspace views list selector (Farmers get standard, Admin gets role view options) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#021d10] border border-emerald-900 p-4 rounded-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-mono uppercase font-bold">
              ROLE: {currentUser.role}
            </span>
            <p className="text-xs font-mono text-emerald-400">
              ID Profile: <strong className="text-white">{currentUser.name}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-sans">
            <button
              onClick={() => setActiveTab('hub')}
              className={`px-4 py-2 rounded-xl border transition cursor-pointer font-medium ${
                activeTab === 'hub' 
                  ? 'bg-emerald-500 border-emerald-500 text-emerald-950 shadow-md font-bold' 
                  : 'bg-emerald-950 border-emerald-900 text-emerald-300 hover:text-white'
              }`}
            >
              Agriculture Telemetry Dashboard
            </button>
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl border transition cursor-pointer font-medium flex items-center gap-1.5 ${
                  activeTab === 'admin' 
                    ? 'bg-red-500 border-red-500 text-white shadow-md font-bold' 
                    : 'bg-emerald-950 border-emerald-900 text-emerald-300 hover:text-white'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                Administrator Core
              </button>
            )}
          </div>
        </div>

        {activeTab === 'admin' && currentUser.role === 'admin' ? (
          <AdminPanel 
            currentAdmin={currentUser}
            sensorReadings={sensorReadings}
            onWipeSensorsHistory={handleWipeSensorsHistory}
            onRefreshData={refreshDatabaseLogs}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT AREA: Telemetry grids, Weather, Overrides, Charts */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Agricultural Sensors simulation sliders / control panel */}
              <div className="bg-[#021d10] border border-emerald-900 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-900 gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight font-sans flex items-center gap-1.5 leading-none">
                      <Sliders className="h-4.5 w-4.5 text-emerald-400" />
                      Field Simulation & IoT Node Controllers
                    </h3>
                    <p className="text-[11px] text-emerald-400 font-mono mt-1 uppercase">SIMULATION OVERRIDES (MODULE 3)</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSimTemp(29.5);
                        setSimHumidity(61);
                        setSimMoisture(82);
                        addToast('Telemetry sliders reset to default standard rice conditions.');
                      }}
                      className="text-[10px] font-mono text-emerald-400 hover:text-white bg-emerald-950 border border-emerald-900 hover:border-emerald-800 transition cursor-pointer py-1 px-2.5 rounded"
                    >
                      Presets Core
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePublishManualTelemetry} className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Temperature slider control */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 flex items-center gap-1">
                        <Thermometer className="h-3.5 w-3.5 text-orange-400" />
                        Temperature Sensor
                      </span>
                      <strong className="text-orange-400 text-sm font-sans">{simTemp.toFixed(1)}°C</strong>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="48"
                      step="0.5"
                      value={simTemp}
                      onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-emerald-500">
                      <span>15°C (Cool)</span>
                      <span>48°C (Extreme)</span>
                    </div>
                  </div>

                  {/* Humidity slider control */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 flex items-center gap-1">
                        <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                        Air Humidity
                      </span>
                      <strong className="text-cyan-400 text-sm font-sans">{simHumidity.toFixed(0)}%</strong>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="95"
                      step="1"
                      value={simHumidity}
                      onChange={(e) => setSimHumidity(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-emerald-500">
                      <span>20% (Dry)</span>
                      <span>95% (Damp)</span>
                    </div>
                  </div>

                  {/* Soil Moisture slider control */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 flex items-center gap-1">
                        <Gauge className="h-3.5 w-3.5 text-emerald-400" />
                        Soil Moisture
                      </span>
                      <strong className="text-emerald-400 text-sm font-sans">{simMoisture.toFixed(0)}%</strong>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="1"
                      value={simMoisture}
                      onChange={(e) => setSimMoisture(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-emerald-500">
                      <span>5% (Desert)</span>
                      <span>100% (Saturated)</span>
                    </div>
                  </div>

                  {/* Simulation push CTA */}
                  <div className="md:col-span-3 pt-3 border-t border-emerald-900/60 pb-1 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] text-emerald-400 font-mono leading-normal max-w-md">
                      ⚠️ Values override standard regional values. Changing these immediately triggers the **Decision Engine Rules** and logs historical sensor data.
                    </p>
                    <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={triggerSingleSimulationStep}
                        className="bg-emerald-900 hover:bg-emerald-800 active:bg-emerald-950 text-emerald-100 border border-emerald-800 text-xs py-2 px-4 rounded-xl transition cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 select-none"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                        Sim Drift Step
                      </button>
                      <button
                        type="submit"
                        id="publish-simulated-telemetry"
                        className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs py-2 px-5 rounded-xl transition cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-1.5 shadow select-none"
                      >
                        <Play className="h-3.5 w-3.5 fill-current shrink-0" />
                        Publish Telemetry
                      </button>
                    </div>
                  </div>

                </form>
              </div>

              {/* Three standard metrics modules (Module 2 Dashboard) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Temperature Card */}
                <MetricCard 
                  title="TEMPERATURE INDICATOR"
                  value={latestReading.temperature}
                  unit="°C"
                  icon={Thermometer}
                  colorClass="text-orange-400"
                  bgIconClass="bg-orange-950/45 border border-orange-900/30"
                  statusBarValue={latestReading.temperature}
                  statusBarColor="bg-orange-400"
                  minVal={15}
                  maxVal={45}
                  description="Displays the heat parameters. Extreme thermal loads above 40°C evoke alert signals."
                  statusBadge={tempBadge.label}
                  statusBadgeColor={tempBadge.color}
                />

                {/* Humidity Card */}
                <MetricCard 
                  title="ATMOSPHERIC HUMIDITY"
                  value={latestReading.humidity}
                  unit="%"
                  icon={Droplets}
                  colorClass="text-cyan-400"
                  bgIconClass="bg-cyan-950/45 border border-cyan-900/30"
                  statusBarValue={latestReading.humidity}
                  statusBarColor="bg-cyan-400"
                  minVal={20}
                  maxVal={95}
                  description="Air wetness indices inside the local crop cover. Critical for managing transpiration."
                />

                {/* Soil Moisture Card */}
                <MetricCard 
                  title="SOIL MOISTURE SENSOR"
                  value={latestReading.soil_moisture}
                  unit="%"
                  icon={Gauge}
                  colorClass="text-emerald-400"
                  bgIconClass="bg-emerald-950/40 border border-emerald-800/40"
                  statusBarValue={latestReading.soil_moisture}
                  statusBarColor="bg-emerald-400"
                  minVal={10}
                  maxVal={100}
                  description="Water level absorption inside layers of agricultural ground loam. Dryness alert pops <20%."
                  statusBadge={moistureBadge.label}
                  statusBadgeColor={moistureBadge.color}
                />

              </div>

              {/* Statistical Recharts trends */}
              <AnalyticsCharts readings={sensorReadings} />

            </div>

            {/* RIGHT SIDEBAR: Weather widgets, Decision algorithms, Alerts feeds */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Crop Recommendation Box */}
              <CropRecommendationCard 
                latestReading={latestReading} 
                recommendationsHistory={recommendations}
              />

              {/* Live Location and Climate widget */}
              <WeatherWidget 
                onLocationChange={handleLocationChange} 
                activeLocation={activeLocation}
              />

              {/* Alert Notification center lists */}
              <AlertNotificationBox 
                alerts={alerts}
                onDismissAlert={handleDismissAlert}
                onClearAllAlerts={handleClearAlerts}
              />

            </div>

          </div>
        )}

      </main>

    </div>
  );
}
