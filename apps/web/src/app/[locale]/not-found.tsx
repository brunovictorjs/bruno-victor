import Link from 'next/link';
import { getDictionary, localePath } from '@/lib/i18n';
import { getLocale } from '@/lib/locale';

export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return (
    <main className="bg-brand flex min-h-dvh items-center">
      <div className="section-container flex flex-col items-start gap-6">
        <span className="tag-code">&lt;{t.notFound.tag} /&gt;</span>
        <h1 className="text-[clamp(44px,7vw,88px)] leading-[0.98] font-semibold tracking-[-0.02em]">{t.notFound.title}</h1>
        <p className="max-w-md text-lg leading-7 text-ink-muted">{t.notFound.text}</p>
        <Link href={localePath(locale, '/')} className="btn-primary">
          {t.notFound.back} <span aria-hidden>→</span>
        </Link>
      </div>
    </main>
  );
}
