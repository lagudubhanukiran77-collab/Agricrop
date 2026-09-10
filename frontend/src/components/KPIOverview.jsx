import React from 'react';
import { Grid, AlertTriangle, Droplets, TrendingDown, Gauge } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function KPIOverview({ totalFields, requiringIrrigation, avgMoisture, waterSaved, waterEfficiency }) {
  const { t } = useLanguage();

  const cards = [
    {
      label: 'ACTIVE FIELDS',
      val: totalFields || 2,
      sub: `${(totalFields || 2) - (requiringIrrigation || 1)} Healthy • ${requiringIrrigation || 1} Action Req`,
      icon: Grid,
      iconBg: 'bg-emerald-100 text-emerald-700',
      textColor: 'text-slate-900'
    },
    {
      label: 'FIELDS NEEDING WATER',
      val: requiringIrrigation || 1,
      sub: (requiringIrrigation || 1) > 0 ? 'Hydration scheduled' : 'All optimal',
      icon: AlertTriangle,
      iconBg: (requiringIrrigation || 1) > 0 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600',
      textColor: (requiringIrrigation || 1) > 0 ? 'text-red-600' : 'text-emerald-700'
    },
    {
      label: 'AVG SOIL MOISTURE',
      val: `${avgMoisture || 22.8}%`,
      sub: 'ML Estimated Average',
      icon: Droplets,
      iconBg: 'bg-sky-100 text-sky-600',
      textColor: 'text-slate-900'
    },
    {
      label: 'WATER SAVED',
      val: `${waterSaved || '3.3K'} L`,
      sub: '↑ 13% vs previous season',
      icon: TrendingDown,
      iconBg: 'bg-teal-100 text-teal-700',
      textColor: 'text-emerald-700'
    },
    {
      label: 'WATER EFFICIENCY',
      val: `${waterEfficiency || 88}%`,
      sub: 'FAO-56 Optimized Rate',
      icon: Gauge,
      iconBg: 'bg-indigo-100 text-indigo-700',
      textColor: 'text-indigo-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.iconBg}`}>
                <Icon size={16} />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-extrabold ${c.textColor} tracking-tight`}>{c.val}</div>
              <div className="text-[11px] font-medium text-slate-500 mt-1">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}