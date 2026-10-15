import { z } from 'zod';
import { STACK_ITEMS_MAX } from '../constants.js';
import { optionalText, optionalUrl, textList } from './common.js';

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome.').max(60),
  nameEn: optionalText(60),
  description: optionalText(240),
  descriptionEn: optionalText(240),
  visibleInFilter: z.boolean().default(true),
});
export type CategoryInput = z.input<typeof categorySchema>;

export const projectSchema = z.object({
  title: z.string().trim().min(2, 'Informe o título.').max(140),
  titleEn: optionalText(140),
  slug: z
    .union([
      z
        .string()
        .trim()
        .max(160)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use apenas letras minúsculas, números e hífens.'),
      z.literal(''),
    ])
    .nullish()
    .transform((v) => (v ? v : null)),
  summary: optionalText(280),
  summaryEn: optionalText(280),
  client: optionalText(140),
  /** AAAA-MM-DD */
  date: optionalText(10),
  /** Papel no projeto: "Back-end e integrações", "Projeto completo"… */
  role: optionalText(160),
  roleEn: optionalText(160),
  /** Duração ou prazo: "6 semanas". */
  duration: optionalText(80),
  durationEn: optionalText(80),
  /** Tecnologias usadas (nomes próprios: não traduzem). */
  stack: textList(STACK_ITEMS_MAX, 40),
  liveUrl: optionalUrl(),
  repoUrl: optionalUrl(),
  intro: optionalText(2000),
  introEn: optionalText(2000),
  challenge: optionalText(2000),
  challengeEn: optionalText(2000),
  approach: optionalText(2000),
  approachEn: optionalText(2000),
  result: optionalText(2000),
  resultEn: optionalText(2000),
  categoryId: z.string().min(1, 'Escolha a categoria.'),
  serviceId: z.string().nullish().transform((v) => v || null),
  testimonialId: z.string().nullish().transform((v) => v || null),
  featured: z.boolean().default(false),
});
export type ProjectInput = z.input<typeof projectSchema>;

export const projectFeaturedSchema = z.object({ featured: z.boolean() });

export const photoUpdateSchema = z.object({
  caption: optionalText(200),
  captionEn: optionalText(200),
});
export type PhotoUpdateInput = z.input<typeof photoUpdateSchema>;
