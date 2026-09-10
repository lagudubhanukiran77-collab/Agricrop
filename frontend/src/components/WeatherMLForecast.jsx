import React from 'react';
import { CloudSun, TrendingDown, Thermometer, CloudRain, Wind, Info } from 'lucide-react';

export default function WeatherMLForecast() {
  const forecastDays = [
    { day: 'Today', moisture: 22, temp: 32, rain: 10 },
    { day: 'Tomorrow', moisture: 20, temp: 34, rain: 5 },
    { day: '+2 Days', moisture: 18, temp: 35, rain: 0 },
    { day: '+3 Days', moisture: 24, temp: 29, rain: 65 },
    { day: '+4 Days', moisture: 26, temp: 28, rain: 40 },
    { day: '+5 Days', moisture: 23, temp: 31, rain: 15 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Left: Weather Forecast Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CloudSun size={18} className="text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Weather Forecast & Evapotranspiration
              </h3>
            </div>
            <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
              Open-Meteo Feed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] font-bold block">TEMP</span>
              <span className="font-extrabold text-slate-900">32°C</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-bold block">HUMIDITY</span>
              <span className="font-extrabold text-slate-900">45%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-bold block">RAIN PROB</span>
              <span className="font-extrabold text-sky-600">10%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] font-bold block">ET0 RATE</span>
              <span className="font-extrabold text-emerald-600">5.2 mm/day</span>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-100 font-medium">
          <Info size={13} className="text-slate-400" />
          <span>Evapotranspiration ET0 auto-calculated via FAO-56 Penman-Monteith equation.</span>
        </div>
      </div>

      {/* Right: ML Soil Moisture Forecast */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown size={18} className="text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                ML Soil Moisture Forecast (5-Day)
              </h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Random Forest ML
            </span>
          </div>

          <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-1">
            {forecastDays.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] font-extrabold text-slate-700">{d.moisture}%</span>
                <div 
                  className={`w-full rounded-t-md transition-all ${
                    d.moisture < 20 ? 'bg-red-500' : d.moisture < 25 ? 'bg-orange-400' : 'bg-emerald-500'
                  }`}
                  style={{ height: `${(d.moisture / 35.0) * 100}%` }}
                />
                <span className="text-[9px] font-bold text-slate-500 truncate w-full text-center">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 italic">
          Prediction generated using crop, soil, weather, field and historical moisture patterns.
        </div>
      </div>
    </div>
  );
}