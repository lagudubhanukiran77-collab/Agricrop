import React from 'react';
import { Sprout, LayoutDashboard, Grid, Cpu, Calendar, History, Settings, Bell, Globe, Plus, LogOut, CloudSun } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function FloatingHeader({ activeTab, setActiveTab, alertCount, onOpenAddField, user, onLogout }) {
  const { currentLang, changeLanguage, t, languages } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard', 'Overview'), icon: LayoutDashboard },
    { id: 'fields', label: t('navFields', 'Fields & GIS'), icon: Grid },
    { id: 'intelligence', label: t('navIntelligence', 'AI Intelligence'), icon: Cpu },
    { id: 'schedule', label: t('navSchedule', 'Smart Schedule'), icon: Calendar },
    { id: 'history', label: t('navHistory', 'History & Savings'), icon: History },
    { id: 'settings', label: t('navSettings', 'AI Model Inspector'), icon: Settings }
  ];

  return (
    <header className="sticky top-3 z-50 px-4 max-w-[1500px] mx-auto w-full">
      <div className="glass-floating py-2.5 px-4 flex items-center justify-between flex-wrap gap-3">
        {/* Brand & Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-700 p-2 rounded-xl shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <Sprout size={20} className="text-slate-950" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-none flex items-center gap-1.5">
              AgriCrop <span className="text-[10px] uppercase tracking-widest font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80">AI Engine</span>
            </h1>
            <p className="text-[10px] font-medium text-emerald-300/80 leading-tight mt-0.5">Precision Water Intelligence</p>
          </div>
        </div>

        {/* Navigation Floating Chips */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-emerald-900/40">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md border border-emerald-400/40' 
                    : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-white' : 'text-emerald-400/80'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Weather Widget */}
          <div className="hidden lg:flex items-center gap-1.5 bg-sky-950/60 border border-sky-800/60 px-2.5 py-1 rounded-lg text-xs font-bold text-sky-300">
            <CloudSun size={15} className="text-sky-400" />
            <span>32°C • Clear</span>
          </div>

          {/* Multi-Language Dropdown */}
          <div className="flex items-center gap-1 bg-slate-950/60 border border-emerald-900/60 px-2 py-1 rounded-lg">
            <Globe size={14} className="text-emerald-400" />
            <select
              value={currentLang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-950 text-white">
                  {l.flag} {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Alert Bell */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="relative cursor-pointer p-2 bg-slate-950/60 hover:bg-emerald-950/60 border border-emerald-900/60 rounded-lg text-white transition-colors"
          >
            <Bell size={16} />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                {alertCount}
              </span>
            )}
          </div>

          {/* Add Field Button */}
          <button 
            onClick={onOpenAddField}
            className="btn btn-primary text-xs font-bold py-1.5 px-3 shadow-md"
          >
            <Plus size={15} />
            <span>+ Add Field</span>
          </button>

          {/* Farmer Profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
              <span className="text-xs font-extrabold text-emerald-300">👨‍🌾 {user.name.split(' ')[0]}</span>
              {onLogout && (
                <button 
                  onClick={onLogout} 
                  className="text-red-400 hover:text-red-300 p-0.5 transition-colors"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}