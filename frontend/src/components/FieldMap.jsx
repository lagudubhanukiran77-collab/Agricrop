import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Layers, CheckCircle2 } from 'lucide-react';

export default function FieldMap({ fields, onSelectField }) {
  const [selected, setSelected] = useState(fields && fields.length > 0 ? fields[0] : null);

  const mockMarkers = [
    { id: 1, name: 'Field 01 (North Wheat)', status: 'Critical', moisture: 22.0, crop: 'Wheat', req: '18–22 mm', x: 35, y: 40, badge: 'bg-red-500 text-white' },
    { id: 2, name: 'Field 02 (East Rice)', status: 'Warning', moisture: 25.7, crop: 'Rice', req: '12–15 mm', x: 65, y: 30, badge: 'bg-orange-500 text-white' },
    { id: 3, name: 'Field 03 (South Corn)', status: 'Healthy', moisture: 30.5, crop: 'Corn', req: '0 mm', x: 50, y: 70, badge: 'bg-emerald-500 text-white' }
  ];

  const activeMarker = mockMarkers.find(m => m.id === (selected?.id || 1)) || mockMarkers[0];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Precision Field GIS Map — West Godavari
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Warning</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Healthy</span>
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative w-full h-72 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Visual Map Boundary Contours */}
        <svg className="absolute inset-0 w-full h-full opacity-30 stroke-emerald-500 fill-emerald-950/20" strokeWidth="1.5">
          <polygon points="100,50 300,40 380,180 200,240 80,180" />
          <polygon points="400,60 650,50 720,200 500,220" />
        </svg>

        {/* Map Markers */}
        {mockMarkers.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              const f = fields ? fields.find(field => field.id === m.id) : null;
              setSelected(f || m);
              if (onSelectField && f) onSelectField(f);
            }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
          >
            <div className={`px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg flex items-center gap-1 transition-transform group-hover:scale-110 ${m.badge}`}>
              <MapPin size={12} />
              <span>{m.name.split(' ')[0]} {m.name.split(' ')[1]}</span>
            </div>
          </button>
        ))}

        {/* Floating Detail Card overlay */}
        {activeMarker && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-slate-950/90 text-white backdrop-blur-md p-3.5 rounded-xl border border-emerald-500/40 shadow-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="font-extrabold text-white text-sm">{activeMarker.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${activeMarker.badge}`}>
                {activeMarker.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div><span className="text-slate-400">Crop:</span> <strong className="text-white">{activeMarker.crop}</strong></div>
              <div><span className="text-slate-400">Moisture:</span> <strong className="text-emerald-400">{activeMarker.moisture}%</strong></div>
              <div><span className="text-slate-400">Water Stress:</span> <strong className="text-red-400">{activeMarker.status}</strong></div>
              <div><span className="text-slate-400">Recommended:</span> <strong className="text-sky-400">{activeMarker.req}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}