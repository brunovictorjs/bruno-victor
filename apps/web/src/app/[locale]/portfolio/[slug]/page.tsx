import { isLocale, type Locale, localized } from '@bv/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ProjectView } from '@/components/site/project-view';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { getHomePage, getProjectPage, getPublicSettings } from '@/lib/api/public';
import { getDictionary } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

type Props = PageProps<'/[locale]/portfolio/[slug]'>;

async function resolve(params: Props['params']): Promise<{ locale: Locale; slug: string }> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  return { locale, slug };
}

/** Pré-renderiza os projetos publicados nos dois idiomas; novos entram sob demanda (ISR). */
export async function generateStaticParams() {
  const { projects } = await getHomePage();
  // Cache Components exige ao menos um parâmetro.
  return projects.length ? projects.map((p) => ({ slug: p.slug })) : [{ slug: 'sem-projetos' }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await resolve(params);
  const page = await getProjectPage(slug);
  if (!page) return { title: getDictionary(locale).meta.projectNotFound };
  const { project } = page;
  const title = localized(project, 'title', locale);
  const description = localized(project, 'summary', locale) ?? undefined;
  return {
    title,
    description,
    alternates: alternates(locale, `/portfolio/${slug}`),
    openGraph: {
      title,
      description,
      locale: getDictionary(locale).meta.ogLocale,
      images: project.coverUrl ? [{ url: project.coverUrl }] : undefined,
    },
  };
}

async function ProjectContent({ params }: Pick<Props, 'params'>) {
  const { locale, slug } = await resolve(params);
  const page = await getProjectPage(slug);
  if (!page) notFound();
  return <ProjectView project={page.project} next={page.next} locale={locale} />;
}

function ProjectSkeleton() {
  return (
    <div className="section-container flex animate-pulse flex-col gap-6 pt-24 pb-16" aria-busy="true">
      <div className="h-3 w-48 rounded-sm bg-surface-100" />
      <div className="h-24 w-3/4 rounded-sm bg-surface-100" />
      <div className="aspect-[16/8] w-full rounded-md bg-surface-100" />
    </div>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await resolve(params);
  const { hero, about } = await getPublicSettings();
  const path = `/portfolio/${slug}`;
  return (
    <>
      <SiteHeader locale={locale} path={path} variant="project" />
      <main id="conteudo">
        <Suspense fallback={<ProjectSkeleton />}>
          <ProjectContent params={params} />
        </Suspense>
      </main>
      <SiteFooter locale={locale} path={path} tagline={localized(hero, 'tagline', locale)} handle={about.handle} />
    </>
  );
}
