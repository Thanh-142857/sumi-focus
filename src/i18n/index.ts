import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import en from './en';
import ja from './ja';

declare module 'i18next' {
  interface InitOptions {
    compatibilityJSON?: 'v4' | 'v3';
  }
}

const deviceLocales = getLocales();
const primaryCode = deviceLocales[0]?.languageCode ?? 'en';
const initialLanguage = primaryCode.startsWith('ja') ? 'ja' : 'en';

export const defaultNS = 'translation';
export const resources = {
  en: { translation: en },
  ja: { translation: ja },
} as const;

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)['en'];
  }
}

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: initialLanguage,
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
