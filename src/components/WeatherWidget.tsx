import React, { useState, useEffect } from 'react';
import { WeatherData } from '../types';
import { fetchWeatherForLocation, LocationOption, AGRICULTURAL_LOCATIONS } from '../lib/weatherService';
import { CloudRain, Wind, Droplets, Thermometer, MapPin, Grid3X3, Layers, Sprout, Sparkles, Navigation, AlertCircle, Search } from 'lucide-react';

// Dynamically matches soil types and base crops according to coordinates for high-accuracy sensing
export const determineSoilAndCrop = (lat: number, lng: number) => {
  const absLat = Math.abs(lat);
  
  if (absLat < 15) {
    return {
      soilType: 'Tropical Humid Ferralsol (Deep clay-loam)',
      defaultCrop: 'Rice'
    };
  } else if (absLat >= 15 && absLat < 23) {
    if (lng > 60 && lng < 100) {
      return {
        soilType: 'Black Cotton Vertisols (Premium moisture retention)',
        defaultCrop: 'Cotton'
      };
    }
    return {
      soilType: 'Arid Red Arenosols (Quartz-rich dynamic sandy loam)',
      defaultCrop: 'Groundnut'
    };
  } else if (absLat >= 23 && absLat < 35) {
    if (lng > 70 && lng < 95) {
      return {
        soilType: 'Alluvial Loess Plains (Rich moisture profile)',
        defaultCrop: 'Wheat'
      };
    }
    return {
      soilType: 'Calcareous Calcisols (Neutral mineral clay)',
      defaultCrop: 'Wheat'
    };
  } else if (absLat >= 35 && absLat < 48) {
    if (lng < -80 && lng > -125) {
      return {
        soilType: 'Mollisols Dark Prairie (Highly organic rich silt loam)',
        defaultCrop: 'Maize'
      };
    }
    return {
      soilType: 'Brown Forest Luvisols (Temperate fertile silt loam)',
      defaultCrop: 'Maize'
    };
  } else {
    return {
      soilType: 'Humic Podzols (Acidic damp coarse loam)',
      defaultCrop: 'Wheat'
    };
  }
};

