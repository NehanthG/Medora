import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import JSON resources (Vite supports JSON imports)
import en from '../locales/en/translation.json';
import hi from '../locales/hi/translation.json';
import pa from '../locales/pa/translation.json';
import te from '../locales/te/translation.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  pa: { translation: pa },
  te: { translation: te },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    saveMissing: true,
    detection: {
      // Detect via localStorage first, then browser settings
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

// Dev-only: log missing translation keys in console to catch gaps fast
if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE !== 'production') {
  i18n.on('missingKey', (lngs, ns, key) => {
    // eslint-disable-next-line no-console
    console.warn(`[i18n] Missing key: ${key} | namespaces: ${ns} | languages: ${lngs}`);
  });
}

// Keep <html lang> in sync with active language for a11y/SEO
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const setHtmlLang = (lng) => {
    try {
      document.documentElement.lang = (lng || '').split('-')[0] || 'en';
    } catch (_) {}
  };
  setHtmlLang(i18n.resolvedLanguage || i18n.language);
  i18n.on('languageChanged', (lng) => setHtmlLang(lng));
}

export default i18n;
