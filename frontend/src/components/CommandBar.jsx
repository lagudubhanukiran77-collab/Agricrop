import React from 'react';
import { Search, Bell, Plus, Globe, CloudSun, User } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function CommandBar({ activeTab, onOpenAddField, alertCount, user }) {
  const { currentLang, changeLanguage, languages } = useLanguage();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard / Overview';
      case 'fields': return 'Dashboard / Fields & Crops';
      case 'intelligence': return 'Dashboard / AI Intelligence Studio';
      case 'schedule': return 'Dashboard / Smart Irrigation Schedule';
      case 'weather': return 'Dashboard / Weather Forecast';
      case 'analytics': return 'Dashboard / Analytics & Savings';
      case 'history': return 'Dashboard / History Log';
      case 'settings': return 'Dashboard / AI Model Inspector';
      default: return 'Dashboard / Overview';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg w-72">
        <Search size={14} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search fields, crops, alerts..." 
          className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full font-medium"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Weather Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-800">
          <CloudSun size={15} className="text-sky-600" />
          <span>32°C • Clear</span>
        </div>

        {/* Multi-Language Dropdown */}
        <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
          <Globe size={14} className="text-emerald-600" />
          <select 
            value={currentLang} 
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            {languages.map(l => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors">
          <Bell size={16} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {alertCount}
            </span>
          )}
        </div>

        {/* Add Field Button */}
        <button 
          onClick={onOpenAddField}
          className="btn btn-emerald text-xs font-bold px-3.5 py-1.5 shadow-sm"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">+ Add Field</span>
        </button>
      </div>
    </header>
  );
}