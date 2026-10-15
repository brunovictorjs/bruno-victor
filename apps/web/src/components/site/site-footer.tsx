import type { Locale } from '@bv/shared';
import { cacheLife } from 'next/cache';
import Image from 'next/image';
import { DEFAULT_IMAGES } from '@/lib/config';
import { getDictionary } from '@/lib/i18n';
import { LanguageSwitch } from './language-switch';

export async function SiteFooter({ locale, path, tagline, handle }: { locale: Locale; path: string; tagline: string; handle?: string }) {
  'use cache';
  cacheLife('days');
  const t = getDictionary(locale);
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand border-t border-hairline">
      <div className="section-container flex flex-col gap-10 py-14">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Image src={DEFAULT_IMAGES.logo} alt="Bruno Victor" width={156} height={46} className="h-[46px] w-[156px]" />
          <span className="label-caps">{tagline}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6 text-[13px] text-ink-muted">
          <span>
            © {year} Bruno Victor · {t.about.role}. {t.footer.rights}
          </span>
          <span className="flex items-center gap-5">
            {handle && <span className="font-mono">{handle}</span>}
            <LanguageSwitch locale={locale} path={path} />
          </span>
        </div>
      </div>
    </footer>
  );
}
