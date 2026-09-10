import React from 'react';
import { History, PlusCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function HistoryTable({ logs, onLogNewIrrigation }) {
  const { t } = useLanguage();
  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <History size={18} color="var(--primary-glow)" /> {t('historyLogTitle')}
        </h3>

        {onLogNewIrrigation && (
          <button className="btn btn-outline btn-sm" onClick={onLogNewIrrigation}>
            <PlusCircle size={14} /> {t('logCompletedIrrigation')}
          </button>
        )}
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('colDate')}</th>
              <th>{t('colFieldId')}</th>
              <th>{t('colWaterApplied')}</th>
              <th>{t('colDuration')}</th>
              <th>{t('colMethod')}</th>
              <th>{t('colSoilMoistureBefore')}</th>
              <th>{t('colAiRecommendation')}</th>
              <th>{t('colActualAction')}</th>
              <th>{t('colWaterSaved')}</th>
            </tr>
          </thead>
          <tbody>
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 700 }}>{log.date}</td>
                  <td>Field #{log.field_id}</td>
                  <td style={{ color: 'var(--water-cyan)', fontWeight: 700 }}>
                    {log.water_quantity_liters.toLocaleString()} L
                  </td>
                  <td>{log.duration_minutes} mins</td>
                  <td>{log.method}</td>
                  <td>{log.soil_moisture_before_pct ? `${log.soil_moisture_before_pct}%` : 'N/A'}</td>
                  <td>
                    <span className={`badge ${log.ai_recommendation === 'Irrigate Now' ? 'badge-now' : 'badge-no'}`}>
                      {log.ai_recommendation || 'Irrigate Now'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>{log.actual_action}</td>
                  <td style={{ color: 'var(--primary-glow)', fontWeight: 700 }}>
                    +{log.water_saved_liters.toLocaleString()} L
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  {t('noHistoryLogs')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
