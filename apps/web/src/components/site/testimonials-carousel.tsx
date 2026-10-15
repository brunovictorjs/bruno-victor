'use client';

import { type Locale, localized, type TestimonialDto } from '@bv/shared';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { type PointerEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, MOTION } from '@/components/motion/gsap';
import { getDictionary } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Stars } from './stars';

const AUTOPLAY_MS = 4500;
const SWIPE_PX = 40;

/**
 * Carrossel de depoimentos em loop infinito. O trilho é movido por transform
 * (GSAP), não por rolagem nativa, então se comporta igual em qualquer navegador.
 * Para o loop, a lista é renderizada duas vezes: ao passar do último card a
 * posição volta à primeira cópia sem animação, sem o visitante perceber.
 *
 * Avança sozinho; pausa com o mouse em cima, com foco de teclado dentro ou
 * pelo botão de pausa, e não roda para quem prefere movimento reduzido.
 */
export function TestimonialsCarousel({ testimonials, locale }: { testimonials: TestimonialDto[]; locale: Locale }) {
  const t = getDictionary(locale).testimonials;
  const n = testimonials.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  /** Posição no trilho: 0..n (n = início da cópia, equivale a 0). */
  const pos = useRef(0);
  const step = useRef(0);
  const [index, setIndex] = useState(0);
  const [fits, setFits] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  const loop = !fits && n > 1;

  // Mede a distância entre cards e se todos cabem de uma vez (aí não há carrossel).
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const measure = () => {
      const slides = track.querySelectorAll<HTMLElement>('[data-slide]');
      if (slides.length < 2) return;
      step.current = slides[1].offsetLeft - slides[0].offsetLeft;
      setFits((n - 1) * step.current + slides[0].offsetWidth <= track.clientWidth + 1);
      gsap.set(track, { x: -pos.current * step.current });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [n]);

  useEffect(() => {
    const mq = window.matchMedia(MOTION.reduce);
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /** Anima até a posição `to` do trilho (abaixo de 0 entra pelo fim da cópia). */
  const moveTo = useCallback(
    (to: number) => {
      const track = trackRef.current;
      if (!track || !step.current) return;
      // Fora de 0..n, desloca o trilho uma volta inteira (a cópia mostra a mesma
      // imagem) a partir de onde ele está agora, e anima dali. Vale também para
      // cliques no meio de uma animação.
      let x = gsap.getProperty(track, 'x') as number;
      const lap = n * step.current;
      while (to < 0) { x -= lap; to += n; }
      while (to > n) { x += lap; to -= n; }
      gsap.set(track, { x });
      pos.current = to;
      setIndex(to % n);
      gsap.to(track, {
        x: -to * step.current,
        duration: reducedMotion ? 0 : 0.6,
        ease: 'power3.inOut',
        overwrite: true,
        onComplete: () => {
          // Chegou à cópia do primeiro: volta ao original sem animação.
          if (pos.current >= n) {
            pos.current -= n;
            gsap.set(track, { x: -pos.current * step.current });
          }
        },
      });
    },
    [n, reducedMotion],
  );

  const next = useCallback(() => moveTo(pos.current + 1), [moveTo]);
  const prev = useCallback(() => moveTo(pos.current - 1), [moveTo]);

  // Avanço automático; o relógio recomeça a cada troca (inclusive as manuais).
  const autoplay = loop && !reducedMotion && !hovering && !keyboardFocus && !userPaused;
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => {
      if (!document.hidden) next();
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, next, index]);

  // Arrastar com o dedo (ou o mouse) para trocar.
  const drag = useRef<{ x: number; id: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    if (!loop || (e.pointerType === 'mouse' && e.button !== 0)) return;
    // Termina uma animação em andamento para arrastar a partir da posição final.
    gsap.getTweensOf(trackRef.current).forEach((t) => t.progress(1));
    drag.current = { x: e.clientX, id: e.pointerId };
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 6 && !e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId);
    gsap.set(trackRef.current, { x: -pos.current * step.current + dx });
  };
  const onPointerEnd = (e: PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    drag.current = null;
    if (dx <= -SWIPE_PX) next();
    else if (dx >= SWIPE_PX) prev();
    else moveTo(pos.current);
  };

  const renderSlide = (item: TestimonialDto, i: number, clone: boolean) => {
    const jobLabel = localized(item, 'jobLabel', locale);
    return (
      <figure
        key={clone ? `${item.id}-copia` : item.id}
        data-slide
        role={clone ? undefined : 'group'}
        aria-roledescription={clone ? undefined : t.slide}
        aria-label={clone ? undefined : t.position(i + 1, n)}
        aria-hidden={clone || undefined}
        inert={clone || undefined}
        className="flex w-[85%] flex-none flex-col gap-6 rounded-md border border-hairline bg-surface-100 p-6 select-none sm:w-[calc((100%-1.5rem)/2)] sm:p-8 lg:w-[calc((100%-3rem)/3)]"
      >
        <Stars rating={item.rating} label={t.stars(item.rating)} />
        <blockquote className="text-base leading-7 sm:text-lg">“{localized(item, 'quote', locale)}”</blockquote>
        <figcaption className="mt-auto flex items-center gap-3 border-t border-hairline pt-5">
          {item.photoUrl ? (
            <Image src={item.photoUrl} alt="" width={44} height={44} draggable={false} className="size-11 rounded-full object-cover grayscale" />
          ) : (
            <span aria-hidden className="bg-brand size-11 rounded-full border border-hairline" />
          )}
          <span className="flex flex-col gap-0.5">
            <span className="text-[15px] font-medium">{item.clientName}</span>
            {jobLabel && <span className="text-[13px] text-ink-muted">{jobLabel}</span>}
          </span>
        </figcaption>
      </figure>
    );
  };

  return (
    <div
      data-reveal
      role="region"
      aria-roledescription={t.carousel}
      aria-label={t.region}
      className="flex flex-col gap-8"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={(e) => e.target.matches(':focus-visible') && setKeyboardFocus(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setKeyboardFocus(false)}
      onKeyDown={(e) => {
        if (!loop) return;
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      }}
    >
      <div ref={viewportRef} className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
        <div
          ref={trackRef}
          aria-live={autoplay ? 'off' : 'polite'}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          className={cn('flex gap-6', loop && 'cursor-grab touch-pan-y active:cursor-grabbing')}
        >
          {testimonials.map((t, i) => renderSlide(t, i, false))}
          {loop && testimonials.map((t, i) => renderSlide(t, i, true))}
        </div>
      </div>

      {loop && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            {testimonials.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={t.goTo(i + 1)}
                aria-current={i === index}
                onClick={() => moveTo(i)}
                className="flex size-6 items-center justify-center"
              >
                <span className={cn('h-0.5 transition-all duration-300', i === index ? 'w-6 bg-ink' : 'w-2 bg-line-strong')} />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!reducedMotion && (
              <CarouselButton label={userPaused ? t.resume : t.pause} onClick={() => setUserPaused((p) => !p)}>
                {userPaused ? <Play className="size-4" strokeWidth={1.5} /> : <Pause className="size-4" strokeWidth={1.5} />}
              </CarouselButton>
            )}
            <CarouselButton label={t.prev} onClick={prev}>
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </CarouselButton>
            <CarouselButton label={t.next} onClick={next}>
              <ChevronRight className="size-5" strokeWidth={1.5} />
            </CarouselButton>
          </div>
        </div>
      )}
    </div>
  );
}

function CarouselButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-sm border border-line-strong transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-surface"
    >
      {children}
    </button>
  );
}
