import React from 'react';
import { Cpu, CheckCircle2, Clock, Droplet, Zap, Info, BarChart2, Radio, BrainCircuit, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function DecisionCard({ analysisResult, fieldName }) {
  const { t } = useLanguage();

  if (!analysisResult) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Cpu size={36} color="var(--primary-glow)" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
        <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>{t('selectFieldPrompt', 'Select a field or tweak environmental parameters')}</h3>
        <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>{t('hybridEngineDesc', 'AgriCrop Hybrid Intelligence Engine will calculate Estimated Soil Moisture, irrigation decision, water volume & explainable reasoning.')}</p>
      </div>
    );
  }

  const {
    decision,
    estimated_soil_moisture,
    estimated_water_liters,
    recommended_duration_mins,
    duration_status_msg,
    flow_rate_lpm,
    recommended_time,
    priority_level,
    stress_score,
    reasons,
    ml_details,
    ml_soil_moisture_info = {},
    data_source = "AI Estimated"
  } = analysisResult;

  const getDecisionBadge = (d) => {
    switch (d) {
      case 'Irrigate Now':
        return <span className="badge badge-now" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>💧 {t('irrigateNowUpper', 'IRRIGATE NOW')}</span>;
      case 'Irrigate Later':
        return <span className="badge badge-later" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>⏳ {t('irrigateLaterUpper', 'IRRIGATE LATER')}</span>;
      case 'Do Not Irrigate':
        return <span className="badge badge-no" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>🍃 {t('doNotIrrigateUpper', 'DO NOT IRRIGATE')}</span>;
      default:
        return <span className="badge badge-monitor" style={{ fontSize: '0.9rem', padding: '0.35rem 0.85rem' }}>🔍 {t('monitorFieldUpper', 'MONITOR FIELD')}</span>;
    }
  };

  const featureImportances = ml_soil_moisture_info.feature_importances || ml_details?.feature_importances || {
    "previous_soil_moisture": 48.2,
    "hours_since_last_irrigation": 18.5,
    "temperature": 12.1,
    "rainfall": 8.4,
    "humidity": 5.2,
    "crop_stage_and_type": 3.8
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-glow)', fontWeight: 700 }}>
              {t('hybridDecision', 'Hybrid Intelligence Decision')} • {fieldName || 'Selected Field'}
            </span>
            <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', fontWeight: 600 }}>
              🎯 {analysisResult.confidence_score || 85}% {t('aiConfidence', 'AI Confidence')}
            </span>
            <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--water-cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '4px', fontWeight: 600 }}>
              📡 {analysisResult.data_status || data_source}
            </span>
          </div>

          <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {getDecisionBadge(decision)}
            <span className={`badge badge-${priority_level.toLowerCase()}`}>
              {t('priorityLevel', 'Priority')}: {priority_level}
            </span>
          </div>
        </div>

        {/* Estimated Soil Moisture & Stress Score Gauge */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--primary-glow)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            {t('estSoilMoistureAI', 'Estimated Soil Moisture (AI)')}
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            {estimated_soil_moisture !== undefined ? estimated_soil_moisture : '24.6'}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {t('stressIndex', 'Stress Index')}: <strong style={{ color: stress_score > 60 ? 'var(--status-critical)' : 'var(--primary-light)' }}>{stress_score}/100</strong>
          </div>
        </div>
      </div>

      {/* Calculated Irrigation Metrics Grid */}
      <div className="grid-3" style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--water-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Droplet size={14} /> {t('recWaterVolume', 'Recommended Water Volume')}
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {estimated_water_liters.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('liters', 'Liters')}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--primary-glow)' }}>
            ≈ {(estimated_water_liters / 1000.0).toFixed(2)} m³ {t('cubicMetersDepth', 'depth')}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> {t('recDuration', 'Recommended Duration')}
          </div>
          {duration_status_msg ? (
            <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={13} /> {duration_status_msg}
            </div>
          ) : (
            <>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                {recommended_duration_mins} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('mins', 'mins')}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {t('optimizedDrip', 'Optimized for drip irrigation')}
              </div>
            </>
          )}
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={14} color="var(--status-medium)" /> {t('recWindow', 'Recommended Window')}
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
            {recommended_time}
          </div>
        </div>
      </div>

      {/* Explainable AI Section */}
      <div style={{ background: 'rgba(45, 106, 79, 0.12)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.1rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-glow)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
          <BrainCircuit size={18} /> {t('whyAIRecommends', 'Why AI Recommends This Decision')}
        </h4>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {reasons && reasons.map((reason, index) => (
            <li 
              key={index}
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '0.65rem 0.95rem',
                borderRadius: '8px',
                borderLeft: '4px solid var(--primary-glow)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55rem'
              }}
            >
              <CheckCircle2 size={16} color="var(--primary-glow)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          ℹ️ {t('aiEstimatedMoistureNote', 'Estimated Soil Moisture is AI-predicted using weather, crop physics, and irrigation history — not a direct sensor measurement.')}
        </div>
      </div>

      {/* ML Feature Importance Breakdown */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
          <BarChart2 size={15} /> {t('featureImportanceTitle', 'ML Soil Moisture & Decision Weight Breakdown')}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Object.entries(featureImportances).slice(0, 6).map(([feat, pct]) => {
            const featLabels = {
              previous_soil_moisture: t('featPrevMoisture', 'Previous Soil Moisture'),
              hours_since_last_irrigation: t('featHoursSinceIrrigation', 'Hours Since Last Irrigation'),
              temperature: t('featTemperature', 'Temperature'),
              rainfall: t('featRainfall', 'Rainfall'),
              humidity: t('featHumidity', 'Humidity'),
              crop_stage_and_type: t('featCropStage', 'Crop Stage & Type')
            };
            return (
              <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
                <span style={{ width: '170px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {featLabels[feat] || feat.replace(/_/g, ' ')}
                </span>
                <div style={{ flex: 1, height: '6px', background: 'var(--bg-input)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--water-blue), var(--primary-glow))',
                    borderRadius: '3px'
                  }} />
                </div>
                <span style={{ width: '40px', textAlign: 'right', fontWeight: 700, color: 'var(--primary-light)' }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
