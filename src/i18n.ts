import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {format, Locale} from 'date-fns';
import {de, enUS} from 'date-fns/locale';

export const supportedLanguages = ['en', 'de'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

i18n
  .use(Backend)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
    },
  });

export const localeMap: Record<SupportedLanguage, Locale> = {
  de: de,
  en: enUS,
};

interface DateFnsFormatOptions {
  format: string;
}

i18n.services.formatter?.add(
  'datefns',
  (value, lng, {format: formatStr}: DateFnsFormatOptions) =>
    format(value, formatStr, {
      locale: localeMap[(lng ?? 'en') as SupportedLanguage],
    })
);

export default i18n;
