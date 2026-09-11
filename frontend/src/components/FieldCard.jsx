import React, { useState, useEffect } from 'react';
import { Droplets, Thermometer, Wind, Edit, Trash2, Cpu, RefreshCw, MapPin, Info, BrainCircuit } from 'lucide-react';
import { getFieldWeather } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';

export default function FieldCard({ field, onSelect, onOpenEnvModal, onEdit, onDelete }) {
  const { t } = useTranslation();
  const crop = field.crop || {};
  const env = field.latest_environment || {};

  const estimatedMoisture = env.soil_moisture_pct !== undefined ? env.soil_moisture_pct : 24.6;
  const initialTemp = env.temperature_c !== undefined ? env.temperature_c : 28;
  const humidity = env.humidity_pct !== undefined ? env.humidity_pct : 50;

  const [liveTemp, setLiveTemp] = useState(initialTemp);
  const [weatherCondition, setWeatherCondition] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const syncLiveTemperature = async () => {
    if (!field || !field.id) return;
    setLoadingWeather(true);
    try {
      const data = await getFieldWeather(field.id);
      if (data && data.temperature_c !== undefined) {
        setLiveTemp(data.temperature_c);
        setWeatherCondition(data.weather_condition || 'Partly Cloudy');
        setIsLive(data.status_badge?.includes('LIVE') || data.data_source?.includes('LIVE'));
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn(`Could not sync live weather for field ${field.id}:`, err);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    syncLiveTemperature();
    const interval = setInterval(() => {
      syncLiveTemperature();
    }, 60000);
    return () => clearInterval(interval);
  }, [field.id, field.latitude, field.longitude]);

  const fieldName = (field.name && field.name.trim().length >= 3) ? field.name : `Field Sector ${field.name || field.id}`;

  const getMoistureColor = (m) => {
    if (m < 20) return '#f87171'; // Red Critical
    if (m < 28) return '#fbbf24'; // Amber Moderate
    return '#34d399'; // Emerald Optimal
  };

  return (
    <div 
      className="glass-card" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justify: 'space-between', 
        gap: '1rem', 
        position: 'relative',
        border: '1.5px solid rgba(6, 182, 212, 0.35)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(6, 182, 212, 0.08)'
      }}
    >
      {/* Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>{fieldName}</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontWeight: 600 }}>
              <MapPin size={13} color="#06b6d4" />
              <span>{field.location_name || field.location || 'Sector 1'}</span>
              <span style={{ color: 'rgba(148, 163, 184, 0.4)' }}>•</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{field.area_hectares} {t('acres', 'Acres')}</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px' }} onClick={() => onEdit(field)}>
              <Edit size={13} color="#38bdf8" />
            </button>
            <button className="btn btn-outline btn-sm" style={{ padding: '4px 8px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }} onClick={() => onDelete(field.id)}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Live Weather Auto-Sync Badge */}
        <div style={{ marginTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <BrainCircuit size={14} color="#06b6d4" />
            <span>{t('estimatedSoilMoisture', 'Soil Moisture')}: <strong style={{ color: '#06b6d4', fontWeight: 800 }}>{t('aiEstimatedBadge', 'AI Estimated')}</strong></span>
          </div>

          <button 
            onClick={syncLiveTemperature} 
            disabled={loadingWeather}
            title="Auto Live Weather Sync"
            style={{
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              borderRadius: '12px',
              padding: '2px 9px',
              fontSize: '0.7rem',
              color: '#38bdf8',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{loadingWeather ? 'Syncing...' : t('liveTempAutoSync', 'Live Temp Auto-Sync')}</span>
            <RefreshCw size={10} className={loadingWeather ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Crop Information Pill */}
        {crop.crop_name && (
          <div style={{
            background: 'rgba(30, 41, 59, 0.75)',
            border: '1.5px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '10px',
            padding: '0.6rem 0.85rem',
            marginTop: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>{t('cardCrop', 'CROP')}</span>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                🌾 {crop.crop_name} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>({crop.variety || 'Hybrid'})</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>{t('cardStage', 'STAGE')}</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }}>{crop.growth_stage}</div>
            </div>
          </div>
        )}
      </div>

      {/* Environmental Live Parameters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.75)', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid rgba(6, 182, 212, 0.35)' }}>
        {/* Estimated Soil Moisture Box */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
            <Droplets size={13} color="#38bdf8" /> {t('estMoisture', 'Est. Moisture')}
            <span 
              title="Estimated using weather conditions, crop information, soil characteristics, irrigation history, and other available field data."
              style={{ cursor: 'help', color: '#94a3b8' }}
            >
              <Info size={11} />
            </span>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: getMoistureColor(estimatedMoisture), marginTop: '2px' }}>
            {estimatedMoisture}%
          </div>
          <div style={{ fontSize: '0.64rem', color: '#06b6d4', fontWeight: 800 }}>
            {t('aiEstimatedBadge', 'AI Estimated')}
          </div>
        </div>

        {/* Live Location Temperature Box */}
        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(6, 182, 212, 0.3)', borderRight: '1px solid rgba(6, 182, 212, 0.3)', background: 'rgba(249, 115, 22, 0.12)', borderRadius: '8px', padding: '2px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800 }}>
            <Thermometer size={13} color="#fbbf24" className="animate-bounce" /> {t('liveTempBox', 'Live Temp')}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
            {liveTemp}°C
          </div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
            {weatherCondition || 'Live Weather'}
          </div>
        </div>

        {/* Humidity Box */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700 }}>
            <Wind size={13} color="#38bdf8" /> {t('humidity', 'Humidity')}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
            {humidity}%
          </div>
          <div style={{ fontSize: '0.64rem', color: '#94a3b8', fontWeight: 600 }}>
            {t('relative', 'Relative')}
          </div>
        </div>
      </div>

      {/* Soil Moisture Progress Meter */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}>
          <span>{t('estimatedSoilMoisture', 'Estimated Soil Moisture')}</span>
          <span style={{ color: '#ffffff' }}>{estimatedMoisture}%</span>
        </div>
        <div style={{ width: '100%', height: '9px', background: 'rgba(30, 41, 59, 0.85)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
          <div style={{
            width: `${Math.min(100, (estimatedMoisture / (field.field_capacity || 40.0)) * 100)}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #06b6d4, #10b981)',
            borderRadius: '6px',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)'
          }} />
        </div>
        {lastUpdated && (
          <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px', textAlign: 'right', fontWeight: 600 }}>
            {t('syncedAt', 'Synced')}: {lastUpdated}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
        <button 
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
          onClick={() => onOpenEnvModal(field)}
        >
          {t('updateDataBtn', 'Update Data')}
        </button>
        <button 
          className="btn btn-primary btn-sm"
          style={{ flex: 1.5, justifyContent: 'center' }}
          onClick={() => onSelect(field)}
        >
          <Cpu size={14} />
          {t('analyzeAI', 'Analyze AI')}
        </button>
      </div>
    </div>
  );
}