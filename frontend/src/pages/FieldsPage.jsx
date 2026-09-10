import React from 'react';
import { Grid, Plus, Edit3, Trash2, Cpu, MapPin } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function FieldsPage({ fields, onSelectField, onOpenEnvModal, onOpenFieldModal, onDeleteField, setActiveTab }) {
  const { t } = useLanguage();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Page Header */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Grid size={24} color="#06b6d4" />
            {t('fieldsPageTitle', 'Managed Farm Fields & Crop Specifications')}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
            {t('fieldsPageSub', 'Inspect, edit, or add new farm fields, soil physics parameters, and irrigation methods.')}
          </p>
        </div>
        <button 
          onClick={() => onOpenFieldModal(null)} 
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} />
          <span>+ Create New Field</span>
        </button>
      </div>

      {/* Fields Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', width: '100%' }}>
        {fields.map(field => {
          const crop = field.crop || {};
          const env = field.latest_environment || {};
          const moisture = env.soil_moisture_pct !== undefined ? env.soil_moisture_pct : 24.0;
          const isCritical = moisture < 23.0;

          return (
            <div key={field.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(99, 102, 241, 0.2)', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>{field.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <MapPin size={13} color="#06b6d4" />
                      📍 {field.location_name || field.location || 'D. Yerravaram'}
                    </span>
                  </div>
                  <span style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '20px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    background: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: isCritical ? '#f87171' : '#34d399',
                    border: `1px solid ${isCritical ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`
                  }}>
                    {isCritical ? 'CRITICAL STRESS' : 'OPTIMAL'}
                  </span>
                </div>

                {/* Field Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'rgba(15, 23, 42, 0.75)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', fontFamily: 'monospace' }}>AREA</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>{field.area_hectares} Acres</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', fontFamily: 'monospace' }}>CROP TYPE</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>{crop.crop_name || 'Wheat'}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', fontFamily: 'monospace' }}>SOIL TYPE</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>{field.soil_type} Soil</span>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', display: 'block', fontFamily: 'monospace' }}>IRRIGATION</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>{field.irrigation_method}</span>
                  </div>
                </div>

                {/* Soil Moisture Bar */}
                <div style={{ background: 'rgba(15, 23, 42, 0.75)', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800 }}>
                    <span style={{ color: '#94a3b8', fontFamily: 'monospace', textTransform: 'uppercase' }}>SOIL MOISTURE</span>
                    <span style={{ color: isCritical ? '#f87171' : '#34d399', fontFamily: 'monospace' }}>{moisture}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(30, 41, 59, 0.85)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        borderRadius: '6px', 
                        transition: 'all 0.5s ease',
                        width: `${Math.min(100, (moisture / 40.0) * 100)}%`,
                        background: isCritical ? '#f87171' : 'linear-gradient(90deg, #06b6d4, #10b981)' 
                      }} 
                    />
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <button 
                  onClick={() => {
                    if (onSelectField) onSelectField(field);
                    if (setActiveTab) setActiveTab('intelligence');
                  }} 
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Cpu size={14} />
                  <span>Run AI Analyzer</span>
                </button>
                <button 
                  onClick={() => onOpenFieldModal(field)} 
                  className="btn btn-outline btn-sm"
                  style={{ padding: '6px 10px', color: '#38bdf8' }}
                  title="Edit Field"
                >
                  <Edit3 size={15} />
                </button>
                <button 
                  onClick={() => onDeleteField(field.id)} 
                  className="btn btn-outline btn-sm"
                  style={{ padding: '6px 10px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  title="Delete Field"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}