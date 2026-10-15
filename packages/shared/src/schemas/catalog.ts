import { z } from 'zod';
import { PRICE_MODES, SERVICE_ICONS } from '../constants.js';
import { optionalText, textList } from './common.js';

export const serviceSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe o nome.').max(80),
    nameEn: optionalText(80),
    description: optionalText(280),
    descriptionEn: optionalText(280),
    includes: textList(8),
    includesEn: textList(8),
    priceMode: z.enum(PRICE_MODES),
    /** Valor em centavos. Obrigatório quando o modo não é "sob consulta". */
    priceCents: z.number().int().nonnegative().nullish().transform((v) => v ?? null),
    icon: z.enum(SERVICE_ICONS),
    visible: z.boolean().default(true),
  })
  .refine((s) => s.priceMode === 'ON_REQUEST' || s.priceCents != null, {
    message: 'Informe o valor ou escolha "Sob consulta".',
    path: ['priceCents'],
  });
export type ServiceInput = z.input<typeof serviceSchema>;
