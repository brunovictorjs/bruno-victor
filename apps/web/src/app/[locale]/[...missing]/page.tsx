import { notFound } from 'next/navigation';

/** Qualquer caminho do site que não existe cai no not-found do idioma. */
export default function Missing() {
  notFound();
}
