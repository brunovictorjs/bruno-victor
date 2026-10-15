import { formatPrice, type Locale, localizer, type ServiceDto } from '@bv/shared';
import { ServiceIcon } from '@/components/icons';
import { Reveal } from '@/components/motion/reveal';
import { getDictionary, localePath, SECTION_IDS } from '@/lib/i18n';
import { SectionHeading } from './section-heading';

/** Preço só aparece quando foi definido no painel; "sob consulta" vira um rótulo discreto. */
export function priceLabel(s: Pick<ServiceDto, 'priceMode' | 'priceCents'>, locale: Locale) {
  const t = getDictionary(locale).services;
  if (s.priceMode === 'ON_REQUEST' || s.priceCents == null) return { label: t.price, value: t.priceMode.ON_REQUEST };
  return { label: t.priceMode[s.priceMode], value: `${t.currency} ${formatPrice(s.priceCents, locale)}` };
}

/**
 * Card de serviço no formato do "slide de serviço" do design system: numeral
 * grande em hairline (decorativo), título, uma frase em ink-muted e a lista
 * com a barra da logo como marcador. Reaproveitado na prévia do painel.
 */
export function ServiceCard({ service, locale, index }: { service: ServiceDto; locale: Locale; index: number }) {
  const t = getDictionary(locale);
  const s = localizer(service, locale);
  const price = priceLabel(service, locale);
  const onRequest = service.priceMode === 'ON_REQUEST' || service.priceCents == null;
  return (
    <article data-reveal className="relative flex flex-col gap-5 overflow-hidden rounded-md border border-hairline bg-surface-100 p-6 sm:p-8">
      <span aria-hidden className="pointer-events-none absolute -top-3 right-4 text-[96px] leading-none font-semibold text-hairline select-none">
        {String(index + 1).padStart(2, '0')}
      </span>
      <ServiceIcon icon={service.icon} size={28} className="relative text-ink" />
      <h3 className="relative text-2xl leading-[30px] font-medium">{s('name')}</h3>
      {s('description') && <p className="text-[15px] leading-6 text-ink-muted">{s('description')}</p>}
      {s('includes').length > 0 && (
        <ul className="flex flex-col border-t border-hairline">
          {s('includes').map((item) => (
            <li key={item} className="flex gap-3 border-b border-hairline py-3 text-[15px] leading-5">
              <span aria-hidden className="font-mono font-light text-ink-muted">
                /
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-2">
        {onRequest ? (
          <span className="label-caps">{price.value}</span>
        ) : (
          <span className="flex flex-col gap-1">
            <span className="label-caps">{price.label}</span>
            <span className="text-2xl font-semibold">{price.value}</span>
          </span>
        )}
        <a href={localePath(locale, `/#${SECTION_IDS.contact}`)} className="inline-flex min-h-11 items-center gap-2 text-[15px] font-medium hover:underline hover:underline-offset-4">
          {t.services.cta} <span aria-hidden>→</span>
        </a>
      </div>
    </article>
  );
}

export function ServicesSection({ services, locale }: { services: ServiceDto[]; locale: Locale }) {
  if (services.length === 0) return null;
  const t = getDictionary(locale);
  return (
    <section id={SECTION_IDS.services} className="scroll-mt-20 border-t border-hairline">
      <Reveal className="section-container flex flex-col gap-12 py-24 lg:py-32">
        <SectionHeading
          index="02"
          tag={t.services.tag}
          title={t.services.title}
          aside={
            <p data-reveal className="max-w-[420px] leading-6 text-ink-muted">
              {t.services.aside}
            </p>
          }
        />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,270px),1fr))] gap-6">
          {services.map((s, i) => (
            <ServiceCard key={s.id} service={s} locale={locale} index={i} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
