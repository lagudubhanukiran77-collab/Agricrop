import React from 'react';
import { Droplet, Award, TrendingDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function WaterOptimizationCard({ summary }) {
  const { t } = useLanguage();
  const { total_water_used_liters = 36500, total_water_saved_liters = 14500, water_efficiency_pct = 82.5 } = summary || {};

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
        <Droplet size={18} color="var(--water-cyan)" /> {t('waterAnalyticsTitle')}
      </h3>

      <div className="grid-3">
        <div style={{ background: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.3)', padding: '1rem', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--water-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('totalWaterApplied')}</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {total_water_used_liters.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('liters')}</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Recorded historical irrigation</p>
        </div>

        <div style={{ background: 'rgba(82, 183, 136, 0.12)', border: '1px solid rgba(82, 183, 136, 0.3)', padding: '1rem', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-glow)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingDown size={13} /> {t('savedViaAI')}
          </span>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-light)', marginTop: '4px' }}>
            {total_water_saved_liters.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('liters')}</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--primary-glow)', marginTop: '2px' }}>Prevented over-irrigation & rain waste</p>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--status-medium)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Award size={13} /> {t('wueLabel')}
          </span>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {water_efficiency_pct}%
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Target &gt; 80.0% optimal</p>
        </div>
      </div>
    </div>
  );
}
