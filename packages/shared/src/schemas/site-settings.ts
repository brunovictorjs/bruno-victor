import { z } from 'zod';
import {
  ABOUT_CHIP_MAX_LENGTH,
  ABOUT_CHIPS_MAX,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
} from '../constants.js';

/**
 * Textos do site. Cada campo traduzível tem o par `campoEn`; vazio = usa o
 * português (veja `localized`).
 */
const text = (max: number) => z.string().trim().max(max);
const image = z.string().max(500).nullable().default(null);
const chips = z.array(text(ABOUT_CHIP_MAX_LENGTH).min(1)).max(ABOUT_CHIPS_MAX);

export const heroSettingsSchema = z.object({
  /** Rótulo em forma de tag de código, acima do título: <desenvolvedor />. */
  tag: text(40),
  tagEn: text(40),
  line1: text(40),
  line1En: text(40),
  /** Segunda linha do título, em fio fino (o contraste grosso × fino da marca). */
  line2: text(40),
  line2En: text(40),
  /** Linha de código em mono, abaixo do título. Código não traduz. */
  code: text(60),
  text: text(400),
  textEn: text(400),
  primaryButton: text(30),
  primaryButtonEn: text(30),
  secondaryButton: text(30),
  secondaryButtonEn: text(30),
  since: text(12),
  tagline: text(60),
  taglineEn: text(60),
  imageUrl: image,
});

export const clientLogoSchema = z.object({
  id: z.string().min(1),
  name: text(80),
  url: z.union([z.url(), z.literal('')]).default(''),
  imageUrl: image,
});

export const clientsSettingsSchema = z.object({
  visible: z.boolean(),
  title: text(60),
  titleEn: text(60),
  logos: z.array(clientLogoSchema).max(24),
});

export const aboutSettingsSchema = z.object({
  opening: text(240),
  openingEn: text(240),
  text: text(4000),
  textEn: text(4000),
  chips,
  chipsEn: chips,
  /** Assinatura em mono, sempre em minúsculas: @brunovictor.jsx */
  handle: text(60),
  since: text(12),
  imageUrl: image,
});

export const contactSettingsSchema = z.object({
  recipientEmail: z.union([z.email(), z.literal('')]),
  ccEmails: text(400),
  /** Formato do design system: +55 81 98736-3068 */
  whatsapp: text(40),
  instagram: text(60),
  linkedin: z.union([z.url(), z.literal('')]).default(''),
  github: z.union([z.url(), z.literal('')]).default(''),
  city: text(80),
  cityEn: text(80),
  responseTime: text(20),
  responseTimeEn: text(20),
});

export const seoSettingsSchema = z.object({
  title: text(SEO_TITLE_MAX),
  titleEn: text(SEO_TITLE_MAX),
  description: text(SEO_DESCRIPTION_MAX),
  descriptionEn: text(SEO_DESCRIPTION_MAX),
  shareImageUrl: image,
  faviconUrl: image,
});

export const siteSettingsSchema = z.object({
  hero: heroSettingsSchema,
  clients: clientsSettingsSchema,
  about: aboutSettingsSchema,
  contact: contactSettingsSchema,
  seo: seoSettingsSchema,
});

export type HeroSettings = z.infer<typeof heroSettingsSchema>;
export type ClientLogo = z.infer<typeof clientLogoSchema>;
export type ClientsSettings = z.infer<typeof clientsSettingsSchema>;
export type AboutSettings = z.infer<typeof aboutSettingsSchema>;
export type ContactSettings = z.infer<typeof contactSettingsSchema>;
export type SeoSettings = z.infer<typeof seoSettingsSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type SiteSettingsInput = z.input<typeof siteSettingsSchema>;
