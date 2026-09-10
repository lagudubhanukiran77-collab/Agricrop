import React from 'react';
import { Grid, AlertTriangle, Droplets, TrendingDown, Gauge } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function FloatingKPIBar({ totalFields, requiringIrrigation, avgMoisture, waterSaved, waterEfficiency }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: 'ACTIVE FIELDS',
      val: totalFields || 2,
      sub: `${(totalFields || 2) - (requiringIrrigation || 1)} Healthy • ${requiringIrrigation || 1} Action Req`,
      icon: Grid,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      textColor: 'text-white'
    },
    {
      label: 'FIELDS NEEDING WATER',
      val: requiringIrrigation || 1,
      sub: (requiringIrrigation || 1) > 0 ? 'Hydration scheduled' : 'All optimal',
      icon: AlertTriangle,
      iconBg: (requiringIrrigation || 1) > 0 ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      textColor: (requiringIrrigation || 1) > 0 ? 'text-red-400' : 'text-emerald-400'
    },
    {
      label: 'AVG SOIL MOISTURE',
      val: `${avgMoisture || 22.8}%`,
      sub: 'ML Estimated Average',
      icon: Droplets,
      iconBg: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
      textColor: 'text-white'
    },
    {
      label: 'WATER SAVED',
      val: `${waterSaved || '3.3K'} L`,
      sub: '↑ 13% vs previous season',
      icon: TrendingDown,
      iconBg: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
      textColor: 'text-emerald-400'
    },
    {
      label: 'WATER EFFICIENCY',
      val: `${waterEfficiency || 88}%`,
      sub: 'FAO-56 Optimized Rate',
      icon: Gauge,
      iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
      textColor: 'text-indigo-300'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="glass-card flex flex-col justify-between border-emerald-900/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider font-mono">{c.label}</span>
              <div className={`p-1.5 rounded-lg border ${c.iconBg}`}>
                <Icon size={15} />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-extrabold ${c.textColor} tracking-tight font-mono`}>{c.val}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-1">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}