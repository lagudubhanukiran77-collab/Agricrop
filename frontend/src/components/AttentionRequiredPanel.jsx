import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Check } from 'lucide-react';

export default function AttentionRequiredPanel({ alerts, onResolveAlert, onSelectField }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-3 border-b border-red-100 pb-2">
        <div className="flex items-center gap-2 text-red-700 font-extrabold text-xs uppercase tracking-wider">
          <AlertTriangle size={16} />
          <span>ATTENTION REQUIRED ({alerts.filter(a => !a.is_resolved).length})</span>
        </div>
      </div>

      <div className="space-y-2">
        {alerts.filter(a => !a.is_resolved).slice(0, 3).map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-red-50/70 p-3 rounded-xl border border-red-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <div>
                <span className="font-bold text-slate-900 block">{a.field_name || 'Field 01'}</span>
                <span className="text-red-700 font-medium text-[11px]">{a.message || 'Soil moisture 22% - Approaching moisture stress'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onSelectField && onSelectField(a.field_id)}
                className="text-[11px] font-bold text-slate-700 hover:text-emerald-700 bg-white px-2.5 py-1 rounded border border-slate-200"
              >
                View Field
              </button>
              <button 
                onClick={() => onResolveAlert && onResolveAlert(a.id)}
                className="text-[11px] font-bold text-red-700 hover:bg-red-100 p-1.5 rounded"
                title="Resolve Alert"
              >
                <Check size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}