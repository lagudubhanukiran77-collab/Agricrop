import React from 'react';
import { MapPin, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function DashboardHero({ user }) {
  const { t } = useLanguage();
  const farmerName = user?.name || 'Bhanu';
  const location = user?.location || 'West Godavari, Andhra Pradesh';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Left 2 Cols: Greeting & Farmer Profile */}
      <div className="lg:col-span-2 bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-6 shadow-md border border-emerald-900/40 relative overflow-hidden flex flex-col justify-between">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles size={13} className="text-emerald-400" />
            <span>AI Field Monitoring Active</span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-1 text-white">
            Good morning, {farmerName} 👋
          </h2>

          <p className="text-xs lg:text-sm text-slate-300 font-medium mb-4">
            Your fields are being actively monitored by AgriCrop AI agronomic engine.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
            <MapPin size={15} className="text-emerald-400" />
            <span>{location}</span>
          </div>
          <div className="text-slate-600">•</div>
          <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
            <ShieldCheck size={15} className="text-sky-400" />
            <span>Farmer Status: Precision Farmer</span>
          </div>
        </div>
      </div>

      {/* Right 1 Col: AI Field Health Score */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            AI FIELD HEALTH SCORE
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            ● Stable
          </span>
        </div>

        <div className="flex items-baseline gap-2 my-1">
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">86</span>
          <span className="text-sm font-bold text-slate-400">/ 100</span>
        </div>

        <div className="space-y-2 mt-3 text-xs">
          <div>
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span>Water Efficiency</span>
              <span className="text-emerald-600">87%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '87%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span>Crop Health Index</span>
              <span className="text-teal-600">91%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: '91%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-bold text-slate-700 mb-1">
              <span>Irrigation Readiness</span>
              <span className="text-sky-600">78%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}