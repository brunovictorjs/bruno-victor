import { z } from 'zod';

export const idSchema = z.string().min(1);

export const reorderSchema = z.object({
  ids: z.array(idSchema).min(1),
});
export type ReorderInput = z.infer<typeof reorderSchema>;

/** Campo de texto opcional: string vazia vira `null`. */
export const optionalText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => (v ? v : null));

/** Link opcional (https://…): string vazia vira `null`. */
export const optionalUrl = () =>
  z
    .union([z.url('Use um link completo (https://…).').max(500), z.literal('')])
    .nullish()
    .transform((v) => (v ? v : null));

/** Lista curta de textos (stack, itens inclusos): ignora linhas vazias. */
export const textList = (maxItems: number, maxLength = 80) =>
  z
    .array(z.string().trim().max(maxLength))
    .max(maxItems)
    .default([])
    .transform((list) => list.filter(Boolean));
