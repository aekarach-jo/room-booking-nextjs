export type Locale = 'th' | 'en';

export const locales: Locale[] = ['th', 'en'];
export const defaultLocale: Locale = 'th';

export const localeNames: Record<Locale, string> = {
  th: 'ไทย',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  th: '🇹🇭',
  en: '🇺🇸',
};