interface WeatherWidgetProps {
  onLocationChange: (location: LocationOption, weather: WeatherData) => void;
  activeLocation: LocationOption;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ onLocationChange, activeLocation }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locLoading, setLocLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Search states for Manual Location override
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const loadWeather = async (loc: LocationOption) => {
    setLoading(true);
    const data = await fetchWeatherForLocation(loc);
    setWeather(data);
    setLoading(false);
    onLocationChange(loc, data);
  };

  useEffect(() => {
    loadWeather(activeLocation);
  }, [activeLocation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=5`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SmartAgriMonitor/1.0'
          }
        }
      );
      if (!response.ok) throw new Error("Search network error");
      const data = await response.json();
      
      if (data && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchError("No agricultural zones or cities matched your query.");
      }
    } catch (err) {
      console.error(err);
      setSearchError("Sensing service unavailable. Try entering generic city names.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const latNum = parseFloat(result.lat);
    const lngNum = parseFloat(result.lon);
    
    // Parse result elements
    const cityName = result.name || result.display_name.split(',')[0] || "Custom Zone";
    const parts = result.display_name.split(',');
    const countryName = parts[parts.length - 1]?.trim() || "Detected Region";
    const stateName = parts[parts.length - 2]?.trim() || parts[1]?.trim() || "Coordinates Area";

    const customMetrics = determineSoilAndCrop(latNum, lngNum);

    const customLoc: LocationOption = {
      name: cityName,
      state: stateName,
      country: countryName,
      lat: Number(latNum.toFixed(4)),
      lng: Number(lngNum.toFixed(4)),
      soilType: customMetrics.soilType,
      defaultCrop: customMetrics.defaultCrop
    };

    setSearchResults([]);
    setSearchQuery('');
    setShowSearch(false);
    loadWeather(customLoc);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser environment.");
      return;
    }

    setLocLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Fallback title incorporates extreme coordinate precision
        let cityName = `Farm ${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E`;
        let countryName = "Sensed Region";
        let addr = null;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'SmartAgriMonitor/1.0'
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            addr = data.address;
            if (addr) {
              cityName = addr.city || addr.town || addr.village || addr.suburb || addr.hamlet || cityName;
              countryName = addr.country || "Detected Area";
            }
          }
        } catch (err) {
          console.warn("Reverse lookup failed, maintaining localized coordinate labels", err);
        }

        const metrics = determineSoilAndCrop(latitude, longitude);

        const detectedLoc: LocationOption = {
          name: cityName,
          state: addr ? (addr.state || addr.county || "Live GPS") : "Live GPS",
          country: countryName,
          lat: Number(latitude.toFixed(4)),
          lng: Number(longitude.toFixed(4)),
          soilType: metrics.soilType,
          defaultCrop: metrics.defaultCrop
        };

        await loadWeather(detectedLoc);
        setLocLoading(false);
      },
      (error) => {
        console.error("GPS detection failed", error);
        let errorMsg = "Unable to fetch precise current position coordinates.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location access denied. Please approve geolocation permissions or use the search manual option.";
        }
        setGeoError(errorMsg);
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="bg-[#021d10] border border-emerald-900 rounded-2xl p-5 shadow-sm hover:shadow-emerald-950 transition duration-300">
      
      {/* Header and selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-900">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight font-sans flex items-center gap-1.5 leading-none">
            <MapPin className="h-4 w-4 text-emerald-400" />
            Regional Microclimate & Location
          </h3>
          <p className="text-[11px] text-emerald-400 font-mono mt-1 uppercase">WEATHER DATA FIELD UNIT</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Agricultural Region Selection Selector */}
          <select
            value={activeLocation.name}
            onChange={(e) => {
              let loc = AGRICULTURAL_LOCATIONS.find(l => l.name === e.target.value);
              if (!loc && activeLocation.name === e.target.value) {
                loc = activeLocation;
              }
              if (loc) {
                loadWeather(loc);
              }
            }}
            className="bg-emerald-950 border border-emerald-800 text-emerald-100 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {AGRICULTURAL_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}, {loc.country} ({loc.defaultCrop} Hub)
              </option>
            ))}
            {!AGRICULTURAL_LOCATIONS.some(l => l.name === activeLocation.name) && (
              <option value={activeLocation.name}>
                📍 {activeLocation.name}, {activeLocation.country}
              </option>
            )}
          </select>

          {/* New Geolocation Precision sensing trigger */}
          <button
            onClick={handleDetectLocation}
            disabled={locLoading}
            id="gps-location-btn"
            className="bg-emerald-950 hover:bg-[#022a15] border border-emerald-800 hover:border-emerald-700 disabled:opacity-50 text-emerald-400 hover:text-white px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Auto-detect climate GPS coordinates"
          >
            {locLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Navigation className="h-3.5 w-3.5 rotate-45 text-emerald-400" />
            )}
            <span>{locLoading ? 'Locating...' : 'My GPS'}</span>
          </button>

          {/* New Exact manual location search option */}
          <button
            type="button"
            onClick={() => {
              setShowSearch(!showSearch);
              setSearchError(null);
              setSearchResults([]);
            }}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-medium border ${
              showSearch
                ? 'bg-emerald-500 hover:bg-emerald-600 text-[#021d10] border-emerald-400 font-bold'
                : 'bg-emerald-950 hover:bg-[#022a15] border-emerald-800 hover:border-emerald-700 text-emerald-400 hover:text-white'
            }`}
            title="Search custom agricultural locations manually"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Expandable Manual Search and Geolocation Precision Form */}
      {showSearch && (
        <div className="mt-3 p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-900/60 space-y-3 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-[10px] tracking-wider uppercase font-mono font-bold text-emerald-400/90 flex items-center gap-1">
              <Search className="h-3 w-3 text-emerald-400" />
              Coordinate Search Engine
            </span>
            <button
              onClick={() => setShowSearch(false)}
              className="text-[10px] text-emerald-500 hover:text-emerald-300 font-mono underline uppercase"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city, state, or region (e.g., Fresno, Guntur, London)..."
                className="w-full bg-emerald-950 border border-emerald-800 hover:border-emerald-700 text-xs placeholder-emerald-700 text-emerald-100 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {searchLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Locate</span>
              )}
            </button>
          </form>

          {searchError && (
            <p className="text-[10px] text-amber-500 font-mono flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {searchError}
            </p>
          )}

          {searchResults.length > 0 && (
            <div className="bg-emerald-950 border border-emerald-900/80 rounded-xl overflow-hidden divide-y divide-emerald-900/30">
              <span className="block text-[9px] uppercase font-mono text-emerald-500/80 px-2.5 py-1.5 bg-emerald-950/50">
                Sensed Agriculture Zones Match:
              </span>
              {searchResults.map((result, idx) => {
                const parts = result.display_name.split(',');
                const head = parts[0];
                const tail = parts.slice(1, 4).join(', ');
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full text-left px-3 py-2.5 hover:bg-emerald-900/20 text-xs transition flex flex-col gap-0.5 group cursor-pointer"
                  >
                    <span className="font-semibold text-emerald-100 group-hover:text-emerald-300 flex items-center gap-1">
                      📍 {head}
                    </span>
                    {tail && (
                      <span className="text-[10px] text-emerald-400/70 truncate pl-3.5">
                        {tail}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-[9px] font-mono text-emerald-500/60 leading-normal">
            Precision sensing queries OpenStreetMap georeferencing databases to fetch precise GPS degrees. On selection, regional agricultural soil mapping filters are automatically analyzed.
          </p>
        </div>
      )}

      {geoError && (
        <div className="mt-3 p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2 text-emerald-400">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono">Fetching Live Weather...</p>
        </div>
      ) : weather ? (
        <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Main big weather readout column */}
          <div className="md:col-span-5 bg-emerald-950/40 rounded-xl p-4 border border-emerald-900/60 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-bold text-white font-sans">{weather.city}</p>
                <p className="text-xs font-mono text-emerald-400 mt-0.5">{weather.condition_text}</p>
              </div>
              <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${weather.source === 'api' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-800/80' : 'bg-amber-950/40 text-amber-300 border border-amber-900/30'}`}>
                {weather.source === 'api' ? 'LIVE Open-Meteo' : 'SIMULATED'}
              </span>
            </div>

            <div className="my-4 flex items-center space-x-3.5">
              <Thermometer className="h-9 w-9 text-emerald-500 shrink-0" />
              <div>
                <span className="text-4xl font-display font-black text-white">{weather.temperature}</span>
                <span className="text-lg font-bold text-emerald-300">°C</span>
              </div>
            </div>

            <p className="text-[10px] text-emerald-400 font-mono leading-normal">
              Coordinates: Lat {activeLocation.lat.toFixed(4)}, Lng {activeLocation.lng.toFixed(4)}. This data powers prediction engines.
            </p>
          </div>

          {/* Secondary conditions bento cards */}
          <div className="md:col-span-7 grid grid-cols-2 gap-3.5">
            
            {/* Precipitation probability card */}
            <div className="bg-[#02170c] border border-emerald-900/40 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-mono text-emerald-400/80 flex items-center gap-1">
                <CloudRain className="h-3 w-3 text-emerald-500" />
                Rain Probability
              </span>
              <div className="my-2 text-2xl font-black text-white">{weather.rain_probability}%</div>
              <p className="text-[9px] text-emerald-500 font-mono leading-none">
                {weather.rain_probability >= 70 ? '⚠️ High rain alert' : 'Dry forecast'}
              </p>
            </div>

            {/* Wind velocity card */}
            <div className="bg-[#02170c] border border-emerald-900/40 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[10px] uppercase font-mono text-emerald-400/80 flex items-center gap-1">
                <Wind className="h-3 w-3 text-emerald-500" />
                Wind Velocity
              </span>
              <div className="my-2 text-2xl font-black text-white">{weather.wind_speed} <span className="text-xs font-medium">km/h</span></div>
              <p className="text-[9px] text-emerald-500 font-mono leading-none">
                {weather.wind_speed < 15 ? 'Calm air' : 'Breezy delta winds'}
              </p>
            </div>

            {/* Micro-climate humidity card */}
            <div className="bg-[#02170c] border border-emerald-900/40 rounded-xl p-3 flex flex-col justify-between col-span-2">
              <span className="text-[10px] uppercase font-mono text-emerald-400/80 flex items-center gap-1">
                <Droplets className="h-3 w-3 text-emerald-500" />
                Atmospheric Humidity
              </span>
              <div className="my-1.5 flex items-baseline space-x-1.5">
                <span className="text-2xl font-bold text-white">{weather.humidity}%</span>
                <span className="text-[10px] font-mono text-emerald-400">Relative Humidity</span>
              </div>
              
              {/* Soil layer breakdown representing localized farm information */}
              <div className="mt-2 pt-2 border-t border-emerald-900/60 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-emerald-500" />
                <span>Soil: <strong className="text-emerald-200">{activeLocation.soilType}</strong></span>
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
};
