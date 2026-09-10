import React, { useState } from 'react';
import { MapPin, Compass, Layers, Radio, ShieldCheck, Zap } from 'lucide-react';

export default function FieldGISCanvas({ fields, selectedField, onSelectField }) {
  const [activeTab, setActiveTab] = useState('satellite');

  const defaultMarkers = [
    { id: 1, name: 'Field 01 (North Wheat)', crop: 'Wheat', status: 'Critical', moisture: 22.0, x: 32, y: 38, badge: 'bg-red-500/90 text-white border-red-400' },
    { id: 2, name: 'Field 02 (East Rice)', crop: 'Rice', status: 'Warning', moisture: 25.7, x: 68, y: 28, badge: 'bg-amber-500/90 text-white border-amber-400' },
    { id: 3, name: 'Field 03 (South Corn)', crop: 'Corn', status: 'Healthy', moisture: 30.5, x: 50, y: 72, badge: 'bg-emerald-500/90 text-white border-emerald-400' }
  ];

  const fieldMarkers = fields && fields.length > 0 ? fields.map((f, idx) => {
    const defaultM = defaultMarkers[idx % defaultMarkers.length];
    const moisture = f.latest_environment?.soil_moisture_pct || 22.0;
    const status = moisture < 23 ? 'Critical' : moisture < 26 ? 'Warning' : 'Healthy';
    const badge = status === 'Critical' ? 'bg-red-500/90 text-white border-red-400' :
                  status === 'Warning' ? 'bg-amber-500/90 text-white border-amber-400' : 'bg-emerald-500/90 text-white border-emerald-400';
    return {
      ...f,
      x: defaultM.x,
      y: defaultM.y,
      moisture,
      status,
      badge
    };
  }) : defaultMarkers;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-[#040906]">
      {/* Dark Vector GIS Satellite Map Canvas Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08)_0%,transparent_70%)]" />

      {/* Grid Mesh Canvas Overlay */}
      <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#05966915_1px,transparent_1px),linear-gradient(to_bottom,#05966915_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Animated GIS Radar Sweep Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-emerald-500/20 pointer-events-none">
        <div className="w-full h-full rounded-full border border-emerald-500/10 scale-75" />
        <div className="w-full h-full rounded-full border border-emerald-500/10 scale-50" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/15 via-transparent to-transparent animate-radar" />
      </div>

      {/* GIS Field Boundaries SVG Polygons */}
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
        {/* Field 1 Vector Contour */}
        <polygon 
          points="200,120 420,100 480,280 260,340 160,260" 
          fill="rgba(239, 68, 68, 0.12)" 
          stroke="#ef4444" 
          strokeWidth="1.5" 
          strokeDasharray="4 2"
        />
        {/* Field 2 Vector Contour */}
        <polygon 
          points="580,140 850,110 920,320 680,360" 
          fill="rgba(245, 158, 11, 0.12)" 
          stroke="#f59e0b" 
          strokeWidth="1.5" 
          strokeDasharray="4 2"
        />
        {/* Field 3 Vector Contour */}
        <polygon 
          points="400,480 750,440 820,680 460,720" 
          fill="rgba(16, 185, 129, 0.12)" 
          stroke="#10b981" 
          strokeWidth="1.5" 
        />
      </svg>

      {/* Interactive GIS Markers */}
      <div className="absolute inset-0 pointer-events-auto">
        {fieldMarkers.map(m => {
          const isSelected = selectedField && selectedField.id === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectField && onSelectField(m)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-300 z-10"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              {/* Pulse Ring */}
              <div className={`absolute -inset-3 rounded-full opacity-40 animate-ping ${m.badge.split(' ')[0]}`} />

              <div className={`px-3 py-1.5 rounded-full text-xs font-extrabold shadow-2xl backdrop-blur-md border flex items-center gap-1.5 ${m.badge} ${isSelected ? 'ring-4 ring-emerald-400 scale-110' : ''}`}>
                <MapPin size={14} />
                <span>{m.name || m.crop_name} ({m.moisture}%)</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* GIS Coordinate Watermark Bar */}
      <div className="absolute bottom-3 left-6 text-[11px] font-mono text-emerald-400/60 flex items-center gap-4 pointer-events-none">
        <span>GIS SATELLITE FEED: ACTIVE</span>
        <span>LAT: 17.1856° N</span>
        <span>LON: 81.9685° E</span>
        <span>ELEV: 42M</span>
      </div>
    </div>
  );
}