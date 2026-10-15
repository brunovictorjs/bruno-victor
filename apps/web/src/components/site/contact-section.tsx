'use client';

import { type ContactSettings, type Locale, localizer } from '@bv/shared';
import { Check } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { gsap, MOTION } from '@/components/motion/gsap';
import { Reveal } from '@/components/motion/reveal';
import { type FormState } from '@/lib/actions/auth';
import { sendContactAction } from '@/lib/actions/contact';
import { getDictionary, SECTION_IDS } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const onlyDigits = (s: string) => s.replace(/\D/g, '');

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="label-caps">
        {label}
      </label>
      {children}
      {error && (
        <span id={`${id}-erro`} className="text-[13px] text-danger">
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Contato: canais com rótulos curtos em mono (como o verso do cartão) e o
 * formulário, que salva em Mensagens no painel e avisa Bruno por e-mail.
 */
export function ContactSection({ contact, workTypes, locale }: { contact: ContactSettings; workTypes: string[]; locale: Locale }) {
  const t = getDictionary(locale).contact;
  const c = localizer(contact, locale);
  const [state, action, pending] = useActionState<FormState, FormData>(sendContactAction, {});
  const [sentKey, setSentKey] = useState(0);
  const successRef = useRef<HTMLDivElement>(null);
  const sent = state.success === 'ok' && sentKey === 0;
  const fe = state.fieldErrors ?? {};

  useEffect(() => {
    if (!sent || !successRef.current || !window.matchMedia(MOTION.ok).matches) return;
    gsap.from(successRef.current.children, { autoAlpha: 0, y: 24, stagger: 0.1 });
  }, [sent]);

  // Rótulos do design system: tel / ig / … em mono, minúsculos.
  const channels = [
    contact.whatsapp && { tag: 'tel', label: contact.whatsapp, href: `https://wa.me/${onlyDigits(contact.whatsapp)}` },
    contact.recipientEmail && { tag: 'email', label: contact.recipientEmail, href: `mailto:${contact.recipientEmail}` },
    contact.instagram && {
      tag: 'ig',
      label: contact.instagram,
      href: `https://instagram.com/${contact.instagram.replace(/^@/, '')}`,
    },
    contact.linkedin && { tag: 'in', label: contact.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: contact.linkedin },
    contact.github && { tag: 'gh', label: contact.github.replace(/^https?:\/\/(www\.)?/, ''), href: contact.github },
    c('city') && { tag: 'loc', label: c('city') },
  ].filter(Boolean) as { tag: string; label: string; href?: string }[];

  const responseTime = c('responseTime');
  const invalid = (k: string) => (fe[k] ? { 'aria-invalid': true, 'aria-describedby': `c-${k}-erro` } : {});

  return (
    <section id={SECTION_IDS.contact} className="bg-brand scroll-mt-20 border-t border-hairline">
      <Reveal className="section-container flex flex-wrap gap-16 py-24 lg:py-32">
        <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-8">
          <div className="flex flex-col gap-4">
            <span data-reveal className="tag-code flex items-center gap-3">
              <span>05</span>
              <span aria-hidden className="h-px w-8 bg-hairline" />
              <span>&lt;{t.tag} /&gt;</span>
            </span>
            <h2 data-reveal className="text-[clamp(44px,5.4vw,76px)] leading-[0.98] font-semibold tracking-[-0.02em]">
              {t.title}
            </h2>
          </div>
          <p data-reveal className="max-w-[420px] text-lg leading-7 text-ink-muted">
            {t.intro}
            {responseTime ? t.within(responseTime) : ''}.
          </p>
          <ul data-reveal aria-label={t.channels} className="flex flex-col border-t border-hairline">
            {channels.map(({ tag, label, href }) => {
              const content = (
                <>
                  <span className="w-12 flex-none font-mono text-[13px] font-light text-ink-muted">{tag}</span>
                  <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
                </>
              );
              return (
                <li key={tag} className="border-b border-hairline">
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith('mailto:') ? undefined : '_blank'}
                      rel="noopener noreferrer"
                      className="group flex min-h-13 items-center gap-3 py-3 transition-colors hover:text-ink-muted"
                    >
                      {content}
                      <span aria-hidden className="ml-auto text-ink-muted transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </a>
                  ) : (
                    <span className="flex min-h-13 items-center gap-3 py-3">{content}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div data-reveal className="min-w-0 flex-[1_1_520px] rounded-md border border-hairline bg-surface p-6 sm:p-10">
          {sent ? (
            <div ref={successRef} role="status" className="flex min-h-[520px] flex-col items-start justify-center gap-5">
              <span aria-hidden className="flex size-14 items-center justify-center rounded-sm border border-line-strong">
                <Check className="size-6" strokeWidth={1.5} />
              </span>
              <span className="text-[40px] leading-[1.05] font-semibold tracking-[-0.02em]">{t.sentTitle}</span>
              <p className="max-w-[420px] text-lg leading-7 text-ink-muted">{t.sentText}</p>
              <button type="button" onClick={() => setSentKey((k) => k + 1)} className="btn-secondary">
                {t.sendAnother}
              </button>
            </div>
          ) : (
            <form key={sentKey} action={action} className="flex flex-col gap-5" noValidate>
              <input type="hidden" name="locale" value={locale} />
              {/* Honeypot: invisível para pessoas, preenchido por robôs. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
                <label htmlFor="c-site">Site</label>
                <input id="c-site" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                <Field id="c-name" label={t.name} error={fe.name}>
                  <input id="c-name" name="name" className="field" placeholder={t.namePlaceholder} autoComplete="name" required {...invalid('name')} />
                </Field>
                <Field id="c-phone" label={t.phone} error={fe.phone}>
                  <input id="c-phone" name="phone" type="tel" className="field" placeholder={t.phonePlaceholder} autoComplete="tel" {...invalid('phone')} />
                </Field>
              </div>
              <Field id="c-email" label={t.email} error={fe.email}>
                <input id="c-email" name="email" type="email" className="field" placeholder={t.emailPlaceholder} autoComplete="email" required {...invalid('email')} />
              </Field>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
                <Field id="c-workType" label={t.workType} error={fe.workType}>
                  <select id="c-workType" name="workType" className="field" defaultValue={workTypes[0]} {...invalid('workType')}>
                    {[...workTypes, t.other].map((w) => (
                      <option key={w}>{w}</option>
                    ))}
                  </select>
                </Field>
                <Field id="c-desiredDate" label={t.desiredDate} error={fe.desiredDate}>
                  <input id="c-desiredDate" name="desiredDate" type="date" lang={locale === 'en' ? 'en' : 'pt-BR'} className="field [color-scheme:dark]" />
                </Field>
              </div>
              <Field id="c-message" label={t.message} error={fe.message}>
                <textarea id="c-message" name="message" rows={5} className="field" placeholder={t.messagePlaceholder} required {...invalid('message')} />
              </Field>
              {state.error && (
                <p role="alert" className="text-sm text-danger">
                  {state.error}
                </p>
              )}
              <button type="submit" disabled={pending} className={cn('btn-primary min-h-14', pending && 'opacity-70')}>
                {pending ? t.sending : t.submit} {!pending && <span aria-hidden>→</span>}
              </button>
              <p className="text-[13px] leading-[18px] text-ink-muted">{t.privacy}</p>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
