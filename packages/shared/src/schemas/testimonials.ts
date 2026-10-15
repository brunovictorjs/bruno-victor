import { z } from 'zod';
import { TESTIMONIAL_QUOTE_MAX } from '../constants.js';
import { optionalText } from './common.js';

const quote = z.string().trim().max(TESTIMONIAL_QUOTE_MAX, `Até ${TESTIMONIAL_QUOTE_MAX} caracteres.`);

export const testimonialSchema = z.object({
  clientName: z.string().trim().min(2, 'Informe o nome do cliente.').max(120),
  jobLabel: optionalText(80),
  jobLabelEn: optionalText(80),
  quote: quote.min(10, 'Cole o depoimento do cliente.'),
  quoteEn: quote.nullish().transform((v) => (v ? v : null)),
  rating: z.number().int().min(1).max(5).default(5),
  projectId: z.string().nullish().transform((v) => v || null),
  photoUrl: z.string().max(500).nullish().transform((v) => v || null),
  visible: z.boolean().default(true),
});
export type TestimonialInput = z.input<typeof testimonialSchema>;

export const testimonialVisibilitySchema = z.object({ visible: z.boolean() });
