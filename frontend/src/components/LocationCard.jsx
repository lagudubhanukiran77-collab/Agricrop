import React from 'react';
import { MapPin, Navigation, Compass, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LocationCard({ field }) {
  const { t } = useLanguage();
  if (!field) return null;

  const locName = field.location_name || field.location || 'D. Yerravaram, Andhra Pradesh';
  const district = field.district || 'East Godavari';
  const state = field.state || 'Andhra Pradesh';
  const country = field.country || 'India';
  const lat = field.latitude !== undefined && field.latitude !== null ? field.latitude : 17.1856;
  const lon = field.longitude !== undefined && field.longitude !== null ? field.longitude : 81.9685;

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{t('fieldGeolocation')}</h3>
            <p className="text-xs text-slate-400">Live GPS Coordinates & Regional Boundary</p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <Globe className="w-3 h-3 mr-1" /> {t('activeFieldLocation')}
        </span>
      </div>

      <div className="space-y-3 mt-4">
        <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-700/40">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{t('primaryLocation')}</div>
          <div className="text-base font-bold text-slate-100 flex items-center">
            {locName}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {district} District, {state}, {country}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-700/30 flex items-center space-x-2">
            <Navigation className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block">{t('latitude')}</span>
              <span className="font-mono text-slate-200 font-medium">{Number(lat).toFixed(4)}° N</span>
            </div>
          </div>
          <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-700/30 flex items-center space-x-2">
            <Compass className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <div>
              <span className="text-slate-400 block">{t('longitude')}</span>
              <span className="font-mono text-slate-200 font-medium">{Number(lon).toFixed(4)}° E</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
