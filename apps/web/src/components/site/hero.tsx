'use client';

import { type HeroSettings, type Locale, localizer } from '@bv/shared';
import Image from 'next/image';
import { useRef } from 'react';
import { gsap, MOTION, useGSAP } from '@/components/motion/gsap';
import { DEFAULT_IMAGES } from '@/lib/config';
import { getDictionary, SECTION_IDS } from '@/lib/i18n';

/**
 * Abertura do site, sobre o gradiente da marca. Animação de entrada: a tag
 * aparece, as linhas do título sobem por trás de uma máscara, a linha de
 * código é "digitada" e a foto desliza; ao rolar, a foto ganha parallax.
 */
export function Hero({ hero, locale }: { hero: HeroSettings; locale: Locale }) {
  const ref = useRef<HTMLElement>(null);
  const t = getDictionary(locale);
  const h = localizer(hero, locale);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION.ok, () => {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } });
        tl.from('[data-hero="tag"]', { autoAlpha: 0, x: -16, duration: 0.9 })
          .from('[data-hero="line"]', { yPercent: 110, stagger: 0.12 }, '<0.1')
          .fromTo(
            '[data-hero="code"]',
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: `steps(${Math.max(hero.code.length, 1)})` },
            '<0.4',
          )
          .from('[data-hero="fade"]', { autoAlpha: 0, y: 24, stagger: 0.1, duration: 0.9 }, '<0.1')
          .from('[data-hero="photo"]', { autoAlpha: 0, x: 60, duration: 1.6 }, 0.2);

        gsap.to('[data-hero="photo"]', {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id={SECTION_IDS.home} className="bg-brand relative overflow-hidden">
      <div className="section-container relative flex flex-wrap items-end gap-8 pt-16 lg:min-h-[760px]">
        <div className="relative z-10 flex min-w-0 flex-[0_1_620px] flex-col gap-8 pb-12 lg:pb-24">
          <div className="flex flex-col gap-5">
            <span data-hero="tag" className="tag-code text-base">
              &lt;{h('tag')} /&gt;
            </span>
            <h1 className="text-[clamp(48px,7.4vw,108px)] leading-[0.98] tracking-[-0.02em]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero="line" className="block font-semibold">
                  {h('line1')}
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                {/* Contraste da marca: peso grosso × fio fino. */}
                <span data-hero="line" className="block font-light text-ink-muted">
                  {h('line2')}
                </span>
              </span>
            </h1>
            {hero.code && (
              <code className="font-mono text-[15px] text-ink-muted">
                <span data-hero="code" className="inline-block">
                  {hero.code}
                </span>
                <span aria-hidden className="ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] animate-caret bg-ink-muted motion-reduce:animate-none" />
              </code>
            )}
          </div>
          <p data-hero="fade" className="max-w-[500px] text-lg leading-7 text-ink-muted">
            {h('text')}
          </p>
          <div data-hero="fade" className="flex flex-wrap gap-3">
            <a href={`#${SECTION_IDS.contact}`} className="btn-primary">
              {h('primaryButton')} <span aria-hidden>→</span>
            </a>
            <a href={`#${SECTION_IDS.portfolio}`} className="btn-secondary">
              {h('secondaryButton')}
            </a>
          </div>
          <div data-hero="fade" className="flex flex-wrap items-center gap-3 label-caps">
            {hero.since && (
              <>
                <span>
                  {t.hero.since} {hero.since}
                </span>
                <span aria-hidden className="h-px w-6 bg-hairline" />
              </>
            )}
            <span>{h('tagline')}</span>
          </div>
        </div>

        <div
          data-hero="photo"
          className="pointer-events-none w-full self-end lg:absolute lg:right-12 lg:bottom-0 lg:h-[calc(100%-64px)] lg:w-[52%]"
        >
          <Image
            src={hero.imageUrl ?? DEFAULT_IMAGES.hero}
            alt={t.hero.photoAlt}
            width={1100}
            height={1100}
            priority
            sizes="(min-width: 1024px) 52vw, 100vw"
            className="mx-auto h-auto w-full max-w-[560px] object-contain object-bottom grayscale contrast-[1.05] lg:h-full lg:max-w-none lg:object-right-bottom"
          />
        </div>
      </div>
    </section>
  );
}
