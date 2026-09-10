import React, { useState, useEffect } from 'react';
import { X, Send, Radio, Thermometer, Droplets, CloudRain, Wind } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function EnvironmentInputModal({ isOpen, onClose, field, onSubmitEnv, onTriggerIoT }) {
  const { t } = useLanguage();
  const [envData, setEnvData] = useState({
    soil_moisture_pct: 22.0,
    temperature_c: 32.0,
    humidity_pct: 45.0,
    rainfall_mm: 0.0,
    rain_probability_pct: 10.0,
    wind_speed_kmh: 8.0,
    source: 'Manual Entry'
  });

  useEffect(() => {
    if (field && field.latest_environment) {
      const e = field.latest_environment;
      setEnvData({
        soil_moisture_pct: e.soil_moisture_pct || 22.0,
        temperature_c: e.temperature_c || 30.0,
        humidity_pct: e.humidity_pct || 50.0,
        rainfall_mm: e.rainfall_mm || 0.0,
        rain_probability_pct: e.rain_probability_pct || 10.0,
        wind_speed_kmh: e.wind_speed_kmh || 6.0,
        source: 'Manual Entry'
      });
    }
  }, [field, isOpen]);

  if (!isOpen || !field) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitEnv({
      field_id: field.id,
      ...envData
    });
  };

  const handleSimulateIoT = () => {
    // Generate realistic IoT sensor telemetry stream
    const iotReading = {
      field_id: field.id,
      soil_moisture_pct: Number((12.0 + Math.random() * 25.0).toFixed(1)),
      temperature_c: Number((26.0 + Math.random() * 12.0).toFixed(1)),
      humidity_pct: Number((35.0 + Math.random() * 40.0).toFixed(1)),
      rainfall_mm: Math.random() > 0.7 ? Number((Math.random() * 15.0).toFixed(1)) : 0.0,
      rain_probability_pct: Number((Math.random() * 90.0).toFixed(0)),
      wind_speed_kmh: Number((4.0 + Math.random() * 16.0).toFixed(1)),
      source: 'IoT ESP32 Sensor'
    };
    setEnvData(iotReading);
    onTriggerIoT(iotReading);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--water-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={20} />
            Environmental & IoT Sensor Input for '{field.name}'
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Quick IoT Simulation Bar */}
        <div style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--water-cyan)' }}>{t('simulateIoTTitle')}</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('simulateIoTSub')}</p>
          </div>
          <button type="button" className="btn btn-water btn-sm" onClick={handleSimulateIoT}>
            <Radio size={14} /> {t('scanIoT')}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Droplets size={14} color="#3b82f6" /> {t('soilMoisture')} ({envData.soil_moisture_pct}%)
              </label>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="0.5" 
                className="slider-control" 
                value={envData.soil_moisture_pct} 
                onChange={(e) => setEnvData({ ...envData, soil_moisture_pct: parseFloat(e.target.value) })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Thermometer size={14} color="#ef4444" /> {t('temperature')} ({envData.temperature_c}°C)
              </label>
              <input 
                type="range" 
                min="10" 
                max="45" 
                step="0.5" 
                className="slider-control" 
                value={envData.temperature_c} 
                onChange={(e) => setEnvData({ ...envData, temperature_c: parseFloat(e.target.value) })} 
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('humidity')} ({envData.humidity_pct}%)</label>
              <input 
                type="range" 
                min="15" 
                max="95" 
                step="1" 
                className="slider-control" 
                value={envData.humidity_pct} 
                onChange={(e) => setEnvData({ ...envData, humidity_pct: parseFloat(e.target.value) })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wind size={14} color="#94a3b8" /> {t('windSpeed')} ({envData.wind_speed_kmh} km/h)
              </label>
              <input 
                type="range" 
                min="0" 
                max="30" 
                step="1" 
                className="slider-control" 
                value={envData.wind_speed_kmh} 
                onChange={(e) => setEnvData({ ...envData, wind_speed_kmh: parseFloat(e.target.value) })} 
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CloudRain size={14} color="#06b6d4" /> Expected Rainfall (mm)
              </label>
              <input 
                type="number" 
                step="0.5" 
                className="form-control" 
                value={envData.rainfall_mm} 
                onChange={(e) => setEnvData({ ...envData, rainfall_mm: parseFloat(e.target.value) || 0 })} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('rainProbability')} ({envData.rain_probability_pct}%)</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5" 
                className="slider-control" 
                value={envData.rain_probability_pct} 
                onChange={(e) => setEnvData({ ...envData, rain_probability_pct: parseFloat(e.target.value) })} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>{t('cancel')}</button>
            <button type="submit" className="btn btn-primary">
              <Send size={15} /> {t('saveRunAnalysis')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
