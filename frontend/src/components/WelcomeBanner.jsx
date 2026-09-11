import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Calendar, Clock, ShieldCheck, Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function WelcomeBanner({ user, totalFields, healthyFields, requiringIrrigation }) {
  const { t } = useLanguage();
  const [timeState, setTimeState] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTimeState(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreetingData = () => {
    const hour = timeState.getHours();
    if (hour >= 5 && hour < 12) {
      return {
        title: t('greetingMorning', 'Good Morning'),
        icon: Sunrise,
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.15)',
        border: 'rgba(251, 191, 36, 0.35)',
        note: t('morningWish', '🌅 Morning solar cycle active. Perfect time to inspect soil moisture & ET0 rates.')
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        title: t('greetingAfternoon', 'Good Afternoon'),
        icon: Sun,
        color: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.15)',
        border: 'rgba(6, 182, 212, 0.35)',
        note: t('afternoonWish', '☀️ Peak evapotranspiration hours. Automated ET0 sensor tracking enabled.')
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        title: t('greetingEvening', 'Good Evening'),
        icon: Sunset,
        color: '#f97316',
        bg: 'rgba(249, 115, 22, 0.15)',
        border: 'rgba(249, 115, 22, 0.35)',
        note: t('eveningWish', '🌇 Evening field assessment. Review scheduled irrigation for tonight.')
      };
    } else {
      return {
        title: t('greetingNight', 'Good Night'),
        icon: Moon,
        color: '#818cf8',
        bg: 'rgba(129, 140, 248, 0.15)',
        border: 'rgba(129, 140, 248, 0.35)',
        note: t('nightWish', '🌙 Night mode active. Automated AI sensors monitoring root moisture levels.')
      };
    }
  };

  const greeting = getGreetingData();
  const GreetingIcon = greeting.icon;

  const formattedDate = timeState.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime = timeState.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const farmerName = user?.name || 'Ramesh Patel';
  const farmerLoc = user?.location || 'D. Yerravaram, East Godavari';

  return (
    <div style={{
      background: 'rgba(17, 24, 39, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(99, 102, 241, 0.2)',
      borderRadius: '20px',
      padding: '1.25rem 1.5rem', width: '100%', maxWidth: '100%',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(6, 182, 212, 0.1)'
    }}>
      <div style={{
        position: 'absolute',
        top: '-40%',
        right: '-10%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: greeting.bg,
        filter: 'blur(80px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              fontSize: '2.2rem',
              boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
              border: '2px solid #06b6d4'
            }}>
              👨‍🌾
            </div>
            <span style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#34d399',
              border: '3px solid #0b0f19',
              boxShadow: '0 0 8px #34d399'
            }} />
          </div>

          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: greeting.bg,
              border: `1px solid ${greeting.border}`,
              color: greeting.color,
              padding: '0.25rem 0.65rem',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              marginBottom: '0.4rem'
            }}>
              <GreetingIcon size={14} color={greeting.color} />
              <span>{greeting.title}, {farmerName}!</span>
            </div>

            <h2 style={{
              fontSize: '1.55rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: '1.2',
              marginBottom: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {t('welcomeBackTitle', 'Welcome back to AgriCrop AI')} <Sparkles size={20} color="#06b6d4" />
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontWeight: 700 }}>
                <MapPin size={14} color="#06b6d4" />
                {farmerLoc}
              </span>
              <span style={{ color: 'rgba(148, 163, 184, 0.3)' }}>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontWeight: 600 }}>
                <ShieldCheck size={14} color="#34d399" />
                {t('farmerProfileBadge', 'Registered Precision Farmer')}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.4rem', fontStyle: 'italic' }}>
              {greeting.note}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.75rem',
          background: 'rgba(30, 41, 59, 0.75)',
          padding: '0.85rem 1.25rem',
          borderRadius: '16px',
          border: '1px solid rgba(99, 102, 241, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontWeight: 800, fontSize: '0.92rem' }}>
            <Calendar size={16} color="#38bdf8" />
            <span>{formattedDate}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', fontFamily: 'monospace', fontWeight: 800, fontSize: '1.1rem' }}>
            <Clock size={16} />
            <span>{formattedTime}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2px' }}>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              color: '#38bdf8',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              🌾 {totalFields || 4} {t('fieldsTracked', 'Fields Tracked')}
            </span>
            <span style={{
              background: requiringIrrigation > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${requiringIrrigation > 0 ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
              color: requiringIrrigation > 0 ? '#f87171' : '#34d399',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              {requiringIrrigation > 0 ? `⚠️ ${requiringIrrigation} ${t('needsWater', 'Needs Water')}` : `✅ ${t('allOptimalBadge', 'All Optimal')}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}