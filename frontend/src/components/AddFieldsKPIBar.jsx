import React from 'react';
import { Grid, AlertTriangle, Droplet, TrendingDown, Gauge } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function AddFieldsKPIBar({ totalFields, requiringIrrigation, avgMoisture, waterSaved, waterEfficiency }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: '1. MANAGED FIELDS',
      val: `${totalFields || 2} Fields`,
      sub: `${(totalFields || 2) - (requiringIrrigation || 1)} Healthy • ${requiringIrrigation || 1} Action Req`,
      icon: Grid,
      iconColor: '#34d399'
    },
    {
      label: '2. ACTION REQUIRED',
      val: `${requiringIrrigation || 1} Fields`,
      sub: (requiringIrrigation || 1) > 0 ? 'Hydration scheduled' : 'All optimal',
      icon: AlertTriangle,
      iconColor: (requiringIrrigation || 1) > 0 ? '#ef4444' : '#34d399'
    },
    {
      label: '3. STORAGE CAPACITY',
      val: '50.0k Liters',
      sub: 'Reservoir available',
      icon: Droplet,
      iconColor: '#38bdf8'
    },
    {
      label: '4. CUMULATIVE SAVED',
      val: '14.5k Liters',
      sub: 'WUE: 82.5% efficiency',
      icon: TrendingDown,
      iconColor: '#34d399'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="add-fields-card flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#09130e] border border-emerald-500/30 flex items-center justify-center">
              <Icon size={20} color={c.iconColor} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono">{c.label}</div>
              <div className="text-lg font-extrabold text-white tracking-tight font-mono">{c.val}</div>
              <div className="text-[11px] font-medium text-slate-300">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}