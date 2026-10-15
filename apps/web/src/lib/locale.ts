import 'server-only';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@bv/shared';
import { locale as rootLocale } from 'next/root-params';

/** Idioma da rota atual (segmento app/[locale]), para Server Components sem `params`. */
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
