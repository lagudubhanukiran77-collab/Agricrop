import React from 'react';
import { History, TrendingDown, Droplet, Plus } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function HistoryPage({ historyLogs, historySummary, onLogNewIrrigation }) {
  const { t } = useLanguage();

  const logs = historyLogs && historyLogs.length > 0 ? historyLogs : [
    { id: 1, date: '2026-09-10 06:30 AM', field_name: 'North Wheat Field', crop: 'Wheat', water_applied: '400 L', duration: '30 mins', water_saved: '85 L', status: 'Completed' },
    { id: 2, date: '2026-09-08 05:00 PM', field_name: 'East Rice Field', crop: 'Rice', water_applied: '600 L', duration: '45 mins', water_saved: '120 L', status: 'Completed' },
    { id: 3, date: '2026-09-06 07:00 AM', field_name: 'South Corn Field', crop: 'Corn', water_applied: '350 L', duration: '25 mins', water_saved: '70 L', status: 'Completed' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={24} color="#06b6d4" />
            {t('historyTitle', 'IRRIGATION HISTORY LOG & CUMULATIVE WATER SAVINGS')}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            {t('historySub', 'Audit trail of applied irrigation cycles, water volume, and FAO-56 cumulative savings.')}
          </p>
        </div>
        <button 
          onClick={onLogNewIrrigation}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} />
          <span>{t('logIrrigationBtn', '+ Log Irrigation')}</span>
        </button>
      </div>

      {/* Summary KPI Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', width: '100%' }}>
        <div className="glass-card">
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'monospace', display: 'block' }}>{t('totalCycles', 'TOTAL CYCLES')}</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>{t('sampleTotalCycles', '14 Irrigations')}</span>
        </div>
        <div className="glass-card">
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'monospace', display: 'block' }}>{t('totalWaterApplied', 'TOTAL WATER APPLIED')}</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>{t('sampleTotalWater', '6,800 Liters')}</span>
        </div>
        <div className="glass-card">
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'monospace', display: 'block' }}>{t('cumulativeSaved', 'CUMULATIVE SAVED')}</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#34d399', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>{t('sampleCumulativeSaved', '14,500 Liters')}</span>
        </div>
        <div className="glass-card">
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'monospace', display: 'block' }}>{t('waterEfficiency', 'WATER EFFICIENCY')}</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#06b6d4', fontFamily: 'monospace', marginTop: '4px', display: 'block' }}>{t('sampleWaterEfficiency', '82.5% Rate')}</span>
        </div>
      </div>

      {/* History Data Table */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'monospace', marginBottom: '1rem' }}>
          {t('recentLogRecord', 'RECENT IRRIGATION LOG RECORD')}
        </h3>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', textAlign: 'left', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.85)', color: '#38bdf8', borderBottom: '1px solid rgba(99, 102, 241, 0.25)', textTransform: 'uppercase', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                <th style={{ padding: '0.75rem 1rem' }}>{t('colDateTime', 'DATE & TIME')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('colFieldName', 'FIELD NAME')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('colCrop', 'CROP')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('colWaterApplied', 'WATER APPLIED')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('colDuration', 'DURATION')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('colWaterSaved', 'WATER SAVED')}</th>
                <th style={{ padding: '0.75rem 1rem' }}>{t('colStatus', 'STATUS')}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.1)', color: '#ffffff' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#94a3b8' }}>{log.date}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#ffffff' }}>{log.field_name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#38bdf8', fontWeight: 700 }}>{log.crop}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 800 }}>{log.water_applied}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#94a3b8' }}>{log.duration}</td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#34d399', fontWeight: 800 }}>+{log.water_saved}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '0.25rem 0.55rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', fontSize: '0.7rem', fontFamily: 'monospace', fontWeight: 800 }}>
                      {log.status === 'Completed' ? t('statusCompleted', 'Completed') : log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}