import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function SchedulePage({ schedule, onSelectField, setActiveTab }) {
  const { t } = useLanguage();

  const mockSchedule = schedule && schedule.length > 0 ? schedule : [
    { id: 1, field_name: 'North Wheat Field', crop: 'Wheat', time: '06:30 AM', duration: '30 mins', volume: '400 L', status: 'CRITICAL - HYDRATION NOW', urgency: 'now' },
    { id: 2, field_name: 'East Rice Field', crop: 'Rice', time: '05:00 PM', duration: '20 mins', volume: '250 L', status: 'SCHEDULED - EVENING', urgency: 'later' },
    { id: 3, field_name: 'South Corn Field', crop: 'Corn', time: 'Tomorrow 06:00 AM', duration: '15 mins', volume: '200 L', status: 'OPTIMAL - MONITOR ONLY', urgency: 'no' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Page Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={24} color="#06b6d4" />
          {t('scheduleTimelineTitle', 'SMART IRRIGATION TIMELINE & AUTOMATED SCHEDULE')}
        </h2>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
          {t('scheduleTimelineSub', 'Automated irrigation schedules calculated to avoid peak heat evaporation and optimize water efficiency.')}
        </p>
      </div>

      {/* Schedule Timeline Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
        {mockSchedule.map(item => {
          const getStatusText = () => {
            if (item.urgency === 'now') return t('urgencyNow', 'CRITICAL - HYDRATION NOW');
            if (item.urgency === 'later') return t('urgencyLater', 'SCHEDULED - EVENING');
            return t('urgencyNo', 'OPTIMAL - MONITOR ONLY');
          };

          return (
            <div key={item.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1.15rem 1.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  padding: '0.75rem',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: item.urgency === 'now' ? 'rgba(239, 68, 68, 0.15)' : item.urgency === 'later' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: item.urgency === 'now' ? '#f87171' : item.urgency === 'later' ? '#fbbf24' : '#34d399',
                  border: `1px solid ${item.urgency === 'now' ? 'rgba(239, 68, 68, 0.35)' : item.urgency === 'later' ? 'rgba(251, 191, 36, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`
                }}>
                  <Clock size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{item.field_name}</h3>
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>({item.crop})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span>⏰ {t('scheduledTime', 'Scheduled:')} <strong style={{ color: '#ffffff' }}>{item.time}</strong></span>
                    <span style={{ color: 'rgba(148, 163, 184, 0.3)' }}>•</span>
                    <span>⏱ {t('duration', 'Duration:')} <strong style={{ color: '#38bdf8' }}>{item.duration}</strong></span>
                    <span style={{ color: 'rgba(148, 163, 184, 0.3)' }}>•</span>
                    <span>💧 {t('water', 'Water:')} <strong style={{ color: '#34d399' }}>{item.volume}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <span style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  background: item.urgency === 'now' ? 'rgba(239, 68, 68, 0.15)' : item.urgency === 'later' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: item.urgency === 'now' ? '#f87171' : item.urgency === 'later' ? '#fbbf24' : '#34d399',
                  border: `1px solid ${item.urgency === 'now' ? 'rgba(239, 68, 68, 0.35)' : item.urgency === 'later' ? 'rgba(251, 191, 36, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`
                }}>
                  {getStatusText()}
                </span>
                <button 
                  onClick={() => {
                    if (onSelectField) onSelectField(item.id);
                    if (setActiveTab) setActiveTab('intelligence');
                  }} 
                  className="btn btn-primary btn-sm"
                >
                  <span>{t('inspect', 'Inspect')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}