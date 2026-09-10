import React from 'react';
import { Grid, Droplet, AlertTriangle, TrendingDown, ArrowRight } from 'lucide-react';
import FieldCard from '../components/FieldCard';
import AlertBanner from '../components/AlertBanner';
import ScheduleCard from '../components/ScheduleCard';
import WelcomeBanner from '../components/WelcomeBanner';
import { useLanguage } from '../i18n/LanguageContext';

export default function Dashboard({ user, fields, alerts, schedule, historySummary, onSelectField, onOpenEnvModal, onOpenFieldModal, onResolveAlert, setActiveTab }) {
  const { t } = useLanguage();
  const totalFields = fields.length;
  
  const requiringIrrigation = fields.filter(f => {
    const m = f.latest_environment?.soil_moisture_pct || 25;
    return m < 25;
  }).length;
  
  const healthyFields = totalFields - requiringIrrigation;
  const totalWaterAvailable = fields.reduce((acc, f) => acc + (f.available_water_liters || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Time-Based Farmer Welcome Banner */}
      <WelcomeBanner 
        user={user} 
        totalFields={totalFields}
        healthyFields={healthyFields}
        requiringIrrigation={requiringIrrigation}
      />

      {/* Top Banner Alerts */}
      <AlertBanner alerts={alerts} onResolveAlert={onResolveAlert} />

      {/* KPI Cards Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', width: '100%' }}>
        {/* KPI 1: Managed Fields */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1.5px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.75rem', borderRadius: '14px', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.35)' }}>
            <Grid size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              {t('kpiManagedFields', 'Managed Fields')}
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
              {totalFields} {totalFields === 1 ? t('fieldSingular', 'Field') : t('fieldPlural', 'Fields')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>
              {healthyFields} {t('healthy', 'Healthy')} • {requiringIrrigation} {t('actionRequired', 'Action Required')}
            </div>
          </div>
        </div>

        {/* KPI 2: Action Required Fields */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1.5px solid rgba(239, 68, 68, 0.35)' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '0.75rem', borderRadius: '14px', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)' }}>
            <AlertTriangle size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              {t('kpiActionRequired', 'Irrigation Action Required')}
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: requiringIrrigation > 0 ? '#f87171' : '#34d399' }}>
              {requiringIrrigation} {requiringIrrigation === 1 ? t('fieldSingular', 'Field') : t('fieldPlural', 'Fields')}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              {requiringIrrigation > 0 ? t('hydrationScheduled', 'Hydration scheduled') : t('allFieldsOptimal', 'All fields optimal')}
            </div>
          </div>
        </div>

        {/* KPI 3: Available Water Storage */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1.5px solid rgba(56, 189, 248, 0.35)' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.75rem', borderRadius: '14px', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
            <Droplet size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              {t('kpiStorageAvailable', 'Storage Available')}
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
              {(totalWaterAvailable / 1000).toFixed(0)}k <span style={{ fontSize: '0.85rem', color: '#38bdf8' }}>{t('liters', 'Liters')}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>{t('reservoirCapacity', 'Reservoir capacity')}</div>
          </div>
        </div>

        {/* KPI 4: Cumulative Water Saved */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1.5px solid rgba(16, 185, 129, 0.35)' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '14px', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
            <TrendingDown size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
              {t('kpiCumulativeSaved', 'Cumulative Saved')}
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff' }}>
              {((historySummary?.total_water_saved_liters || 14500) / 1000).toFixed(1)}k <span style={{ fontSize: '0.85rem', color: '#10b981' }}>L</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>WUE: {historySummary?.water_efficiency_pct || 82.5}% efficiency</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', width: '100%' }}>
        {/* Active Field Status & Soil Moisture Section Container with Border */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1.5px solid rgba(6, 182, 212, 0.4)', borderRadius: '18px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(6, 182, 212, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(6, 182, 212, 0.25)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Grid size={22} color="#06b6d4" /> {t('activeFieldStatus', 'Active Field Status & Soil Moisture')}
            </h2>
            <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('fields')}>
              {t('viewAllFields', 'View All Fields')} <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {fields.map(field => (
              <FieldCard 
                key={field.id}
                field={field}
                onSelect={(f) => {
                  onSelectField(f);
                  setActiveTab('intelligence');
                }}
                onOpenEnvModal={onOpenEnvModal}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>

        <div>
          <ScheduleCard 
            scheduleItems={schedule} 
            onSelectField={(id) => {
              const f = fields.find(field => field.id === id);
              if (f) onSelectField(f);
              setActiveTab('intelligence');
            }} 
          />
        </div>
      </div>
    </div>
  );
}