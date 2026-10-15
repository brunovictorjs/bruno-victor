import type { Locale, TestimonialDto } from '@bv/shared';
import { Reveal } from '@/components/motion/reveal';
import { getDictionary, SECTION_IDS } from '@/lib/i18n';
import { SectionHeading } from './section-heading';
import { TestimonialsCarousel } from './testimonials-carousel';

export function TestimonialsSection({ testimonials, locale }: { testimonials: TestimonialDto[]; locale: Locale }) {
  if (testimonials.length === 0) return null;
  const t = getDictionary(locale);
  return (
    <Reveal as="section" id={SECTION_IDS.testimonials} className="section-container flex scroll-mt-20 flex-col gap-12 py-24 lg:py-32">
      <SectionHeading index="04" tag={t.testimonials.tag} title={t.testimonials.title} />
      <TestimonialsCarousel testimonials={testimonials} locale={locale} />
    </Reveal>
  );
}
