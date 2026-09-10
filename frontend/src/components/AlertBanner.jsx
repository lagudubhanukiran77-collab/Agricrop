import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function AlertBanner({ alerts, onResolveAlert }) {
  const unresolved = alerts.filter(a => !a.is_resolved);
  if (unresolved.length === 0) return null;

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'Critical':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', color: '#ef4444', icon: AlertTriangle };
      case 'High':
        return { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', color: '#f97316', icon: AlertCircle };
      case 'Medium':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b', icon: Info };
      default:
        return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', color: '#3b82f6', icon: Info };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
      {unresolved.slice(0, 3).map(alert => {
        const style = getSeverityStyle(alert.severity);
        const Icon = style.icon;

        return (
          <div
            key={alert.id}
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderRadius: '12px',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Icon size={20} color={style.color} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: style.color }}>
                    {alert.title}
                  </span>
                  <span className={`badge badge-${alert.severity.toLowerCase()}`}>
                    {alert.severity}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', marginTop: '2px' }}>
                  {alert.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => onResolveAlert(alert.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '0.35rem 0.7rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <CheckCircle size={13} />
              Resolve
            </button>
          </div>
        );
      })}
    </div>
  );
}
