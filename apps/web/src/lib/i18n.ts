import { DEFAULT_LOCALE, type Locale, type PriceMode } from '@bv/shared';

/**
 * Textos fixos do site público, em português e inglês. O conteúdo editável
 * (projetos, serviços, hero…) vem da API com os dois idiomas e é escolhido
 * por `localized` (@bv/shared). O painel administrativo é só em português.
 */
const pt = {
  meta: {
    htmlLang: 'pt-BR',
    ogLocale: 'pt_BR',
    projectNotFound: 'Projeto não encontrado',
  },
  a11y: {
    skipToContent: 'Pular para o conteúdo',
    mainNav: 'Principal',
    home: 'Bruno Victor — início',
    language: 'Idioma',
    switchTo: 'Ler em português',
  },
  nav: {
    portfolio: 'Projetos',
    services: 'Serviços',
    about: 'Sobre',
    testimonials: 'Depoimentos',
    contact: 'Contato',
    backToProjects: 'Voltar aos projetos',
  },
  hero: {
    photoAlt: 'Bruno Victor, desenvolvedor de software, de óculos e camisa preta',
    since: 'Desde',
  },
  portfolio: {
    tag: 'projetos',
    title: 'Trabalhos recentes.',
    all: 'Todos',
    filterLabel: 'Filtrar por categoria',
    empty: 'Nenhum projeto nesta categoria ainda.',
    open: (title: string) => `Abrir o projeto ${title}`,
  },
  services: {
    tag: 'serviços',
    title: 'O que eu faço.',
    aside: 'Cada projeto começa com uma conversa. Escolha o serviço e peça um orçamento.',
    price: 'Valor',
    priceMode: { FROM: 'A partir de', FIXED: 'Valor fixo', ON_REQUEST: 'Sob consulta' } satisfies Record<PriceMode, string>,
    currency: 'R$',
    cta: 'Pedir orçamento',
  },
  about: {
    tag: 'sobre',
    photoAlt: 'Bruno Victor sorrindo enquanto digita num notebook',
    since: (year: string) => `Programando desde ${year}`,
    role: 'Desenvolvedor de Software',
  },
  testimonials: {
    tag: 'depoimentos',
    title: 'Quem já trabalhou comigo.',
    region: 'Depoimentos de clientes',
    carousel: 'carrossel',
    slide: 'depoimento',
    position: (i: number, n: number) => `${i} de ${n}`,
    goTo: (i: number) => `Ir para o depoimento ${i}`,
    pause: 'Pausar rolagem automática',
    resume: 'Retomar rolagem automática',
    prev: 'Depoimento anterior',
    next: 'Próximo depoimento',
    stars: (n: number) => `${n} de 5 estrelas`,
  },
  contact: {
    tag: 'contato',
    title: 'Vamos conversar.',
    intro: 'Conte o que você precisa. Eu respondo pessoalmente',
    within: (time: string) => `, normalmente em até ${time}`,
    channels: 'Canais de contato',
    name: 'Nome',
    namePlaceholder: 'Seu nome completo',
    phone: 'WhatsApp',
    phonePlaceholder: '+55 00 00000-0000',
    email: 'E-mail',
    emailPlaceholder: 'voce@email.com',
    workType: 'Tipo de projeto',
    other: 'Outro',
    desiredDate: 'Prazo desejado',
    message: 'Mensagem',
    messagePlaceholder: 'Conte um pouco sobre o projeto: o que precisa ser feito, para quem e até quando.',
    submit: 'Enviar mensagem',
    sending: 'Enviando…',
    privacy: 'Seus dados são usados apenas para responder este contato.',
    sentTitle: 'Mensagem enviada.',
    sentText: 'Recebi sua mensagem e vou responder pelo e-mail ou WhatsApp informado.',
    sendAnother: 'Enviar outra mensagem',
    errors: {
      form: 'Confira os campos destacados.',
      name: 'Informe seu nome.',
      email: 'Informe um e-mail válido.',
      workType: 'Escolha o tipo de projeto.',
      message: 'Conte um pouco mais (mínimo 10 caracteres).',
      tooMany: 'Muitas mensagens em pouco tempo. Tente de novo em alguns minutos.',
      generic: 'Não foi possível enviar agora. Tente pelo WhatsApp.',
    },
  },
  project: {
    facts: 'Ficha do projeto',
    client: 'Cliente',
    service: 'Serviço',
    date: 'Data',
    role: 'Papel',
    duration: 'Duração',
    stack: 'Stack',
    live: 'Ver online',
    repo: 'Ver o código',
    about: 'O projeto',
    story: { challenge: 'O desafio', approach: 'A abordagem', result: 'O resultado' },
    cover: 'Imagem de capa',
    enlargeCover: 'Ampliar imagem de capa',
    gallery: 'Galeria',
    galleryLabel: 'Galeria do projeto',
    imageCount: (n: number) => `${n} ${n === 1 ? 'imagem' : 'imagens'} · clique para ampliar`,
    enlarge: (i: number) => `Ampliar imagem ${i}`,
    imageAlt: (title: string, i: number) => `${title} — imagem ${i}`,
    clientSaid: 'O que o cliente disse',
    ctaTitle: 'Quer um projeto assim?',
    cta: 'Vamos conversar',
    next: 'Próximo projeto',
  },
  lightbox: {
    label: 'Visualização da imagem',
    close: 'Fechar',
    prev: 'Imagem anterior',
    next: 'Próxima imagem',
    image: (i: number) => `Imagem ${i}`,
  },
  footer: {
    rights: 'Todos os direitos reservados.',
  },
  notFound: {
    tag: 'erro 404',
    title: 'Página não encontrada.',
    text: 'A página que você procurou não existe ou não está mais publicada.',
    back: 'Voltar ao início',
  },
};

