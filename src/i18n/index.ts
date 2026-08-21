import { en } from './en';
import { ja } from './ja';

export const translations = { ja, en } as const;
export type Locale = keyof typeof translations;
export type Translation = typeof ja;

let currentLocale: Locale = 'ja';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function getTranslations(): Translation {
  return translations[currentLocale] as Translation;
}

/** Translation accessor. Persisted data must continue using stable English keys. */
export function t(): Translation {
  return getTranslations();
}
