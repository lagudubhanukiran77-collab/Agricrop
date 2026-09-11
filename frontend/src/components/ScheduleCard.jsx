import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function ScheduleCard({ scheduleItems, onSelectField }) {
  const { t } = useLanguage();

  if (!scheduleItems || scheduleItems.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Calendar size={28} color="var(--primary-glow)" style={{ marginBottom: '0.5rem' }} />
        <p style={{ fontSize: '0.88rem' }}>{t('noPendingIrrigation')}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
        <Calendar size={18} color="var(--primary-glow)" /> {t('dynamicSchedule')}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {scheduleItems.map((item, index) => (
          <div
            key={index}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0.9rem 1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                  {item.field_name}
                </span>
                <span className={`badge badge-${item.priority.toLowerCase()}`}>
                  {(item.priority.toLowerCase() === 'critical' ? t('severityCritical', 'Critical') : item.priority.toLowerCase() === 'high' ? t('severityHigh', 'High') : item.priority.toLowerCase() === 'medium' ? t('severityMedium', 'Medium') : t('severityLow', 'Low'))} {t('priority')}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  🌾 {item.crop_name}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                {item.reason}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {item.recommended_date} • {item.recommended_time}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--water-cyan)', marginTop: '2px' }}>
                  💧 {item.estimated_water_liters.toLocaleString()} L ({item.duration_minutes} {t('mins', 'mins')})
                </div>
              </div>

              <button
                className="btn btn-outline btn-sm"
                onClick={() => onSelectField && onSelectField(item.field_id)}
              >
                {t('inspect')} <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
