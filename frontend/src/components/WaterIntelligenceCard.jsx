import React from 'react';
import { Droplet, Database, RefreshCw, BarChart2 } from 'lucide-react';

export default function WaterIntelligenceCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Water Intelligence & Storage Capacity
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500">Reservoir Budget</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 text-[10px] font-bold block">RESERVOIR CAPACITY</span>
          <span className="font-extrabold text-slate-900 text-base">50,000 L</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] font-bold block">AVAILABLE WATER</span>
          <span className="font-extrabold text-sky-600 text-base">42,000 L</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] font-bold block">TODAY REQUIREMENT</span>
          <span className="font-extrabold text-slate-900 text-base">3,800 L</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] font-bold block">7-DAY PROJECTED</span>
          <span className="font-extrabold text-indigo-600 text-base">19,500 L</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] font-bold block">WATER SAVED</span>
          <span className="font-extrabold text-emerald-600 text-base">3.3K L</span>
        </div>
      </div>

      {/* Horizontal Water Capacity Bar */}
      <div>
        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
          <span>AVAILABLE STORAGE</span>
          <span className="text-sky-600">84% Capacity</span>
        </div>
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-teal-500 h-full rounded-full" style={{ width: '84%' }} />
        </div>
      </div>
    </div>
  );
}