import React from 'react';
import { Sprout, LayoutDashboard, Grid, Cpu, Calendar, History, Settings, Bell, Globe, Plus, LogOut } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function AddFieldsHeader({ activeTab, setActiveTab, alertCount, onOpenFieldModal, onOpenMLModal, user, onLogout }) {
  const { currentLang, changeLanguage, t, languages } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'fields', label: t('navFields', 'Fields & Crops'), icon: Grid },
    { id: 'intelligence', label: t('navIntelligence', 'Intelligence Studio'), icon: Cpu },
    { id: 'schedule', label: t('navSchedule', 'Smart Schedule'), icon: Calendar },
    { id: 'history', label: t('navHistory', 'History & Savings'), icon: History }
  ];

  return (
    <header className="bg-[#09130e] border-b border-emerald-500/30 sticky top-0 z-50 px-4 lg:px-8 py-3">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between flex-wrap gap-3">
        {/* Brand Header */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-700 p-2 rounded-xl shadow-md border border-emerald-400/40">
            <Sprout size={22} className="text-slate-950" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-tight leading-none flex items-center gap-2">
              AgriCrop AI Engine <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#0d2c20] border border-cyan-500/40">AI Engine</span>
            </h1>
            <p className="text-[11px] font-medium text-emerald-300/80 mt-0.5">Precision Water Intelligence</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#0d2c20] p-1 rounded-xl border border-emerald-500/30">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md border border-emerald-400/40' 
                    : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-white' : 'text-emerald-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          {/* Multi-Language Dropdown */}
          <div className="flex items-center gap-1 bg-[#0d2c20] border border-emerald-500/30 px-2.5 py-1 rounded-lg">
            <Globe size={14} className="text-cyan-400" />
            <select
              value={currentLang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code} className="bg-[#09130e] text-white">
                  {l.flag} {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* ML Inspector Button */}
          <button 
            onClick={onOpenMLModal}
            className="btn btn-outline btn-sm text-xs font-bold text-cyan-300 border-cyan-500/40"
          >
            <Cpu size={14} />
            <span className="hidden sm:inline">ML Inspector</span>
          </button>

          {/* Add Field Button */}
          <button 
            onClick={onOpenFieldModal}
            className="btn btn-primary text-xs font-bold py-1.5 px-3"
          >
            <Plus size={15} />
            <span>+ Add Field</span>
          </button>

          {/* Alert Bell */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="relative cursor-pointer p-2 bg-[#0d2c20] border border-emerald-500/30 rounded-lg text-white"
          >
            <Bell size={16} />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
                {alertCount}
              </span>
            )}
          </div>

          {/* User Badge & Logout */}
          {user && (
            <div className="flex items-center gap-2 bg-[#0d2c20] border border-emerald-500/30 px-3 py-1 rounded-lg">
              <span className="text-xs font-extrabold text-emerald-300">👨‍🌾 {user.name.split(' ')[0]}</span>
              {onLogout && (
                <button onClick={onLogout} className="text-red-400 hover:text-red-300 p-0.5" title="Logout">
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