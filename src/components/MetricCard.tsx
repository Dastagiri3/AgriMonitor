import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  colorClass: string;
  bgIconClass: string;
  statusBarValue: number;
  statusBarColor: string;
  minVal: number;
  maxVal: number;
  description: string;
  statusBadge?: string;
  statusBadgeColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  colorClass,
  bgIconClass,
  statusBarValue,
  statusBarColor,
  minVal,
  maxVal,
  description,
  statusBadge,
  statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
}) => {
  // Convert value to percentage representation inside gauge min & max bounds
  const numericVal = typeof value === 'number' ? value : parseFloat(value);
  const percentage = Math.min(100, Math.max(0, ((numericVal - minVal) / (maxVal - minVal)) * 100));

  return (
    <div className="bg-[#021d10] border border-emerald-900 rounded-2xl p-5 shadow-sm hover:shadow-emerald-950 hover:border-emerald-800/80 transition duration-300 relative overflow-hidden group">
      
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.02] rounded-full blur-2xl group-hover:opacity-[0.05] transition-all duration-300 pointer-events-none text-emerald-400" />

      <div className="flex items-start justify-between">
        {/* Metric Value Block */}
        <div>
          <p className="text-xs font-mono font-medium tracking-wide uppercase text-emerald-400">
            {title}
          </p>
          <div className="mt-2.5 flex items-baseline space-x-1">
            <span className="text-3xl font-display font-bold tracking-tight text-white">
              {value}
            </span>
            <span className="text-sm font-mono text-emerald-300">{unit}</span>
          </div>
        </div>

        {/* Dynamic Status Badge & Icon */}
        <div className="flex flex-col items-end space-y-2">
          <div className={`p-2.5 rounded-xl ${bgIconClass} ${colorClass} transition duration-300 shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
          {statusBadge && (
            <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${statusBadgeColor}`}>
              {statusBadge}
            </span>
          )}
        </div>
      </div>

      {/* Progress telemetry Bar representing absolute scale */}
      <div className="mt-5">
        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-500 mb-1.5">
          <span>{minVal}{unit}</span>
          <span>{maxVal}{unit}</span>
        </div>
        <div className="w-full bg-emerald-950/80 rounded-full h-1.5 overflow-hidden border border-emerald-900/60 shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${statusBarColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Helper text descriptor */}
      <p className="mt-3 text-xs text-emerald-400 font-sans leading-relaxed">
        {description}
      </p>
    </div>
  );
};
