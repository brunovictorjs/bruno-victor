import { isLocale, LOCALES } from '@bv/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/i18n';
import { SITE_URL } from '@/lib/config';
import { fontVariables } from '../fonts';
import '../globals.css';

/** Os dois idiomas são pré-renderizados; outros valores nunca chegam aqui (veja proxy.ts). */
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Bruno Victor', template: '%s — Bruno Victor' },
};

/** Root layout do site público: o `lang` do documento acompanha o idioma da URL. */
export default async function SiteLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <html lang={t.meta.htmlLang} className={`${fontVariables} dark`}>
      <body className="min-h-dvh">
        <a
          href="#conteudo"
          className="sr-only z-50 rounded-sm bg-ink px-4 py-3 text-sm font-medium text-surface focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t.a11y.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
