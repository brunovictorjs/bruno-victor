import { DEFAULT_WORK_TYPES, isLocale, type Locale, localized, localizer } from '@bv/shared';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AboutSection } from '@/components/site/about-section';
import { ClientsStrip } from '@/components/site/clients-strip';
import { ContactSection } from '@/components/site/contact-section';
import { Hero } from '@/components/site/hero';
import { PortfolioSection } from '@/components/site/portfolio-section';
import { ServicesSection } from '@/components/site/services-section';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { TestimonialsSection } from '@/components/site/testimonials-section';
import { getHomePage, getPublicSettings } from '@/lib/api/public';
import { DEFAULT_IMAGES } from '@/lib/config';
import { getDictionary } from '@/lib/i18n';
import { alternates } from '@/lib/seo';

async function getLocaleParam(params: PageProps<'/[locale]'>['params']): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const locale = await getLocaleParam(params);
  const { seo } = await getPublicSettings();
  const s = localizer(seo, locale);
  return {
    title: { absolute: s('title') },
    description: s('description'),
    icons: seo.faviconUrl ? { icon: seo.faviconUrl } : undefined,
    alternates: alternates(locale, '/'),
    openGraph: {
      title: s('title'),
      description: s('description'),
      type: 'website',
      locale: getDictionary(locale).meta.ogLocale,
      // Sem imagem própria, usa a padrão (src/app/opengraph-image.png).
      images: [{ url: seo.shareImageUrl ?? DEFAULT_IMAGES.shareImage, width: 1200, height: 630 }],
    },
  };
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const locale = await getLocaleParam(params);
  const { settings, categories, projects, services, testimonials } = await getHomePage();
  const workTypes = services.length ? services.map((s) => localized(s, 'name', locale)) : [...DEFAULT_WORK_TYPES[locale]];

  return (
    <>
      <SiteHeader locale={locale} path="/" ctaLabel={localized(settings.hero, 'primaryButton', locale)} />
      <main id="conteudo">
        <Hero hero={settings.hero} locale={locale} />
        <ClientsStrip clients={settings.clients} locale={locale} />
        <PortfolioSection categories={categories} projects={projects} locale={locale} />
        <ServicesSection services={services} locale={locale} />
        <AboutSection about={settings.about} locale={locale} />
        <TestimonialsSection testimonials={testimonials} locale={locale} />
        <ContactSection contact={settings.contact} workTypes={workTypes} locale={locale} />
      </main>
      <SiteFooter locale={locale} path="/" tagline={localized(settings.hero, 'tagline', locale)} handle={settings.about.handle} />
    </>
  );
}
