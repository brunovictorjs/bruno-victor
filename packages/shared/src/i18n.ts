import type { Locale } from './constants.js';

/**
 * Conteúdo bilíngue: cada campo traduzível tem a versão em português (`title`)
 * e a em inglês (`titleEn`). Sem tradução, o inglês cai no português — o site
 * nunca mostra um campo vazio só porque a versão em inglês ainda não foi escrita.
 */
const filled = (value: unknown) =>
  Array.isArray(value) ? value.length > 0 : typeof value === 'string' ? value.trim() !== '' : value != null;

export function localized<T extends object, K extends keyof T & string>(obj: T, key: K, locale: Locale): T[K] {
  if (locale === 'en') {
    const en = (obj as Record<string, unknown>)[`${key}En`];
    if (filled(en)) return en as T[K];
  }
  return obj[key];
}

/** Atalho para ler vários campos do mesmo objeto: `const t = localizer(project, locale); t('title')`. */
export const localizer =
  <T extends object>(obj: T, locale: Locale) =>
  <K extends keyof T & string>(key: K): T[K] =>
    localized(obj, key, locale);
