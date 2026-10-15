import type { SiteSettings } from '@bv/shared';
import { domainEvent, type Actor, type DomainEvent } from '../../../shared/domain/domain-event.js';

export type SettingsSection = keyof SiteSettings;
export const SETTINGS_SECTIONS: SettingsSection[] = ['hero', 'clients', 'about', 'contact', 'seo'];

const SECTION_LABEL: Record<SettingsSection, string> = {
  hero: 'o hero',
  clients: 'os logos de clientes',
  about: 'o Sobre mim',
  contact: 'os dados de contato',
  seo: 'os metadados (SEO)',
};

/**
 * Conteúdo padrão, na voz do design system BV (claro, curto, sem enfeite),
 * em português e inglês. Tudo editável no painel.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero: {
    tag: 'desenvolvedor',
    tagEn: 'developer',
    line1: 'Do site',
    line1En: 'From website',
    line2: 'ao sistema.',
    line2En: 'to system.',
    code: "const dev = 'BV';",
    text: 'Construo produtos web do back ao front: sites, sistemas sob medida e as integrações que fazem tudo conversar.',
    textEn: 'I build web products from back to front: websites, custom systems and the integrations that make everything talk.',
    primaryButton: 'Vamos conversar',
    primaryButtonEn: "Let's talk",
    secondaryButton: 'Ver projetos',
    secondaryButtonEn: 'See projects',
    since: '',
    tagline: 'Back-end · Front-end · Integrações',
    taglineEn: 'Back-end · Front-end · Integrations',
    imageUrl: null,
  },
  clients: { visible: true, title: 'Clientes e parceiros', titleEn: 'Clients and partners', logos: [] },
  about: {
    opening: 'Escrevo código como gostaria de ler: claro, curto, sem enfeite.',
    openingEn: "I write code the way I'd like to read it: clear, short, no frills.",
    text: 'Trabalho do back ao front: modelo o banco, escrevo a API, construo a interface e cuido do deploy.\n\nCada projeto tem entregas parciais para você acompanhar. Você vê o sistema funcionando desde as primeiras semanas, não só no final.',
    textEn: 'I work from back to front: I model the database, write the API, build the interface and handle the deploy.\n\nEvery project has partial deliveries you can follow. You see the system working from the first weeks, not only at the end.',
    chips: ['Back-end e front-end', 'APIs e integrações', 'Entregas parciais'],
    chipsEn: ['Back-end and front-end', 'APIs and integrations', 'Partial deliveries'],
    handle: '@brunovictor.jsx',
    since: '',
    imageUrl: null,
  },
  contact: {
    recipientEmail: '',
    ccEmails: '',
    whatsapp: '+55 81 98736-3068',
    instagram: '@brunovictor.jsx',
    linkedin: '',
    github: '',
    city: '',
    cityEn: '',
    responseTime: '24h',
    responseTimeEn: '24 hours',
  },
  seo: {
    title: 'Bruno Victor — Desenvolvedor de Software',
    titleEn: 'Bruno Victor — Software Developer',
    description: 'Sites, sistemas web sob medida, APIs e integrações. Do back ao front, com entregas parciais para você acompanhar.',
    descriptionEn: 'Websites, custom web systems, APIs and integrations. From back to front, with partial deliveries you can follow.',
    shareImageUrl: null,
    faviconUrl: null,
  },
};

/** Coleta todas as URLs de imagem usadas nas configurações. */
export function imageUrlsOf(s: SiteSettings): Set<string> {
  const urls = [
    s.hero.imageUrl,
    s.about.imageUrl,
    s.seo.shareImageUrl,
    s.seo.faviconUrl,
    ...s.clients.logos.map((l) => l.imageUrl),
  ];
  return new Set(urls.filter((u): u is string => !!u));
}

/** Devolve um evento por seção alterada (alimenta a "Atividade recente"). */
export function diffSettings(before: SiteSettings, after: SiteSettings, actor: Actor): DomainEvent[] {
  return SETTINGS_SECTIONS.filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k])).map((section) =>
    domainEvent('site.settings.updated', actor, { section, label: SECTION_LABEL[section] }),
  );
}
