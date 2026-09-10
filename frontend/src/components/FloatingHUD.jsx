import React from 'react';
import { MapPin, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function FloatingHUD({ user }) {
  const { t } = useLanguage();
  const farmerName = user?.name || 'Ramesh Patel';
  const location = user?.location || 'D. Yerravaram, East Godavari';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
      {/* Farmer Welcome HUD */}
      <div className="lg:col-span-2 glass-floating p-5 relative overflow-hidden flex flex-col justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles size={13} className="text-emerald-400" />
            <span>AI Field GIS Engine Active</span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-1 text-white">
            Good morning, {farmerName} 👋
          </h2>

          <p className="text-xs lg:text-sm text-slate-300 font-medium mb-4">
            Real-time ML soil moisture & FAO-56 evapotranspiration monitoring online.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-emerald-900/40">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
            <MapPin size={15} className="text-emerald-400" />
            <span>📍 {location}</span>
          </div>
          <div className="text-slate-700">•</div>
          <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
            <ShieldCheck size={15} className="text-sky-400" />
            <span>Registered Precision Farmer</span>
          </div>
        </div>
      </div>

      {/* AI Health Score HUD */}
      <div className="glass-floating p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 font-mono">
            AI FIELD HEALTH SCORE
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            ● Optimal
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-1">
          <span className="text-4xl font-extrabold text-white tracking-tight font-mono">86</span>
          <span className="text-sm font-bold text-slate-400">/ 100</span>
        </div>

        <div className="space-y-2 mt-2 text-xs">
          <div>
            <div className="flex justify-between font-bold text-slate-300 mb-1">
              <span>Water Efficiency</span>
              <span className="text-emerald-400">87%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-emerald-900/40">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '87%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-slate-300 mb-1">
              <span>Crop Health Index</span>
              <span className="text-teal-400">91%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-teal-900/40">
              <div className="bg-teal-400 h-full rounded-full" style={{ width: '91%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}