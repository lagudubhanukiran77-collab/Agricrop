import React, { useState, useEffect } from 'react';
import { Sprout, Cpu, Droplets, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LogoSplashPage({ onFinish }) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justify: 'center',
      backgroundColor: '#0b0f19',
      backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(6, 182, 212, 0.22) 0%, transparent 65%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), linear-gradient(135deg, #0b0f19 0%, #111827 50%, #0f172a 100%)',
      color: '#ffffff',
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      overflow: 'hidden'
    }}>
      {/* Animated Glowing Logo Hub */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '540px', padding: '2rem' }}>
        
        {/* Logo Emblem Icon */}
        <div style={{
          position: 'relative',
          width: '110px',
          height: '110px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(16, 185, 129, 0.25))',
          border: '2px solid rgba(6, 182, 212, 0.6)',
          boxShadow: '0 0 50px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          marginBottom: '1.75rem'
        }}>
          <Sprout size={56} color="#34d399" style={{ filter: 'drop-shadow(0 0 12px #34d399)' }} />
          <Droplets size={26} color="#38bdf8" style={{ position: 'absolute', bottom: '12px', right: '12px', filter: 'drop-shadow(0 0 8px #38bdf8)' }} />
        </div>

        {/* Brand Title */}
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 50%, #34d399 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          {t('splashBrand', 'AgriCrop AI')}
        </h1>

        <p style={{ fontSize: '1.05rem', fontWeight: 700, color: '#bae6fd', marginBottom: '1.25rem', letterSpacing: '0.02em' }}>
          {t('splashSubtitle', 'Smart Precision Agriculture & Water Management System')}
        </p>

        {/* Tech Subtitle Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 1rem',
          borderRadius: '20px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.35)',
          fontSize: '0.78rem',
          color: '#38bdf8',
          fontWeight: 800,
          fontFamily: 'monospace',
          marginBottom: '2.5rem'
        }}>
          <Sparkles size={14} color="#34d399" />
          <span>{t('splashTechEngine', 'FAO-56 Penman-Monteith Engine • Scikit-Learn ML')}</span>
        </div>

        {/* 5-Second Progress Bar */}
        <div style={{ width: '100%', maxWidth: '320px', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
            <span>{t('splashLoading', 'LOADING APPLICATION...')}</span>
            <span style={{ color: '#06b6d4', fontFamily: 'monospace' }}>{timeLeft}s</span>
          </div>

          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(30, 41, 59, 0.9)',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}>
            <div style={{
              height: '100%',
              width: `${((5 - timeLeft) / 5) * 100}%`,
              background: 'linear-gradient(90deg, #06b6d4, #10b981)',
              borderRadius: '10px',
              transition: 'width 1s linear',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.6)'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
