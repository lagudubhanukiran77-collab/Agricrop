import React, { useState, useEffect } from 'react';
import { CloudSun, RefreshCw, Thermometer, Droplets, CloudRain, Wind, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { getFieldWeather, refreshFieldWeather } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

export default function WeatherCard({ fieldId, onWeatherUpdated }) {
  const { t } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = async (force = false) => {
    if (!fieldId) return;
    try {
      if (force) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = force 
        ? await refreshFieldWeather(fieldId)
        : await getFieldWeather(fieldId);
      
      const wData = data.weather || data;
      setWeather(wData);
      if (onWeatherUpdated) onWeatherUpdated(wData);
    } catch (err) {
      console.error("Failed to load live weather:", err);
      setError("Unable to connect to weather server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather(false);
  }, [fieldId]);

  if (loading && !weather) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg animate-pulse min-h-[220px] flex items-center justify-center">
        <div className="text-slate-400 text-sm flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Fetching hyper-local Open-Meteo live weather...</span>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg">
        <div className="text-slate-400 text-sm flex items-center space-x-2 text-rose-400">
          <AlertCircle className="w-4 h-4" />
          <span>{error || "No weather data available."}</span>
        </div>
      </div>
    );
  }

  const badgeStatus = weather.status_badge || weather.data_source || 'LIVE WEATHER';
  const isLive = badgeStatus.includes('LIVE');
  const isCached = badgeStatus.includes('CACHED');

  return (
    <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-5 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{t('liveHyperLocalWeather')}</h3>
            <p className="text-xs text-slate-400">Open-Meteo Satellite & Station Data</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            isLive 
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : isCached 
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                : 'bg-slate-700 text-slate-300 border-slate-600'
          }`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {badgeStatus}
          </span>

          <button
            onClick={() => fetchWeather(true)}
            disabled={refreshing}
            className="p-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-600/50 disabled:opacity-50"
            title="Refresh Live Weather"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/40">
          <div className="flex items-center text-xs text-slate-400 mb-1">
            <Thermometer className="w-3.5 h-3.5 text-amber-400 mr-1" /> {t('temperature')}
          </div>
          <div className="text-lg font-bold text-slate-100">{weather.temperature_c}°C</div>
          <div className="text-[11px] text-slate-400">{weather.weather_condition || 'Clear'}</div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/40">
          <div className="flex items-center text-xs text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-400 mr-1" /> {t('humidity')}
          </div>
          <div className="text-lg font-bold text-slate-100">{weather.humidity_pct}%</div>
          <div className="text-[11px] text-slate-400">Relative Humidity</div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/40">
          <div className="flex items-center text-xs text-slate-400 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-indigo-400 mr-1" /> {t('rainProbability')}
          </div>
          <div className="text-lg font-bold text-slate-100">{weather.rain_probability_pct}%</div>
          <div className="text-[11px] text-slate-400">{weather.rainfall_mm} mm expected</div>
        </div>

        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/40">
          <div className="flex items-center text-xs text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-400 mr-1" /> {t('windSpeed')}
          </div>
          <div className="text-lg font-bold text-slate-100">{weather.wind_speed_kmh} <span className="text-xs font-normal">km/h</span></div>
          <div className="text-[11px] text-slate-400">Surface Wind</div>
        </div>
      </div>

      {weather.daily_forecast && weather.daily_forecast.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700/40">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center font-medium text-slate-300">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> 5-Day Precipitation Forecast
            </span>
            {weather.timestamp && (
              <span className="text-[10px] text-slate-500">
                Last updated: {new Date(weather.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center">
            {weather.daily_forecast.slice(0, 5).map((df, idx) => (
              <div key={idx} className="bg-slate-900/40 p-2 rounded border border-slate-700/30 text-xs">
                <div className="text-[10px] font-semibold text-slate-400">{df.date ? df.date.split('-').slice(1).join('/') : `Day ${idx+1}`}</div>
                <div className="font-bold text-slate-200 mt-0.5">{df.temp_max_c}°</div>
                <div className="text-[10px] text-blue-400 mt-0.5 font-medium">{df.rain_prob_pct}% rain</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
