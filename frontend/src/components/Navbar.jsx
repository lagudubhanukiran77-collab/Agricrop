import React from 'react';
import { Sprout, LayoutDashboard, Grid, Cpu, Calendar, History, Bell, Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Navbar({ activeTab, setActiveTab, alertCount, onOpenFieldModal, onOpenMLModal, user, onLogout }) {
  const { currentLang, changeLanguage, t, languages } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('navDashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'fields', label: t('navFields', 'Fields & Crops'), icon: Grid },
    { id: 'intelligence', label: t('navIntelligence', 'Intelligence Studio'), icon: Cpu },
    { id: 'schedule', label: t('navSchedule', 'Smart Schedule'), icon: Calendar },
    { id: 'history', label: t('navHistory', 'History & Savings'), icon: History }
  ];

  return (
    <nav style={{
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.65rem 1.25rem',
      width: '100%',
      boxShadow: '0 4px 25px rgba(0, 0, 0, 0.4)'
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            padding: '0.55rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: '0 4px 15px rgba(6, 182, 212, 0.35)'
          }}>
            <Sprout size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              {t('brandTitle', 'AgriCrop AI Engine')} <span style={{ fontSize: '0.7rem', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, padding: '2px 6px', border: '1px solid #38bdf8', borderRadius: '4px', marginLeft: '6px' }}>AI Engine</span>
            </h1>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{t('brandSubtitle', 'Precision Water Intelligence')}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(30, 41, 59, 0.7)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: '8px',
                  background: isActive ? 'linear-gradient(135deg, #06b6d4, #10b981)' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isActive ? '1px solid #06b6d4' : '1px solid transparent',
                  boxShadow: isActive ? '0 4px 15px rgba(6, 182, 212, 0.3)' : 'none'
                }}
              >
                <Icon size={16} color={isActive ? '#ffffff' : '#38bdf8'} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Action Controls & Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Language Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(30, 41, 59, 0.8)', padding: '3px 8px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
            <Globe size={15} color="#38bdf8" />
            <select
              value={currentLang}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {languages.map(l => (
                <option key={l.code} value={l.code} style={{ background: '#0f172a', color: '#ffffff' }}>
                  {l.flag} {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn btn-outline btn-sm"
            onClick={onOpenMLModal}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
          >
            <Cpu size={14} /> {t('mlInspector', 'ML Model Inspector')}
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={onOpenFieldModal}
          >
            {t('addField', '+ Add Field')}
          </button>

          {/* Alert Notifications Counter */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            style={{
              position: 'relative',
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '0.5rem',
              borderRadius: '10px',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}
          >
            <Bell size={18} color="#ffffff" />
            {alertCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}>
                {alertCount}
              </span>
            )}
          </div>

          {/* Farmer Profile Pill */}
          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(30, 41, 59, 0.8)',
              padding: '0.4rem 0.85rem',
              borderRadius: '14px',
              border: '1.5px solid rgba(99, 102, 241, 0.25)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                fontSize: '1.2rem',
                border: '2px solid #06b6d4',
                flexShrink: 0
              }}>
                👨‍🌾
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.15 }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>
                  📍 {user.location ? (user.location.length > 22 ? user.location.substring(0, 22) + '...' : user.location) : 'D. Yerravaram'}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="btn btn-outline btn-sm"
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.3rem 0.65rem',
                    color: '#ef4444',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    marginLeft: '0.35rem',
                    borderRadius: '8px'
                  }}
                  title="Logout"
                >
                  {t('logout', 'Logout')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}