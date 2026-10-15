'use server';

import { contactMessageSchema, isLocale } from '@bv/shared';
import { ApiError } from '../api/errors';
import { API_URL } from '../config';
import { getDictionary } from '../i18n';
import type { FormState } from './auth';

const FIELDS = ['name', 'email', 'phone', 'workType', 'desiredDate', 'message', 'locale', 'website'] as const;

/** Formulário de contato do site, nos dois idiomas (o idioma vem num campo oculto). */
export async function sendContactAction(_: FormState, form: FormData): Promise<FormState> {
  const raw = Object.fromEntries(FIELDS.map((k) => [k, String(form.get(k) ?? '')]));
  const locale = isLocale(raw.locale) ? raw.locale : 'pt';
  const errors = getDictionary(locale).contact.errors;

  const parsed = contactMessageSchema.safeParse({ ...raw, locale });
  if (!parsed.success) {
    // As mensagens do schema são em português; aqui cada campo ganha a do idioma da página.
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.map((i) => {
        const field = String(i.path[0]);
        return [field, field in errors ? errors[field as keyof typeof errors] : i.message];
      }),
    );
    return { error: errors.form, fieldErrors };
  }
  try {
    const res = await fetch(`${API_URL}/public/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(parsed.data),
      cache: 'no-store',
    });
    if (!res.ok) throw await ApiError.fromResponse(res);
  } catch (e) {
    if (e instanceof ApiError && e.status === 429) return { error: errors.tooMany };
    return { error: e instanceof ApiError && locale === 'pt' ? e.message : errors.generic };
  }
  return { success: 'ok' };
}
