import { type Locale, localized, localizer, type ProjectDetailDto, type PublicProjectPageDto } from '@bv/shared';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { formatMonthYear, getDictionary, localePath, SECTION_IDS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { LightboxProvider, OpenPhotoButton } from './lightbox';
import { PhotoPlaceholder } from './photo-placeholder';

/** Ritmo da galeria, repetido a cada 6 imagens (telas largas e recortes de detalhe). */
const LAYOUT = [
  { span: 'md:col-span-12', ratio: 'aspect-[16/9]' },
  { span: 'md:col-span-7', ratio: 'aspect-[4/3]' },
  { span: 'md:col-span-5', ratio: 'aspect-[4/5]' },
  { span: 'md:col-span-6', ratio: 'aspect-[16/10]' },
  { span: 'md:col-span-6', ratio: 'aspect-[16/10]' },
  { span: 'md:col-span-12', ratio: 'aspect-[16/8]' },
];

/**
 * Página de um projeto. Usada no site público e na pré-visualização do painel
 * (por isso não busca dados: recebe o projeto pronto).
 */
export function ProjectView({
  project,
  next,
  locale,
}: {
  project: ProjectDetailDto;
  next: PublicProjectPageDto['next'];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const p = localizer(project, locale);
  const title = p('title');
  const cover = project.photos.find((ph) => ph.id === project.coverPhotoId) ?? project.photos[0];
  const coverIndex = cover ? project.photos.indexOf(cover) : 0;
  const facts = [
    [t.project.client, project.client],
    [t.project.service, project.service ? localized(project.service, 'name', locale) : null],
    [t.project.date, formatMonthYear(project.date, locale)],
    [t.project.role, p('role')],
    [t.project.duration, p('duration')],
  ].filter((f): f is [string, string] => !!f[1]);
  const story = [
    ['01', t.project.story.challenge, p('challenge')],
    ['02', t.project.story.approach, p('approach')],
    ['03', t.project.story.result, p('result')],
  ].filter((s): s is [string, string, string] => !!s[2]);
  const intro = p('intro');
  const hasDetails = facts.length > 0 || project.stack.length > 0 || intro || story.length > 0;

  return (
    <LightboxProvider photos={project.photos} locale={locale}>
      {/* CABEÇALHO */}
      <Reveal as="section" className="section-container flex flex-col gap-6 pt-20 pb-14 lg:pt-24">
        <span data-reveal className="tag-code flex flex-wrap items-center gap-3">
          <span>&lt;{localized(project.category, 'name', locale).toLowerCase()} /&gt;</span>
          {project.year && (
            <>
              <span aria-hidden className="h-px w-6 bg-hairline" />
              <span>{project.year}</span>
            </>
          )}
        </span>
        <h1 data-reveal className="max-w-[1100px] text-[clamp(44px,7.4vw,112px)] leading-[0.98] font-semibold tracking-[-0.02em]">
          {title}
        </h1>
        {p('summary') && (
          <p data-reveal className="max-w-[720px] text-[22px] leading-8 text-ink-muted">
            {p('summary')}
          </p>
        )}
        {(project.liveUrl || project.repoUrl) && (
          <div data-reveal className="flex flex-wrap gap-3 pt-2">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                {t.project.live} <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                {t.project.repo} <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
              </a>
            )}
          </div>
        )}
      </Reveal>

      {/* CAPA */}
      <section aria-label={t.project.cover} className="mx-auto max-w-[1440px] px-4 sm:px-6">
        {cover ? (
          <OpenPhotoButton index={coverIndex} label={t.project.enlargeCover} className="overflow-hidden rounded-md border border-hairline">
            <Image
              src={cover.url}
              alt={localized(cover, 'caption', locale) ?? title}
              width={cover.width || 2400}
              height={cover.height || 1200}
              priority
              sizes="100vw"
              className="aspect-[16/8] w-full object-cover transition-opacity hover:opacity-90"
            />
          </OpenPhotoButton>
        ) : (
          <PhotoPlaceholder label={t.project.cover} className="aspect-[16/8] rounded-md" />
        )}
      </section>

      {/* FICHA + DESCRIÇÃO */}
      {hasDetails && (
        <Reveal as="section" className="section-container flex flex-wrap gap-16 py-24">
          {(facts.length > 0 || project.stack.length > 0) && (
            <aside aria-label={t.project.facts} className="min-w-0 flex-[1_1_280px]">
              <dl className="flex flex-col border-t border-hairline">
                {facts.map(([label, value]) => (
                  <div data-reveal key={label} className="flex flex-col gap-1.5 border-b border-hairline py-4.5">
                    <dt className="label-caps">{label}</dt>
                    <dd className="text-[17px]">{value}</dd>
                  </div>
                ))}
                {project.stack.length > 0 && (
                  <div data-reveal className="flex flex-col gap-3 border-b border-hairline py-4.5">
                    <dt className="label-caps">{t.project.stack}</dt>
                    <dd>
                      <ul className="flex flex-wrap gap-2">
                        {project.stack.map((tech) => (
                          <li key={tech} className="rounded-md border border-hairline bg-surface-100 px-2.5 py-1.5 font-mono text-[13px] font-light">
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </aside>
          )}
          <article className="flex min-w-0 flex-[999_1_560px] flex-col gap-14">
            {intro && (
              <div className="flex flex-col gap-4">
                <h2 data-reveal className="tag-code">
                  &lt;{t.project.about.toLowerCase()} /&gt;
                </h2>
                <p data-reveal className="text-[clamp(20px,2vw,26px)] leading-[1.45]">
                  {intro}
                </p>
              </div>
            )}
            {story.length > 0 && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-10">
                {story.map(([n, heading, text]) => (
                  <div data-reveal key={n} className="flex flex-col gap-3 border-t border-line-strong pt-5">
                    <span className="font-mono text-sm font-light text-ink-muted">{n}</span>
                    <h3 className="text-2xl leading-[30px] font-medium">{heading}</h3>
                    <p className="leading-[26px] text-ink-muted">{text}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </Reveal>
      )}

      {/* GALERIA */}
      {project.photos.length > 0 && (
        <Reveal as="section" aria-label={t.project.galleryLabel} className="section-container flex flex-col gap-8 pb-24">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-hairline pb-4">
            <h2 className="tag-code">&lt;{t.project.gallery.toLowerCase()} /&gt;</h2>
            <span className="font-mono text-[13px] font-light text-ink-muted">{t.project.imageCount(project.photos.length)}</span>
          </div>
          <div className="grid grid-cols-12 gap-6">
            {project.photos.map((photo, i) => {
              const l = LAYOUT[i % LAYOUT.length]!;
              const caption = localized(photo, 'caption', locale);
              return (
                <figure data-reveal key={photo.id} className={cn('col-span-12 m-0 flex flex-col gap-2.5', l.span)}>
                  <OpenPhotoButton index={i} label={t.project.enlarge(i + 1)} className="overflow-hidden rounded-md border border-hairline bg-surface-100">
                    <Image
                      src={photo.url}
                      alt={caption ?? t.project.imageAlt(title, i + 1)}
                      width={photo.width || 1600}
                      height={photo.height || 1200}
                      sizes="(min-width: 768px) 60vw, 100vw"
                      className={cn('w-full object-cover transition-transform duration-500 hover:scale-[1.02]', l.ratio)}
                    />
                  </OpenPhotoButton>
                  {caption && <figcaption className="text-[13px] leading-[18px] text-ink-muted">{caption}</figcaption>}
                </figure>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* DEPOIMENTO — tema claro */}
      {project.testimonial && (
        <section className="bg-paper text-paper-ink">
          <Reveal as="figure" className="mx-auto flex max-w-[1040px] flex-col gap-8 px-4 py-28 sm:px-12">
            <span data-reveal className="tag-code text-paper-muted">
              &lt;{t.project.clientSaid.toLowerCase()} /&gt;
            </span>
            <blockquote data-reveal className="text-[clamp(28px,3.6vw,46px)] leading-[1.15] font-medium tracking-[-0.01em]">
              “{localized(project.testimonial, 'quote', locale)}”
            </blockquote>
            <figcaption data-reveal className="flex flex-wrap items-center gap-3 border-t border-paper-hairline pt-5 text-[17px] font-medium">
              {project.testimonial.clientName}
              {localized(project.testimonial, 'jobLabel', locale) && (
                <span className="font-normal text-paper-muted">{localized(project.testimonial, 'jobLabel', locale)}</span>
              )}
            </figcaption>
          </Reveal>
        </section>
      )}

      {/* CTA + PRÓXIMO */}
      <Reveal as="section" className="section-container flex flex-wrap items-center justify-between gap-8 border-b border-hairline pt-28 pb-16">
        <span data-reveal className="text-[clamp(32px,4vw,48px)] leading-[1.05] font-semibold tracking-[-0.02em]">
          {t.project.ctaTitle}
        </span>
        <Link data-reveal href={localePath(locale, `/#${SECTION_IDS.contact}`)} className="btn-primary">
          {t.project.cta} <span aria-hidden>→</span>
        </Link>
      </Reveal>
      {next && (
        <Link href={localePath(locale, `/portfolio/${next.slug}`)} className="group block">
          <div className="section-container flex flex-wrap items-center justify-between gap-6 pt-16 pb-24">
            <div className="flex flex-col gap-3">
              <span className="tag-code">&lt;{t.project.next.toLowerCase()} /&gt;</span>
              <span className="text-[clamp(36px,6vw,88px)] leading-none font-semibold tracking-[-0.02em] transition-colors group-hover:text-ink-muted">
                {localized(next, 'title', locale)}
              </span>
            </div>
            <span
              aria-hidden
              className="flex size-20 items-center justify-center rounded-sm border border-line-strong transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-surface"
            >
              <ArrowRight className="size-7" strokeWidth={1.5} />
            </span>
          </div>
        </Link>
      )}
    </LightboxProvider>
  );
}
