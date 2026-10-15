import type { Locale } from '@bv/shared';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_IMAGES } from '@/lib/config';
import { getDictionary, localePath, SECTION_IDS } from '@/lib/i18n';
import { LanguageSwitch } from './language-switch';

/**
 * Cabeçalho fixo: logo à esquerda, seções, seletor PT | EN e o convite para
 * conversar. Na página de projeto, a navegação vira "Voltar aos projetos".
 */
export function SiteHeader({
  locale,
  path,
  variant = 'home',
  ctaLabel,
}: {
  locale: Locale;
  /** Página atual sem o prefixo de idioma — usada pelo seletor de idioma. */
  path: string;
  variant?: 'home' | 'project';
  ctaLabel?: string;
}) {
  const t = getDictionary(locale);
  const href = (id: string) => localePath(locale, `/#${id}`);
  const nav = [
    { id: SECTION_IDS.portfolio, label: t.nav.portfolio },
    { id: SECTION_IDS.services, label: t.nav.services },
    { id: SECTION_IDS.about, label: t.nav.about },
    { id: SECTION_IDS.testimonials, label: t.nav.testimonials },
    { id: SECTION_IDS.contact, label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 backdrop-blur-sm">
      <div className="section-container flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3">
        <Link href={localePath(locale, '/')} aria-label={t.a11y.home} className="flex py-2">
          {/* Tamanho mínimo da logo na tela: 96 px de largura. */}
          <Image src={DEFAULT_IMAGES.logo} alt="Bruno Victor" width={112} height={33} priority className="h-[33px] w-[112px]" />
        </Link>

        {variant === 'home' ? (
          <nav
            aria-label={t.a11y.mainNav}
            className="order-3 -mx-4 flex w-[calc(100%+2rem)] items-center gap-x-7 overflow-x-auto px-4 text-[15px] whitespace-nowrap [scrollbar-width:none] sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-8 md:order-none md:mx-0 md:w-auto md:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {nav.map((item) => (
              <Link key={item.id} href={href(item.id)} className="py-2 text-ink-muted transition-colors hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
        ) : (
          <Link
            href={href(SECTION_IDS.portfolio)}
            className="order-3 inline-flex min-h-11 items-center gap-2.5 text-[15px] text-ink-muted hover:text-ink md:order-none"
          >
            <ArrowLeft className="size-[18px]" strokeWidth={1.5} aria-hidden />
            {t.nav.backToProjects}
          </Link>
        )}

        <div className="flex items-center gap-4">
          <LanguageSwitch locale={locale} path={path} />
          {ctaLabel && (
            <Link
              href={href(SECTION_IDS.contact)}
              className="hidden min-h-10 items-center gap-2 rounded-sm border border-ink px-4 text-sm font-medium transition-colors hover:bg-ink hover:text-surface sm:inline-flex"
            >
              {ctaLabel} <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
