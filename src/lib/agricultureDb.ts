import { UserProfile, SensorReading, CropRecommendation, FarmAlert } from '../types';

// Helper to generate UUIDs
function generateUUID(): string {
  return 'f-' + Math.random().toString(36).substr(2, 9);
}

// Check alert patterns
export function checkAlertConditions(
  temp: number,
  moisture: number,
  rainProb: number
): { alertType: FarmAlert['alert_type']; message: string }[] {
  const alerts: { alertType: FarmAlert['alert_type']; message: string }[] = [];

  if (moisture < 20) {
    alerts.push({
      alertType: 'low_moisture',
      message: `Critical: Soil Dryness Warning. Moisture dropped to ${moisture.toFixed(1)}%. Irrigation strongly recommended!`,
    });
  }

  if (temp > 40) {
    alerts.push({
      alertType: 'high_temperature',
      message: `Critical: Excessive Temperature Detected. Current: ${temp.toFixed(1)}°C. Check shade sails and soil evaporation rates.`,
    });
  }

  if (rainProb >= 70) {
    alerts.push({
      alertType: 'heavy_rain_prediction',
      message: `Attention: High Risk of Heavy Rain (${rainProb}%). Halt pre-planned watering cycles and secure young seedlings.`,
    });
  }

  return alerts;
}

// Deterministic Crop Recommendation Engine rules
export function getRecommendation(
  temp: number,
  humidity: number,
  moisture: number
): { crop: CropRecommendation['crop_name']; reason: string } {
  // Rice
  if (temp >= 25 && temp <= 35 && moisture > 70) {
    return {
      crop: 'Rice',
      reason: 'Perfect conditions (Temp: 25-35°C, high soil moisture >70%). Rice seeds flourish in standing clayey soils with high water levels.',
    };
  }

  // Wheat
  if (temp >= 15 && temp <= 26 && moisture >= 40 && moisture <= 70) {
    return {
      crop: 'Wheat',
      reason: 'Optimal wheat window (Temp: 15-26°C, moisture: 40-70%). Moderate temperature combined with medium soil saturation promotes healthy grain clusters.',
    };
  }

  // Cotton
  if (temp >= 26 && temp <= 38 && moisture >= 30 && moisture <= 60) {
    return {
      crop: 'Cotton',
      reason: 'Excellent Cotton setup (Temp: 26-38°C, moisture: 30-60%). Cotton thrives in dry-to-moderate soils with consistent sunlight and heat.',
    };
  }

  // Maize
  if (temp >= 20 && temp <= 33 && moisture >= 50 && moisture <= 80) {
    return {
      crop: 'Maize',
      reason: 'Favorable Maize window (Temp: 20-33°C, moisture: 50-80%). Rapid stem elongation occurs in rich, loamy fields with balanced dampness.',
    };
  }

  // Groundnut
  if (temp >= 21 && temp <= 30 && moisture >= 20 && moisture <= 50) {
    return {
      crop: 'Groundnut',
      reason: 'Ideal Groundnut environment (Temp: 21-30°C, moisture: 20-50%). Loose, sandy to moderately moist sandy-loams are highly conducive to peg development.',
    };
  }

  // Custom boundary warnings / fallbacks
  if (moisture < 20) {
    return {
      crop: 'None',
      reason: `Current soil moisture (${moisture.toFixed(1)}%) is too low for seed germination. Consider instant irrigation before sowing any crop.`,
    };
  }

  if (temp > 40) {
    return {
      crop: 'None',
      reason: `Extreme climate temperature (${temp.toFixed(1)}°C) exceeds safety bounds. Cultivation should wait until temperatures stabilize.`,
    };
  }

  return {
    crop: 'Maize',
    reason: 'Standard fallback: Maize has robust adaptability. Current mixed parameters align closest with maize baseline thresholds.',
  };
}

