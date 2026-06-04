import React from 'react';
import { CropRecommendation, SensorReading } from '../types';
import { getRecommendation } from '../lib/agricultureDb';
import { Sparkles, Sprout, ArrowRight, BookOpen, AlertTriangle, HelpCircle } from 'lucide-react';

interface CropRecommendationCardProps {
  latestReading: SensorReading;
  recommendationsHistory: CropRecommendation[];
}

export const CropRecommendationCard: React.FC<CropRecommendationCardProps> = ({
  latestReading,
  recommendationsHistory
}) => {
  const currentRec = getRecommendation(
    latestReading.temperature,
    latestReading.humidity,
    latestReading.soil_moisture
  );

  // Get icons/visual colors based on crop
  const getCropMeta = (cropName: string) => {
    switch (cropName) {
      case 'Rice':
        return {
          emoji: '🌾',
          themeBg: 'bg-indigo-950/40 border-indigo-900 text-indigo-400',
          indicatorColor: 'bg-indigo-400',
          waterNeed: 'Very High (>70% soil moisture)',
          tempNeed: 'Warm (25-35°C)',
          marketValue: 'High Demand stable harvest staple',
        };
      case 'Wheat':
        return {
          emoji: '🍞',
          themeBg: 'bg-amber-950/40 border-amber-900 text-amber-400',
          indicatorColor: 'bg-amber-400',
          waterNeed: 'Medium (40-70% soil moisture)',
          tempNeed: 'Cool (15-26°C)',
          marketValue: 'Export utility commodity core grain',
        };
      case 'Cotton':
        return {
          emoji: '☁️',
          themeBg: 'bg-sky-950/40 border-sky-900 text-sky-400',
          indicatorColor: 'bg-sky-400',
          waterNeed: 'Low-Medium (30-60% soil moisture)',
          tempNeed: 'Dry Hot (26-38°C)',
          marketValue: 'Premium textile cash crop value',
        };
      case 'Maize':
        return {
          emoji: '🌽',
          themeBg: 'bg-yellow-950/40 border-yellow-900 text-yellow-400',
          indicatorColor: 'bg-yellow-400',
          waterNeed: 'Moderate (50-80% soil moisture)',
          tempNeed: 'Moderate (20-33°C)',
          marketValue: 'Feedstock & general starch processing utility',
        };
      case 'Groundnut':
        return {
          emoji: '🥜',
          themeBg: 'bg-orange-950/40 border-orange-950 text-orange-400',
          indicatorColor: 'bg-orange-400',
          waterNeed: 'Low (20-50% soil moisture)',
          tempNeed: 'Medium (21-30°C)',
          marketValue: 'Premium oil yield high nutritional density',
        };
      default:
        return {
          emoji: '🛑',
          themeBg: 'bg-red-950/30 border-red-900/60 text-red-400',
          indicatorColor: 'bg-red-400',
          waterNeed: 'Critical soil remediation requested',
          tempNeed: 'Stabilize telemetry profile',
          marketValue: 'Halt crop cultivation safely',
        };
    }
  };

  const cropMeta = getCropMeta(currentRec.crop);

  return (
    <div className="bg-[#021d10] border border-emerald-900 rounded-2xl p-5 shadow-sm hover:shadow-emerald-950 transition duration-300">
      
      {/* Title block */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-900">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight font-sans flex items-center gap-1.5 leading-none">
            <Sprout className="h-4 w-4 text-emerald-400" />
            Decision Engine: Crop Recommendation
          </h3>
          <p className="text-[11px] text-emerald-400 font-mono mt-1 uppercase">ALGORITHM MATCH RULES (MODULE 5)</p>
        </div>
        <span className="bg-emerald-900/50 text-emerald-300 border border-emerald-800 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-emerald-400 shrink-0" />
          Realtime Rule Solver
        </span>
      </div>

      <div className="pt-4 space-y-4">
        {/* Recommended Crop Profile card */}
        <div className={`border rounded-2xl p-4 flex items-start space-x-3.5 transition duration-350 ${cropMeta.themeBg}`}>
          <div className="text-4xl select-none p-2 bg-emerald-950/80 rounded-xl border border-emerald-900/60 shadow-inner leading-none shrink-0">
            {cropMeta.emoji}
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium tracking-widest text-emerald-400 uppercase leading-none">RECOMMENDED CROP</span>
              <span className={`h-2 w-2 rounded-full ${cropMeta.indicatorColor}`} />
            </div>
            <h4 id="recommended-crop-name" className="text-2xl font-display font-medium text-white leading-none">
              {currentRec.crop}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
              {currentRec.reason}
            </p>
          </div>
        </div>

        {/* Live inputs showing decision metrics from latest reading */}
        <div className="grid grid-cols-3 gap-2.5 bg-emerald-950/30 rounded-xl p-3 border border-emerald-900/40 text-xs font-mono">
          <div className="text-center">
            <p className="text-[10px] text-emerald-500 uppercase leading-none">TEMPERATURE</p>
            <p className="text-sm font-bold text-white mt-1">{latestReading.temperature}°C</p>
          </div>
          <div className="text-center border-x border-emerald-900/60">
            <p className="text-[10px] text-emerald-500 uppercase leading-none">HUMIDITY</p>
            <p className="text-sm font-bold text-white mt-1">{latestReading.humidity}%</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-emerald-500 uppercase leading-none">SOIL MOISTURE</p>
            <p className="text-sm font-bold text-white mt-1">{latestReading.soil_moisture}%</p>
          </div>
        </div>

        {/* Specifications detail block */}
        <div className="space-y-2.5 text-xs font-mono">
          <div className="flex justify-between items-center py-1.5 border-b border-emerald-900/40">
            <span className="text-emerald-500 uppercase tracking-wider text-[10px]">Optimal Watering Range</span>
            <span className="text-emerald-100 font-bold">{cropMeta.waterNeed}</span>
          </div>
          <div className="flex justify-between items-center py-1.5 border-b border-emerald-900/40">
            <span className="text-emerald-500 uppercase tracking-wider text-[10px]">Optimal Temperature bounds</span>
            <span className="text-emerald-100 font-bold">{cropMeta.tempNeed}</span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-emerald-500 uppercase tracking-wider text-[10px]">Economic Market Status</span>
            <span className="text-emerald-100 font-bold leading-tight text-right max-w-[200px]">{cropMeta.marketValue}</span>
          </div>
        </div>

        {/* Previous Recommendations logs list */}
        {recommendationsHistory.length > 1 && (
          <div className="pt-3 border-t border-emerald-900/60">
            <p className="text-[10px] text-emerald-400 font-mono tracking-wider font-bold uppercase mb-2 flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-emerald-500" />
              Dynamic Recommendation Logs (DB)
            </p>
            <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-900 pr-1.5">
              {recommendationsHistory.slice(1, 4).map((rec, index) => (
                <div key={rec.id || index} className="flex items-center justify-between bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/40 text-[10px] font-mono leading-none">
                  <div className="flex items-center space-x-2">
                    <span className="text-base leading-none">{getCropMeta(rec.crop_name).emoji}</span>
                    <div>
                      <p className="text-emerald-100 font-bold">{rec.crop_name}</p>
                      <p className="text-[8px] text-emerald-500 font-light">{new Date(rec.generated_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="text-right text-[8px] text-emerald-400">
                    T: {rec.conditions.temperature}°C • M: {rec.conditions.soil_moisture}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
