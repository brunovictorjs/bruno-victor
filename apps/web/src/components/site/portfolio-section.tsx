'use client';

import { type CategoryDto, type Locale, localized, type ProjectSummaryDto } from '@bv/shared';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { Flip, gsap, MOTION } from '@/components/motion/gsap';
import { Reveal } from '@/components/motion/reveal';
import { getDictionary, localePath, SECTION_IDS } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { PhotoPlaceholder } from './photo-placeholder';
import { SectionHeading } from './section-heading';

const ALL = 'todos';

/**
 * "Trabalhos recentes": filtros por categoria com transição GSAP Flip — os
 * cards que ficam deslizam para a nova posição e os que saem/entram somem e
 * aparecem com escala.
 */
export function PortfolioSection({
  categories,
  projects,
  locale,
}: {
  categories: CategoryDto[];
  projects: ProjectSummaryDto[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const [filter, setFilter] = useState(ALL);
  const gridRef = useRef<HTMLDivElement>(null);
  /** Descrição da categoria + grade: é a altura deste bloco que animamos. */
  const areaRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const flipTl = useRef<gsap.core.Timeline | null>(null);
  const prevHeight = useRef(0);

  const chips = [{ slug: ALL, name: t.portfolio.all }, ...categories.map((c) => ({ slug: c.slug, name: localized(c, 'name', locale) }))];
  const visible = filter === ALL ? projects : projects.filter((p) => p.category.slug === filter);
  const active = categories.find((c) => c.slug === filter);
  const activeDescription = active ? localized(active, 'description', locale) : null;

  const pick = (slug: string) => {
    if (slug === filter) return;
    const grid = gridRef.current;
    const area = areaRef.current;
    if (grid && area && window.matchMedia(MOTION.ok).matches) {
      // A altura é lida antes do Flip.getState: ele conclui na hora qualquer
      // animação em andamento dos cards, e aí leríamos já a altura final.
      prevHeight.current = area.offsetHeight;
      flipState.current = Flip.getState(grid.querySelectorAll('[data-flip-card]'));
      flipTl.current?.progress(1).kill();
      // Trava a altura até a nova animação assumir, para nada abaixo se mexer.
      gsap.set(area, { height: prevHeight.current });
    }
    setFilter(slug);
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    const grid = gridRef.current;
    const area = areaRef.current;
    if (!state || !grid || !area) return;
    flipState.current = null;
    // Com `absolute: true` os cards saem do fluxo durante a animação; sem altura
    // fixa a grade colapsa e o conteúdo abaixo "pula". A altura é interpolada na
    // mesma timeline do Flip e só é liberada quando ela inteira termina.
    gsap.set(area, { height: 'auto' }); // antes da pintura: só para medir
    const nextHeight = area.offsetHeight;
    const tl = Flip.from(state, {
      targets: grid.querySelectorAll('[data-flip-card]'),
      duration: 0.7,
      ease: 'power3.inOut',
      absolute: true,
      nested: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.6, delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.94, duration: 0.4 }),
      onComplete: () => gsap.set(area, { clearProps: 'height' }),
    });
    tl.fromTo(area, { height: prevHeight.current }, { height: nextHeight, duration: 0.7, ease: 'power3.inOut' }, 0);
    flipTl.current = tl;
  }, [filter]);

  return (
    <Reveal as="section" id={SECTION_IDS.portfolio} className="section-container flex scroll-mt-24 flex-col gap-12 pt-24 pb-16 lg:pt-32">
      <SectionHeading
        index="01"
        tag={t.portfolio.tag}
        title={t.portfolio.title}
        aside={
          chips.length > 2 && (
            <div data-reveal role="group" aria-label={t.portfolio.filterLabel} className="flex flex-wrap gap-2">
              {chips.map((c) => {
                const on = c.slug === filter;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => pick(c.slug)}
                    className={cn(
                      'min-h-11 rounded-md border px-4 text-sm transition-colors',
                      on ? 'border-ink bg-ink font-medium text-surface' : 'border-hairline text-ink-muted hover:border-line-strong hover:text-ink',
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )
        }
      />

      <div ref={areaRef} className="-mt-4 flex flex-col gap-8">
        {activeDescription && <p className="max-w-2xl text-ink-muted">{activeDescription}</p>}

        <div ref={gridRef} className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(min(100%,520px),1fr))] gap-x-8 gap-y-16">
          {visible.map((p) => {
            const title = localized(p, 'title', locale);
            const summary = localized(p, 'summary', locale);
            return (
              <Link
                key={p.id}
                href={localePath(locale, `/portfolio/${p.slug}`)}
                data-flip-id={p.id}
                data-flip-card
                data-reveal
                aria-label={t.portfolio.open(title)}
                className="group flex flex-col gap-5"
              >
                <div className="overflow-hidden rounded-md border border-hairline bg-surface-100">
                  {p.coverUrl ? (
                    <Image
                      src={p.coverUrl}
                      alt=""
                      width={1200}
                      height={750}
                      sizes="(min-width: 1100px) 600px, 100vw"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <PhotoPlaceholder label={t.project.cover} className="aspect-[16/10] transition-transform duration-500 group-hover:scale-[1.03]" />
                  )}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="label-caps">
                      {localized(p.category, 'name', locale)}
                      {p.year ? ` · ${p.year}` : ''}
                    </span>
                    <span className="text-[26px] leading-8 font-medium">{title}</span>
                    {summary && <span className="text-[15px] leading-[22px] text-ink-muted">{summary}</span>}
                    {p.stack.length > 0 && (
                      <span className="mt-1 font-mono text-[13px] font-light text-ink-muted">{p.stack.join(' / ')}</span>
                    )}
                  </div>
                  <span
                    aria-hidden
                    className="flex size-12 flex-none items-center justify-center rounded-sm border border-line-strong transition-colors duration-200 group-hover:border-ink group-hover:bg-ink group-hover:text-surface"
                  >
                    <ArrowUpRight className="size-5" strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {visible.length === 0 && <p className="text-ink-muted">{t.portfolio.empty}</p>}
      </div>
    </Reveal>
  );
}
