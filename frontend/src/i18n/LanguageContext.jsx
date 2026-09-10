import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, LANGUAGES } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('agricrop_language') || 'en';
  });

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLang(langCode);
      localStorage.setItem('agricrop_language', langCode);
    }
  };

  const t = (key, fallback = '') => {
    const langDict = translations[currentLang] || translations.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    // Fallback to English if key missing in current language
    if (translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

export const useLanguage = useTranslation;