// LocalStorage database schema initializer
export function initializeDatabase() {
  const isInitialized = localStorage.getItem('smart_agri_initialized');
  if (isInitialized) return;

  // 1. Pre-seed Users Table
  const defaultUsers: UserProfile[] = [
    {
      id: 'usr-farmer-1',
      name: 'Guru Dastagiri',
      email: 'gurudastagiri3@gmail.com',
      role: 'farmer',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'usr-admin-1',
      name: 'Admin Desk',
      email: 'admin@smartfarm.com',
      role: 'admin',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];
  localStorage.setItem('agri_users', JSON.stringify(defaultUsers));

  // Store plain text user logins for simulation
  const loginCredentials = {
    'gurudastagiri3@gmail.com': { password: 'password', role: 'farmer', name: 'Guru Dastagiri', id: 'usr-farmer-1' },
    'admin@smartfarm.com': { password: 'admin', role: 'admin', name: 'Admin Desk', id: 'usr-admin-1' },
  };
  localStorage.setItem('agri_credentials', JSON.stringify(loginCredentials));

  // 2. Pre-seed Sensor Readings Table (30 past readings to populate trends)
  const readings: SensorReading[] = [];
  const baseTime = Date.now();

  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(baseTime - i * 60 * 60 * 1000).toISOString();
    // Simulate natural sine daily fluctuations
    const hour = (24 - i) % 24;
    // Temp peak around 15:00, coolest at 05:00
    const tempOffset = Math.sin(((hour - 9) * Math.PI) / 12); // -1 to +1
    const temperature = Number((28 + tempOffset * 6 + Math.random() * 2).toFixed(1));
    const humidity = Number((60 - tempOffset * 15 + Math.random() * 4).toFixed(1));
    // Simulate moisture deprecation (draining soil)
    const soil_moisture = Number(Math.max(15, Math.min(100, (45 - tempOffset * 8 + Math.random() * 6))).toFixed(1));

    readings.push({
      id: `reading-seed-${24 - i}`,
      temperature,
      humidity,
      soil_moisture,
      timestamp,
    });
  }
  localStorage.setItem('agri_sensor_readings', JSON.stringify(readings));

  // 3. Pre-seed recommendations based on the latest seeded readings
  const lastSec = readings[readings.length - 1];
  const cropRecs: CropRecommendation[] = [];
  const recObj = getRecommendation(lastSec.temperature, lastSec.humidity, lastSec.soil_moisture);
  
  cropRecs.push({
    id: 'rec-seed-1',
    crop_name: recObj.crop,
    reason: recObj.reason,
    generated_at: lastSec.timestamp,
    conditions: {
      temperature: lastSec.temperature,
      humidity: lastSec.humidity,
      soil_moisture: lastSec.soil_moisture
    }
  });
  localStorage.setItem('agri_recommendations', JSON.stringify(cropRecs));

  // 4. Pre-seed Alerts Table
  const defaultAlerts: FarmAlert[] = [
    {
      id: 'alert-seed-1',
      alert_type: 'normal',
      message: 'Agricultural node booted successfully. Reading simulated telemetry sensors.',
      status: 'read',
      created_at: new Date(baseTime - 12 * 60 * 60 * 1000).toISOString()
    }
  ];
  localStorage.setItem('agri_alerts', JSON.stringify(defaultAlerts));

  localStorage.setItem('smart_agri_initialized', 'true');
}

// Fetch helper methods
export function getSensorReadings(): SensorReading[] {
  initializeDatabase();
  const raw = localStorage.getItem('agri_sensor_readings');
  return raw ? JSON.parse(raw) : [];
}

export function saveSensorReadings(readings: SensorReading[]) {
  localStorage.setItem('agri_sensor_readings', JSON.stringify(readings));
}

export function getRecommendations(): CropRecommendation[] {
  initializeDatabase();
  const raw = localStorage.getItem('agri_recommendations');
  return raw ? JSON.parse(raw) : [];
}

export function saveRecommendations(recs: CropRecommendation[]) {
  localStorage.setItem('agri_recommendations', JSON.stringify(recs));
}

export function getAlerts(): FarmAlert[] {
  initializeDatabase();
  const raw = localStorage.getItem('agri_alerts');
  const alerts: FarmAlert[] = raw ? JSON.parse(raw) : [];
  // Sort with newest first
  return alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function saveAlerts(alerts: FarmAlert[]) {
  localStorage.setItem('agri_alerts', JSON.stringify(alerts));
}

export function addAlert(alert_type: FarmAlert['alert_type'], message: string): FarmAlert {
  const alerts = getAlerts();
  const newAlert: FarmAlert = {
    id: generateUUID(),
    alert_type,
    message,
    status: 'unread',
    created_at: new Date().toISOString()
  };
  alerts.unshift(newAlert);
  saveAlerts(alerts);
  return newAlert;
}

export function clearAlerts() {
  saveAlerts([]);
}

export function dismissAlert(id: string) {
  const alerts = getAlerts();
  const updated = alerts.map(a => a.id === id ? { ...a, status: 'read' as const } : a);
  saveAlerts(updated);
}

// User Profile management
export function getUsers(): UserProfile[] {
  initializeDatabase();
  const raw = localStorage.getItem('agri_users');
  return raw ? JSON.parse(raw) : [];
}

export function getSession(): UserProfile | null {
  const raw = localStorage.getItem('agri_current_session');
  return raw ? JSON.parse(raw) : null;
}

export function setSession(user: UserProfile | null) {
  if (user) {
    localStorage.setItem('agri_current_session', JSON.stringify(user));
  } else {
    localStorage.removeItem('agri_current_session');
  }
}

// Core DB operations requested in PRD
export function createSensorReading(temp: number, hum: number, soilMoisture: number, rainProbOverride = 0): SensorReading {
  const readings = getSensorReadings();
  const now = new Date().toISOString();

  const newReading: SensorReading = {
    id: generateUUID(),
    temperature: Number(temp.toFixed(1)),
    humidity: Number(hum.toFixed(1)),
    soil_moisture: Number(soilMoisture.toFixed(1)),
    timestamp: now
  };

  readings.push(newReading);
  saveSensorReadings(readings);

  // Evaluate Crop Recommendations
  const latestRecs = getRecommendations();
  const currentRecInfo = getRecommendation(temp, hum, soilMoisture);
  
  // Only add recommendation if the crop changed or if there aren't any
  const previousRec = latestRecs[0];
  if (!previousRec || previousRec.crop_name !== currentRecInfo.crop) {
    const newRecommendation: CropRecommendation = {
      id: generateUUID(),
      crop_name: currentRecInfo.crop,
      reason: currentRecInfo.reason,
      generated_at: now,
      conditions: {
        temperature: temp,
        humidity: hum,
        soil_moisture: soilMoisture
      }
    };
    latestRecs.unshift(newRecommendation);
    saveRecommendations(latestRecs);
  }

  // Evaluate alerts
  const triggers = checkAlertConditions(temp, soilMoisture, rainProbOverride);
  triggers.forEach(t => {
    addAlert(t.alertType, t.message);
  });

  return newReading;
}
