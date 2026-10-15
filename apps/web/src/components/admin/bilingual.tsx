'use client';

import type { Locale } from '@bv/shared';
import { cn } from '@/lib/utils';

/**
 * Edição bilíngue no painel: cada formulário tem uma chave PT | EN que troca
 * os campos de texto mostrados. O português é obrigatório; o inglês é opcional
 * — campo em branco faz o site em inglês mostrar o texto em português.
 */
export type ContentLang = Locale;

/** Nome do campo no idioma: langKey('title', 'en') → 'titleEn'. */
export const langKey = <K extends string>(key: K, lang: ContentLang) => (lang === 'en' ? `${key}En` : key) as K | `${K}En`;

/** Ajuda padrão dos campos em inglês: mostra o texto em português que será usado se ficar vazio. */
export function fallbackHelp(lang: ContentLang, pt: string | null | undefined) {
  if (lang !== 'en') return undefined;
  const text = (pt ?? '').trim();
  return text ? `Em branco, o site em inglês mostra: “${text.length > 90 ? `${text.slice(0, 90)}…` : text}”` : 'Opcional.';
}

export function LangTabs({
  value,
  onChange,
  missingEn = 0,
  className,
}: {
  value: ContentLang;
  onChange: (lang: ContentLang) => void;
  /** Quantos textos ainda não têm versão em inglês (mostra um aviso na aba EN). */
  missingEn?: number;
  className?: string;
}) {
  const tabs: [ContentLang, string][] = [
    ['pt', 'Português'],
    ['en', 'English'],
  ];
  return (
    <div role="group" aria-label="Idioma do conteúdo" className={cn('inline-flex rounded-sm border border-hairline bg-surface p-0.5', className)}>
      {tabs.map(([lang, label]) => (
        <button
          key={lang}
          type="button"
          aria-pressed={value === lang}
          onClick={() => onChange(lang)}
          className={cn(
            'flex min-h-9 items-center gap-2 rounded-sm px-3 text-[13px] transition-colors',
            value === lang ? 'bg-ink font-medium text-surface' : 'text-ink-muted hover:text-ink',
          )}
        >
          <span className="font-mono text-xs">{lang.toUpperCase()}</span>
          <span className="max-sm:sr-only">{label}</span>
          {lang === 'en' && missingEn > 0 && (
            <span
              title={`${missingEn} ${missingEn === 1 ? 'texto sem tradução' : 'textos sem tradução'}`}
              className={cn('rounded-sm px-1.5 font-mono text-[11px] leading-5', value === 'en' ? 'bg-surface/15' : 'bg-surface-200 text-ink')}
            >
              {missingEn}
              <span className="sr-only"> sem tradução</span>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Conta pares PT preenchido × EN vazio, para o aviso da aba EN. */
export function countMissingEn(pairs: [pt: string | string[] | null | undefined, en: string | string[] | null | undefined][]) {
  const filled = (v: string | string[] | null | undefined) => (Array.isArray(v) ? v.some((x) => x.trim()) : !!v?.trim());
  return pairs.filter(([pt, enValue]) => filled(pt) && !filled(enValue)).length;
}
