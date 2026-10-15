import type { Locale } from '@bv/shared';
import type { Metadata } from 'next';
import { localePath } from './i18n';

/** Canonical + versões alternativas (hreflang) de uma página nos dois idiomas. */
export function alternates(locale: Locale, path: string): Metadata['alternates'] {
  return {
    canonical: localePath(locale, path),
    languages: {
      'pt-BR': localePath('pt', path),
      en: localePath('en', path),
      'x-default': localePath('pt', path),
    },
  };
}
