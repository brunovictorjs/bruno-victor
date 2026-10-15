import { LOCALES, type Locale } from '@bv/shared';
import { getDictionary, localePath } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Seletor PT | EN. `path` é a página atual sem o prefixo de idioma ("/",
 * "/portfolio/slug"). Link comum (recarga completa) de propósito: troca o
 * `lang` do documento e deixa o proxy lembrar a escolha.
 */
export function LanguageSwitch({ locale, path, className }: { locale: Locale; path: string; className?: string }) {
  const t = getDictionary(locale);
  return (
    <nav aria-label={t.a11y.language} className={cn('flex items-center font-mono text-[13px] leading-none', className)}>
      {LOCALES.map((l, i) => {
        const other = getDictionary(l);
        return (
          <span key={l} className="flex items-center">
            {i > 0 && (
              <span aria-hidden className="px-1.5 text-hairline">
                /
              </span>
            )}
            {l === locale ? (
              <span aria-current="true" className="px-1 py-2 text-ink">
                {l.toUpperCase()}
              </span>
            ) : (
              <a
                href={localePath(l, path)}
                hrefLang={other.meta.htmlLang}
                lang={other.meta.htmlLang}
                aria-label={other.a11y.switchTo}
                className="px-1 py-2 text-ink-muted transition-colors hover:text-ink"
              >
                {l.toUpperCase()}
              </a>
            )}
          </span>
        );
      })}
    </nav>
  );
}
