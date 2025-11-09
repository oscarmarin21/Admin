import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

type SupportedLocale = 'en' | 'es';

const getInitialLocale = (): SupportedLocale => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const stored = window.localStorage.getItem('locale');
  return stored === 'es' ? 'es' : 'en';
};

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLocale(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export { i18n };

