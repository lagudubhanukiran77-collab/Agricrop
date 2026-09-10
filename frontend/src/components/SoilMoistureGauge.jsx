import React from 'react';
import { Droplet, Info } from 'lucide-react';

export default function SoilMoistureGauge({ currentMoisture = 22.0, wiltingPoint = 14.0, fieldCapacity = 32.0 }) {
  const current = Number(currentMoisture);
  const wp = Number(wiltingPoint);
  const fc = Number(fieldCapacity);

  let status = 'Optimal';
  let color = 'bg-emerald-500';
  let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';

  if (current <= wp) {
    status = 'CRITICAL (Soil Moisture Low)';
    color = 'bg-red-600';
    badgeStyle = 'bg-red-100 text-red-800 border-red-300';
  } else if (current < wp + 4) {
    status = 'WARNING (Approach Stress)';
    color = 'bg-orange-500';
    badgeStyle = 'bg-orange-100 text-orange-800 border-orange-300';
  }

  // Calculate percentage along scale 0 to 40%
  const pctPos = Math.min(100, Math.max(0, (current / 40.0) * 100));
  const wpPos = Math.min(100, Math.max(0, (wp / 40.0) * 100));
  const fcPos = Math.min(100, Math.max(0, (fc / 40.0) * 100));

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplet size={16} className="text-sky-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Soil Moisture Status
          </span>
        </div>
        <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badgeStyle}`}>
          {status}
        </span>
      </div>

      {/* Main Gauge Visual */}
      <div className="relative pt-6 pb-2">
        {/* Track */}
        <div className="w-full bg-slate-200 h-3 rounded-full relative overflow-hidden flex">
          <div className="h-full bg-red-300" style={{ width: `${wpPos}%` }} title="Dry to Wilting Point" />
          <div className="h-full bg-emerald-400" style={{ width: `${fcPos - wpPos}%` }} title="Optimal Moisture Range" />
          <div className="h-full bg-sky-300" style={{ width: `${100 - fcPos}%` }} title="Excess Moisture" />
        </div>

        {/* Current Marker Pointer */}
        <div 
          className="absolute top-1 transform -translate-x-1/2 flex flex-col items-center transition-all duration-300"
          style={{ left: `${pctPos}%` }}
        >
          <span className="text-[10px] font-extrabold bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
            Current: {current}%
          </span>
          <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
        </div>

        {/* Labels below track */}
        <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-3">
          <span>0% (Dry)</span>
          <span>14% (Moisture Stress)</span>
          <span>32% (Optimal Max)</span>
          <span>40% (Excess)</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 font-medium">
        <span className="flex items-center gap-1 text-sky-700 font-bold">
          <Info size={13} /> ML Estimated Soil Moisture
        </span>
        <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded">
          AI Prediction Active
        </span>
      </div>
    </div>
  );
}