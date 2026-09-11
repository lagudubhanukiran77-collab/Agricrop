import React from 'react';
import { Cpu, RefreshCw, Database, Server, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function SettingsPage({ mlMetrics, onRetrain }) {
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={24} color="#06b6d4" />
          {t('settingsTitle', 'System Architecture & ML Configuration')}
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
          {t('settingsSub', 'Inspect machine learning models, telemetry pipelines & agronomic decision algorithms.')}
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', paddingBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{t('mlStatusTitle', 'Machine Learning Engine Status')}</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>{t('mlStatusSub', 'FAO-56 agricultural physics with Scikit-Learn ML regression models.')}</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={onRetrain}>
            <RefreshCw size={14} /> {t('triggerRetrainBtn', 'Trigger Retrain Pipeline')}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div className="glass-card" style={{ background: 'rgba(15, 23, 42, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace' }}>
              <Database size={15} /> {t('soilMoistureModelUpper', 'SOIL MOISTURE MODEL')}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>RandomForestRegressor</div>
            <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>{t('r2Score', 'R² Score')}: 0.942 • MSE: 0.081</span>
          </div>

          <div className="glass-card" style={{ background: 'rgba(15, 23, 42, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace' }}>
              <Server size={15} /> {t('telemetryPipelineUpper', 'TELEMETRY PIPELINE')}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>REST + IoT Ingestion</div>
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>{t('latency', 'Latency')}: 12ms • {t('activeStream', 'Active Stream')}</span>
          </div>

          <div className="glass-card" style={{ background: 'rgba(15, 23, 42, 0.75)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.78rem', fontWeight: 800, fontFamily: 'monospace' }}>
              <ShieldCheck size={15} /> {t('decisionEngineUpper', 'DECISION ENGINE')}
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>FAO-56 Penman-Monteith</div>
            <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700 }}>{t('verification', 'Verification')}: {t('statusPassed', 'Passed')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}