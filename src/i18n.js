import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
import enTranslation from './locales/en/translation.json';
import siTranslation from './locales/si/translation.json';
import taTranslation from './locales/ta/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  si: {
    translation: siTranslation,
  },
  ta: {
    translation: taTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    },
  });

export default i18n;
