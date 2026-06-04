export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'admin';
  created_at: string;
}

export interface SensorReading {
  id: string;
  temperature: number;
  humidity: number;
  soil_moisture: number;
  timestamp: string;
}

export interface CropRecommendation {
  id: string;
  crop_name: 'Rice' | 'Wheat' | 'Cotton' | 'Maize' | 'Groundnut' | 'None';
  reason: string;
  generated_at: string;
  conditions: {
    temperature: number;
    humidity: number;
    soil_moisture: number;
  };
}

export interface FarmAlert {
  id: string;
  alert_type: 'low_moisture' | 'high_temperature' | 'heavy_rain_prediction' | 'normal';
  message: string;
  status: 'unread' | 'read';
  created_at: string;
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  rain_probability: number;
  condition_text: string;
  is_loading: boolean;
  source: 'api' | 'simulation';
}
