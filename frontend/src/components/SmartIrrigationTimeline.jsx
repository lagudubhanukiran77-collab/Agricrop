import React from 'react';
import { Calendar, Clock, CheckCircle2, Play, Sparkles } from 'lucide-react';

export default function SmartIrrigationTimeline({ onOptimize }) {
  const events = [
    { time: '06:00 AM', field: 'Field 01 (North Wheat)', depth: '18 mm', status: 'Recommended', badge: 'bg-orange-100 text-orange-800 border-orange-300' },
    { time: '08:30 AM', field: 'Field 02 (East Rice)', depth: '12 mm', status: 'Scheduled', badge: 'bg-sky-100 text-sky-800 border-sky-300' },
    { time: '06:00 PM', field: 'Field 01 (North Wheat)', depth: '10 mm', status: 'Completed', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Smart Irrigation Schedule Timeline
          </h3>
        </div>
        <button 
          onClick={onOptimize}
          className="btn btn-emerald btn-sm text-xs font-bold flex items-center gap-1"
        >
          <Sparkles size={13} />
          <span>Optimize Schedule with AI</span>
        </button>
      </div>

      <div className="space-y-3">
        {events.map((e, idx) => (
          <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
                {e.time}
              </span>
              <div>
                <span className="font-extrabold text-slate-900 block">{e.field}</span>
                <span className="text-slate-500 font-medium text-[11px]">Recommended Depth: {e.depth}</span>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${e.badge}`}>
              {e.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}