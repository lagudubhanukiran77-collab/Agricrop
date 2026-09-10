import React from 'react';
import { Sprout, LayoutDashboard, Grid, Cpu, Calendar, History, Settings, CloudRain, BarChart3, HelpCircle, Shield, LogOut } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'fields', label: t('navFields', 'Fields & Crops'), icon: Grid },
    { id: 'intelligence', label: t('navIntelligence', 'AI Intelligence'), icon: Cpu },
    { id: 'schedule', label: t('navSchedule', 'Smart Irrigation'), icon: Calendar },
    { id: 'weather', label: t('navWeather', 'Weather Forecast'), icon: CloudRain },
    { id: 'analytics', label: t('navAnalytics', 'Analytics'), icon: BarChart3 },
    { id: 'history', label: t('navHistory', 'History & Savings'), icon: History },
    { id: 'settings', label: t('navSettings', 'AI Model Inspector'), icon: Settings }
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[250px] min-w-[250px] bg-[#0d231a] text-slate-200 min-h-screen border-r border-emerald-900/40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-emerald-900/40 flex items-center gap-3">
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-700 p-2.5 rounded-xl shadow-lg shadow-emerald-950">
          <Sprout size={22} className="text-slate-950" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">AgriCrop</h1>
          <p className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase">AI Engine</p>
          <p className="text-[10px] text-emerald-300/60 leading-none mt-0.5">Precision Water Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest">
          Platform Menu
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 border border-emerald-400/40 font-bold'
                  : 'text-slate-300 hover:bg-emerald-900/40 hover:text-white'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-emerald-400/80'} />
              <span>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
            </button>
          );
        })}
      </div>

      {/* System Status Indicator */}
      <div className="px-4 py-3 mx-3 mb-3 bg-emerald-950/60 border border-emerald-900/60 rounded-xl space-y-1.5 text-[11px]">
        <div className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-wider mb-1">
          System Status
        </div>
        <div className="flex items-center gap-2 text-emerald-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>AI Engine Online</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-300/90 font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>Weather Data Connected</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-300/80 font-medium">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>ML Prediction Active</span>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-emerald-900/40 bg-emerald-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-400/50 flex items-center justify-center text-sm font-bold text-white shadow-sm">
            👨‍🌾
          </div>
          <div className="truncate max-w-[120px]">
            <p className="text-xs font-bold text-white leading-tight truncate">{user?.name || 'Bhanu'}</p>
            <p className="text-[10px] text-emerald-400 truncate">{user?.location ? user.location.split(',')[0] : 'West Godavari'}</p>
          </div>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </aside>
  );
}