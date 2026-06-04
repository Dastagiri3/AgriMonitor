import { WeatherData } from '../types';

export interface LocationOption {
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  soilType: string;
  defaultCrop: string;
}

export const AGRICULTURAL_LOCATIONS: LocationOption[] = [
  {
    name: 'Anantapur',
    state: 'Andhra Pradesh',
    country: 'India',
    lat: 14.68,
    lng: 77.60,
    soilType: 'Red Sandy Loam (Well-drained)',
    defaultCrop: 'Groundnut',
  },
  {
    name: 'Guntur',
    state: 'Andhra Pradesh',
    country: 'India',
    lat: 16.31,
    lng: 80.44,
    soilType: 'Black Cotton Clay (High water retention)',
    defaultCrop: 'Rice',
  },
  {
    name: 'Fresno',
    state: 'California',
    country: 'USA',
    lat: 36.74,
    lng: -119.77,
    soilType: 'Deep Alluvial Sandy Mud',
    defaultCrop: 'Cotton',
  },
  {
    name: 'Des Moines',
    state: 'Iowa',
    country: 'USA',
    lat: 41.58,
    lng: -93.60,
    soilType: 'Dark Rich Silt Mollisols',
    defaultCrop: 'Maize',
  },
  {
    name: 'Nile Delta',
    state: 'Al-Gharbiyah',
    country: 'Egypt',
    lat: 30.54,
    lng: 31.11,
    soilType: 'Fertile Fine Clay Sediments Assemblies',
    defaultCrop: 'Wheat',
  }
];

// Interpret Open-Meteo weather codes
function interpretWeatherCode(code: number): { text: string; rainProbEstimate: number } {
  if (code === 0) return { text: 'Clear Sky', rainProbEstimate: 5 };
  if (code >= 1 && code <= 3) return { text: 'Partly Cloudy', rainProbEstimate: 15 };
  if (code >= 45 && code <= 48) return { text: 'Foggy Atmospheric Haze', rainProbEstimate: 10 };
  if (code >= 51 && code <= 55) return { text: 'Drizzling Sprinkles', rainProbEstimate: 45 };
  if (code >= 61 && code <= 65) return { text: 'Steady Rain showers', rainProbEstimate: 85 };
  if (code >= 71 && code <= 77) return { text: 'Light Sleet flurries', rainProbEstimate: 30 };
  if (code >= 80 && code <= 82) return { text: 'Violent Cloudburst Rain', rainProbEstimate: 95 };
  if (code >= 95 && code <= 99) return { text: 'Severe Thunderstorms', rainProbEstimate: 99 };
  return { text: 'Overcast Conditions', rainProbEstimate: 60 };
}

export async function fetchWeatherForLocation(loc: LocationOption): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&hourly=precipitation_probability&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API failure');
    
    const data = await res.json();
    const current = data.current;
    const weatherInfo = interpretWeatherCode(current.weather_code);
    
    // Get immediate precipitation probability if listed, else fallback to hourly estimate
    let rainProb = weatherInfo.rainProbEstimate;
    if (data.hourly && data.hourly.precipitation_probability && data.hourly.precipitation_probability.length > 0) {
      rainProb = Math.max(rainProb, data.hourly.precipitation_probability[0]);
    }

    return {
      city: `${loc.name}, ${loc.country}`,
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      wind_speed: Math.round(current.wind_speed_10m),
      rain_probability: rainProb,
      condition_text: weatherInfo.text,
      is_loading: false,
      source: 'api'
    };
  } catch (error) {
    console.warn('OpenMeteo fetch failed, falling back to realistic simulated agricultural weather', error);
    // Safe realistic simulation fallback
    const hour = new Date().getHours();
    const isDay = hour > 6 && hour < 19;
    const tempSim = isDay ? 31 : 23;
    return {
      city: `${loc.name}, ${loc.country}`,
      temperature: tempSim + Math.floor(Math.random() * 4),
      humidity: isDay ? 45 + Math.floor(Math.random() * 8) : 75 + Math.floor(Math.random() * 10),
      wind_speed: 12 + Math.floor(Math.random() * 6),
      rain_probability: loc.defaultCrop === 'Rice' ? 65 : 15,
      condition_text: loc.defaultCrop === 'Rice' ? 'Favorable Cloud Base' : 'Sunny Clear Ambient',
      is_loading: false,
      source: 'simulation'
    };
  }
}
