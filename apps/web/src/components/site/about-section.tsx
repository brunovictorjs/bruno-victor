import { type AboutSettings, type Locale, localizer } from '@bv/shared';
import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { DEFAULT_IMAGES } from '@/lib/config';
import { getDictionary, SECTION_IDS } from '@/lib/i18n';
import { SectionHeading } from './section-heading';

/**
 * "Sobre" no tema claro do design system — o verso do cartão de visita: nome,
 * cargo, filete e a assinatura em mono. Linhas em branco do texto viram parágrafos.
 */
export function AboutSection({ about, locale }: { about: AboutSettings; locale: Locale }) {
  const t = getDictionary(locale);
  const a = localizer(about, locale);
  const paragraphs = a('text')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chips = [...(about.since ? [t.about.since(about.since)] : []), ...a('chips')];

  return (
    <section id={SECTION_IDS.about} className="scroll-mt-20 bg-paper text-paper-ink">
      {/* A foto é um recorte (corta na camisa): fica apoiada na base da seção, sem
          espaço embaixo. No celular ela vai para o fim, também encostada na base. */}
      <Reveal className="section-container flex flex-col gap-12 pt-24 lg:flex-row lg:items-end lg:gap-20 lg:pt-32">
        <div data-reveal className="order-last flex min-w-0 items-end justify-center lg:order-none lg:flex-[1_1_440px]">
          <Image
            src={about.imageUrl ?? DEFAULT_IMAGES.about}
            alt={t.about.photoAlt}
            width={1000}
            height={1500}
            sizes="(min-width: 1024px) 480px, 100vw"
            className="block h-auto w-full max-w-[380px] grayscale sm:max-w-[440px] lg:max-w-[480px]"
          />
        </div>
        <div className="flex min-w-0 flex-col gap-6 lg:flex-[1_1_520px] lg:pb-32">
          <SectionHeading
            index="03"
            tag={t.about.tag}
            tone="light"
            title={
              <>
                Bruno Victor
                <span className="mt-2 block text-[clamp(20px,2vw,24px)] leading-[30px] font-normal tracking-normal text-paper-muted">
                  {t.about.role}
                </span>
              </>
            }
          />
          <span data-reveal aria-hidden className="h-px w-full bg-paper-hairline" />
          {a('opening') && (
            <p data-reveal className="text-[22px] leading-8 font-medium">
              {a('opening')}
            </p>
          )}
          {paragraphs.map((p) => (
            <p data-reveal key={p.slice(0, 40)} className="text-[17px] leading-7 text-paper-muted">
              {p}
            </p>
          ))}
          {chips.length > 0 && (
            <ul data-reveal className="flex flex-wrap gap-2">
              {chips.map((chip, i) => (
                <li key={i} className="rounded-md border border-paper-line px-3.5 py-2 text-sm">
                  {chip}
                </li>
              ))}
            </ul>
          )}
          {about.handle && (
            <span data-reveal className="font-mono text-sm font-light text-paper-muted">
              {about.handle}
            </span>
          )}
        </div>
      </Reveal>
    </section>
  );
}