export type Dictionary = typeof pt;

const en: Dictionary = {
  meta: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    projectNotFound: 'Project not found',
  },
  a11y: {
    skipToContent: 'Skip to content',
    mainNav: 'Main',
    home: 'Bruno Victor — home',
    language: 'Language',
    switchTo: 'Read in English',
  },
  nav: {
    portfolio: 'Projects',
    services: 'Services',
    about: 'About',
    testimonials: 'Testimonials',
    contact: 'Contact',
    backToProjects: 'Back to projects',
  },
  hero: {
    photoAlt: 'Bruno Victor, software developer, wearing glasses and a black shirt',
    since: 'Since',
  },
  portfolio: {
    tag: 'projects',
    title: 'Recent work.',
    all: 'All',
    filterLabel: 'Filter by category',
    empty: 'No projects in this category yet.',
    open: (title: string) => `Open the ${title} project`,
  },
  services: {
    tag: 'services',
    title: 'What I do.',
    aside: 'Every project starts with a conversation. Pick a service and ask for a quote.',
    price: 'Price',
    priceMode: { FROM: 'Starting at', FIXED: 'Fixed price', ON_REQUEST: 'On request' },
    currency: 'R$',
    cta: 'Ask for a quote',
  },
  about: {
    tag: 'about',
    photoAlt: 'Bruno Victor smiling while typing on a laptop',
    since: (year: string) => `Coding since ${year}`,
    role: 'Software Developer',
  },
  testimonials: {
    tag: 'testimonials',
    title: 'Who has worked with me.',
    region: 'Client testimonials',
    carousel: 'carousel',
    slide: 'testimonial',
    position: (i: number, n: number) => `${i} of ${n}`,
    goTo: (i: number) => `Go to testimonial ${i}`,
    pause: 'Pause autoplay',
    resume: 'Resume autoplay',
    prev: 'Previous testimonial',
    next: 'Next testimonial',
    stars: (n: number) => `${n} out of 5 stars`,
  },
  contact: {
    tag: 'contact',
    title: "Let's talk.",
    intro: 'Tell me what you need. I reply personally',
    within: (time: string) => `, usually within ${time}`,
    channels: 'Contact channels',
    name: 'Name',
    namePlaceholder: 'Your full name',
    phone: 'WhatsApp',
    phonePlaceholder: '+1 555 000 0000',
    email: 'E-mail',
    emailPlaceholder: 'you@email.com',
    workType: 'Project type',
    other: 'Other',
    desiredDate: 'Desired deadline',
    message: 'Message',
    messagePlaceholder: 'Tell me a bit about the project: what needs to be built, for whom and by when.',
    submit: 'Send message',
    sending: 'Sending…',
    privacy: 'Your data is only used to reply to this message.',
    sentTitle: 'Message sent.',
    sentText: 'I got your message and will reply by the e-mail or WhatsApp you provided.',
    sendAnother: 'Send another message',
    errors: {
      form: 'Please check the highlighted fields.',
      name: 'Enter your name.',
      email: 'Enter a valid e-mail.',
      workType: 'Choose the project type.',
      message: 'Tell me a bit more (at least 10 characters).',
      tooMany: 'Too many messages in a short time. Try again in a few minutes.',
      generic: "Couldn't send right now. Try WhatsApp instead.",
    },
  },
  project: {
    facts: 'Project facts',
    client: 'Client',
    service: 'Service',
    date: 'Date',
    role: 'Role',
    duration: 'Duration',
    stack: 'Stack',
    live: 'Live site',
    repo: 'Source code',
    about: 'The project',
    story: { challenge: 'The challenge', approach: 'The approach', result: 'The result' },
    cover: 'Cover image',
    enlargeCover: 'Enlarge cover image',
    gallery: 'Gallery',
    galleryLabel: 'Project gallery',
    imageCount: (n: number) => `${n} ${n === 1 ? 'image' : 'images'} · click to enlarge`,
    enlarge: (i: number) => `Enlarge image ${i}`,
    imageAlt: (title: string, i: number) => `${title} — image ${i}`,
    clientSaid: 'What the client said',
    ctaTitle: 'Want a project like this?',
    cta: "Let's talk",
    next: 'Next project',
  },
  lightbox: {
    label: 'Image viewer',
    close: 'Close',
    prev: 'Previous image',
    next: 'Next image',
    image: (i: number) => `Image ${i}`,
  },
  footer: {
    rights: 'All rights reserved.',
  },
  notFound: {
    tag: 'error 404',
    title: 'Page not found.',
    text: "The page you're looking for doesn't exist or is no longer published.",
    back: 'Back to home',
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = { pt, en };

export const getDictionary = (locale: Locale): Dictionary => DICTIONARIES[locale];

/**
 * Caminho público de uma página no idioma: o português fica na raiz (/),
 * o inglês sob /en. Aceita âncoras: localePath('en', '/#contato') → '/en#contato'.
 */
export function localePath(locale: Locale, path = '/'): string {
  if (locale === DEFAULT_LOCALE) return path;
  if (path === '/') return '/en';
  return path.startsWith('/#') ? `/en${path.slice(1)}` : `/en${path}`;
}

/** Âncoras das seções da página inicial (iguais nos dois idiomas). */
export const SECTION_IDS = {
  home: 'inicio',
  portfolio: 'projetos',
  services: 'servicos',
  about: 'sobre',
  testimonials: 'depoimentos',
  contact: 'contato',
} as const;

/** "2026-03-14" → "março de 2026" / "March 2026". */
export function formatMonthYear(iso: string | null, locale: Locale): string | null {
  if (!iso) return null;
  const [y, m] = iso.split('-').map(Number);
  if (!y) return iso;
  if (!m) return String(y);
  return new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
