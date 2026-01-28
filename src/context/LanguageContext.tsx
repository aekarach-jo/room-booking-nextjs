'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Locale, defaultLocale, locales } from '@/i18n/config';

// Import messages
import thMessages from '@/i18n/messages/th.json';
import enMessages from '@/i18n/messages/en.json';

type Messages = typeof thMessages;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  messages: Messages;
}

const messages: Record<Locale, Messages> = {
  th: thMessages,
  en: enMessages,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'app-locale';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load saved locale from localStorage
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    // Update the HTML lang attribute
    document.documentElement.lang = newLocale;
  }, []);

  // Translation function with nested key support
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return the key if translation not found
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      }, value);
    }
    
    return value;
  }, [locale]);

  // Prevent flash of wrong language
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        messages: messages[locale],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for getting just the translation function
export function useTranslation() {
  const { t, locale } = useLanguage();
  return { t, locale };
}
