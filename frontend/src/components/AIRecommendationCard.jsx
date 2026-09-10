import React from 'react';
import { Cpu, ArrowRight, Droplets, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AIRecommendationCard({ onIrrigate, onSchedule }) {
  return (
    <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-700/40 relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Cpu size={20} />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
                AI Recommendation
              </span>
              <h3 className="text-lg font-bold text-white">Irrigation Recommended</h3>
            </div>
          </div>
          <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-xs font-extrabold">
            Critical Condition
          </span>
        </div>

        <p className="text-xs text-slate-300 font-medium mb-5 leading-relaxed">
          Field 01 (North Wheat Field) is experiencing critical moisture stress. Immediate hydration recommended.
        </p>

        {/* Metrics Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-emerald-900/60 mb-5 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Recommended Depth</span>
            <span className="text-base font-extrabold text-white">18–22 mm</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Water Volume</span>
            <span className="text-base font-extrabold text-sky-400">330–400 L</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration</span>
            <span className="text-base font-extrabold text-teal-400">25–30 mins</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Moisture Recovery</span>
            <span className="text-base font-extrabold text-emerald-400">+6–8%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
          <CheckCircle2 size={15} />
          <span>FAO-56 Water Stress Model Verified</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onSchedule}
            className="btn btn-outline btn-sm text-xs font-bold text-slate-200 border-slate-700 hover:bg-slate-800"
          >
            View Smart Schedule
          </button>

          <button 
            onClick={onIrrigate}
            className="btn btn-emerald btn-sm text-xs font-bold"
          >
            <span>Irrigate Now</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}