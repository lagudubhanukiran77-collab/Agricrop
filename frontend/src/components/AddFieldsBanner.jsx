import React from 'react';
import { Sprout, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function AddFieldsBanner({ user, totalFields, healthyFields, requiringIrrigation }) {
  const { t } = useLanguage();
  const farmerName = user?.name || 'Ramesh Patel';
  const location = user?.location || 'D. Yerravaram, East Godavari';

  return (
    <div className="add-fields-panel flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>🌱 AgriCrop AI Precision Engine Active</span>
        </div>

        <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
          Good morning, {farmerName} 👋
        </h2>

        <p className="text-xs text-slate-300 font-medium mt-1">
          Managing {totalFields} fields ({healthyFields} healthy • {requiringIrrigation} requiring irrigation). Soil physics & ML predictions active.
        </p>

        <div className="flex items-center gap-3 text-xs text-emerald-300 font-bold mt-3">
          <span className="flex items-center gap-1">
            <MapPin size={14} className="text-emerald-400" />
            <span>📍 {location}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-300 font-mono text-[11px]">GPS: 17.185° N, 81.968° E</span>
        </div>
      </div>

      <div className="bg-[#0d2c20] border border-emerald-500/30 p-4 rounded-xl flex flex-col justify-between min-w-[220px]">
        <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono mb-1">
          AI FIELD HEALTH SCORE
        </div>
        <div className="text-3xl font-extrabold text-white font-mono">
          86 <span className="text-xs text-slate-400 font-normal">/ 100</span>
        </div>
        <div className="text-xs text-emerald-400 font-bold mt-2 flex items-center justify-between">
          <span>Water Efficiency</span>
          <span className="font-mono">87%</span>
        </div>
        <div className="w-full bg-[#09130e] h-1.5 rounded-full overflow-hidden mt-1 border border-emerald-900/50">
          <div className="bg-emerald-500 h-full rounded-full" style={{ width: '87%' }} />
        </div>
      </div>
    </div>
  );
}