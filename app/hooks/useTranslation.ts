import { useCallback } from 'react';

type Language = 'cs' | 'da' | 'de' | 'en' | 'es' | 'fi' | 'fr' | 'hu' | 'id' | 'it' | 'ja' | 'ko' | 'nl' | 'pl' | 'pt' | 'pt-br' | 'ro' | 'ru' | 'sv' | 'th' | 'tr' | 'uk' | 'vi' | 'zh-tw';

const translations: Record<string, any> = {
  cs: require('@/locales/cs.json'),
  da: require('@/locales/da.json'),
  de: require('@/locales/de.json'),
  en: require('@/locales/en.json'),
  es: require('@/locales/es.json'),
  fi: require('@/locales/fi.json'),
  fr: require('@/locales/fr.json'),
  hu: require('@/locales/hu.json'),
  id: require('@/locales/id.json'),
  it: require('@/locales/it.json'),
  ja: require('@/locales/ja.json'),
  ko: require('@/locales/ko.json'),
  nl: require('@/locales/nl.json'),
  pl: require('@/locales/pl.json'),
  pt: require('@/locales/pt.json'),
  'pt-br': require('@/locales/pt-br.json'),
  ro: require('@/locales/ro.json'),
  ru: require('@/locales/ru.json'),
  sv: require('@/locales/sv.json'),
  th: require('@/locales/th.json'),
  tr: require('@/locales/tr.json'),
  uk: require('@/locales/uk.json'),
  vi: require('@/locales/vi.json'),
  'zh-tw': require('@/locales/zh-tw.json'),
};

const englishFallback = translations.en;

export function useTranslation(language: Language) {
  const t = useCallback((key: string, defaultValue?: string) => {
    const keys = key.split('.');
    const lang = translations[language] || englishFallback;
    let value: any = lang;

    for (const k of keys) {
      value = value?.[k];
    }

    return value || defaultValue || key;
  }, [language]);

  return { t };
}
