import { LOCALES } from '@bv/shared';
import type { MetadataRoute } from 'next';
import { getHomePage } from '@/lib/api/public';
import { SITE_URL } from '@/lib/config';
import { localePath } from '@/lib/i18n';

/** Cada página nos dois idiomas, com as versões alternativas (hreflang) ligadas. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getHomePage();
  const entry = (path: string, extra: Omit<MetadataRoute.Sitemap[number], 'url'>) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      alternates: { languages: { 'pt-BR': `${SITE_URL}${localePath('pt', path)}`, en: `${SITE_URL}${localePath('en', path)}` } },
      ...extra,
    }));

  return [
    ...entry('/', { changeFrequency: 'weekly', priority: 1 }),
    ...projects.flatMap((p) =>
      entry(`/portfolio/${p.slug}`, { lastModified: p.updatedAt, changeFrequency: 'monthly', priority: 0.8 }),
    ),
  ];
}
