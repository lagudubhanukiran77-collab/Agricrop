import React from 'react';
import { LayoutDashboard, Grid, Cpu, Calendar, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'fields', label: 'Fields', icon: Grid },
    { id: 'intelligence', label: 'AI', icon: Cpu },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'settings', label: 'Profile', icon: User }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50 px-2 shadow-lg">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors ${
              isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 font-medium'
            }`}
          >
            <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
            <span className="text-[10px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}