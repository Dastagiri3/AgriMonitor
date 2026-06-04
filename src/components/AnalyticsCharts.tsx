import React, { useState } from 'react';
import { SensorReading } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Calendar, Thermometer, Droplets, Activity, RefreshCw } from 'lucide-react';

interface AnalyticsChartsProps {
  readings: SensorReading[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ readings }) => {
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [activeTab, setActiveTab] = useState<'all' | 'temperature' | 'moisture'>('all');

  // Filter and downsample readings based on selection
  const getFilteredData = () => {
    // Reverse or sort chronologically for charts
    const sorted = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    if (timeFilter === 'daily') {
      // Last 24 entries or 24 hours
      return sorted.slice(-24).map(r => ({
        ...r,
        formattedTime: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateLabel: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
      }));
    }

    if (timeFilter === 'weekly') {
      // Group or filter last 7 days. Since it's a simulation, we can simulate daily peaks or sample every 4th reading
      const simulatedWeekly = sorted.slice(-50).filter((_, idx) => idx % 6 === 0);
      return simulatedWeekly.map(r => ({
        ...r,
        formattedTime: new Date(r.timestamp).toLocaleDateString([], { weekday: 'short' }),
        dateLabel: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
      }));
    }

    // Monthly
    // Group or filter last 30 intervals. Sample every 8th reading
    const simulatedMonthly = sorted.slice(-120).filter((_, idx) => idx % 10 === 0);
    return simulatedMonthly.map(r => ({
      ...r,
      formattedTime: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      dateLabel: new Date(r.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })
    }));
  };

  const chartData = getFilteredData();

  // Custom tooltips styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#022112] border border-emerald-800 p-3 rounded-xl text-xs font-mono shadow-xl text-emerald-100">
          <p className="font-bold text-white mb-2">{payload[0].payload.dateLabel || label}</p>
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-2.5 my-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-emerald-400 capitalize">{item.name}:</span>
              <strong className="text-white">{item.value.toFixed(1)}{item.name === 'temperature' ? '°C' : '%'}</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#021d10] border border-emerald-900 rounded-2xl p-5 shadow-sm hover:shadow-emerald-950 transition duration-300">
      
      {/* Chart controller header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-900">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight font-sans flex items-center gap-1.5 leading-none">
            <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
            Sensor Trends & Analytics Engine
          </h3>
          <p className="text-[11px] text-emerald-400 font-mono mt-1 uppercase">DYNAMIC GRAPH STATS (MODULE 7)</p>
        </div>

        {/* Time filters buttons */}
        <div className="flex items-center bg-emerald-950/80 border border-emerald-900 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setTimeFilter('daily')}
            className={`px-3 py-1 text-[10px] font-mono rounded-lg font-bold uppercase transition cursor-pointer ${timeFilter === 'daily' ? 'bg-emerald-500 text-emerald-950 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeFilter('weekly')}
            className={`px-3 py-1 text-[10px] font-mono rounded-lg font-bold uppercase transition cursor-pointer ${timeFilter === 'weekly' ? 'bg-emerald-500 text-emerald-950 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeFilter('monthly')}
            className={`px-3 py-1 text-[10px] font-mono rounded-lg font-bold uppercase transition cursor-pointer ${timeFilter === 'monthly' ? 'bg-emerald-500 text-emerald-950 shadow-sm' : 'text-emerald-400 hover:text-white'}`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        
        {/* Toggle between viewing all combined curves, or single metrics cleanly */}
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${activeTab === 'all' ? 'bg-emerald-900/60 border-emerald-500 text-white' : 'border-emerald-900 hover:border-emerald-800 text-emerald-400'}`}
          >
            Combined Outlook
          </button>
          <button
            onClick={() => setActiveTab('temperature')}
            className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${activeTab === 'temperature' ? 'bg-orange-950/40 border-orange-700 text-orange-400' : 'border-emerald-900 hover:border-emerald-800 text-emerald-400'}`}
          >
            Temperature ONLY
          </button>
          <button
            onClick={() => setActiveTab('moisture')}
            className={`px-2.5 py-1.5 rounded-lg border cursor-pointer transition ${activeTab === 'moisture' ? 'bg-emerald-950/70 border-emerald-700 text-emerald-400' : 'border-emerald-900 hover:border-emerald-800 text-emerald-400'}`}
          >
            Soil Moisture ONLY
          </button>
        </div>

        {/* Chart Viewport Canvas */}
        <div className="h-64 sm:h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === 'all' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#04321d" vertical={false} />
                <XAxis 
                  dataKey="formattedTime" 
                  stroke="#047857" 
                  fontSize={9} 
                  fontFamily="monospace"
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#047857" 
                  fontSize={9} 
                  fontFamily="monospace" 
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 9, fontFamily: 'monospace', paddingTop: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  name="temperature"
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  name="humidity"
                  stroke="#06b6d4" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="soil_moisture" 
                  name="soil_moisture"
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            ) : activeTab === 'temperature' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaTempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#102e1c" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="#f97316" fontSize={9} fontFamily="monospace" tickLine={false} />
                <YAxis stroke="#f97316" fontSize={9} fontFamily="monospace" tickLine={false} domain={[10, 50]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="temperature" name="temperature" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#areaTempGrad)" />
              </AreaChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaMoistGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#102e1c" vertical={false} />
                <XAxis dataKey="formattedTime" stroke="#10b981" fontSize={9} fontFamily="monospace" tickLine={false} />
                <YAxis stroke="#10b981" fontSize={9} fontFamily="monospace" tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="soil_moisture" name="soil_moisture" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#areaMoistGrad)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Summary note */}
        <p className="text-[10px] text-emerald-400 font-mono italic text-right leading-none">
          Data spans over selected {timeFilter} telemetry database arrays. Readings fluctuate realistically.
        </p>

      </div>

    </div>
  );
};
