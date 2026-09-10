import React, { useState, useEffect } from 'react';
import { Waves, Info, Compass } from 'lucide-react';
import { getWaterResources } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

export default function WaterResourcesCard({ fieldId }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fieldId) return;
    setLoading(true);
    getWaterResources(fieldId)
      .then(res => setData(res))
      .catch(err => console.error("Water resources load error:", err))
      .finally(() => setLoading(false));
  }, [fieldId]);

  if (loading && !data) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg animate-pulse min-h-[140px] flex items-center justify-center">
        <span className="text-xs text-slate-400">{t('scanningWaterBodies')}</span>
      </div>
    );
  }

  if (!data || !data.water_resources || data.water_resources.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{t('nearbyWaterResources')}</h3>
            <p className="text-xs text-slate-400">Geospatial Canal & River Proximity Analysis</p>
          </div>
        </div>
        <span className="text-xs font-mono bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">
          {data.water_resources.length} {t('waterBodiesDetected')}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {data.water_resources.map((wr, idx) => (
          <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/40 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Compass className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-slate-200">{wr.name}</div>
                <div className="text-[11px] text-slate-400">{wr.type} • {wr.status}</div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-cyan-400">{wr.distance_km} km</span>
              <span className="block text-[10px] text-slate-500">approx. distance</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-cyan-950/40 border border-cyan-800/50 p-2.5 rounded-lg flex items-start space-x-2">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-cyan-200 leading-tight">
          <strong className="font-semibold text-cyan-300">Geospatial Note:</strong> {data.usable_water_disclaimer || t('usableWaterNotice')}
        </p>
      </div>
    </div>
  );
}
