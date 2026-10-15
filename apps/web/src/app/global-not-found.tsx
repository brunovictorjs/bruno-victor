import type { Metadata } from 'next';
import Link from 'next/link';
import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Página não encontrada · Page not found',
  robots: { index: false },
};

/**
 * 404 para URLs que não casam com nenhuma rota (o site tem dois root layouts:
 * app/[locale] e app/painel). Bilíngue porque aqui não há idioma na URL.
 */
export default function GlobalNotFound() {
  return (
    <html lang="pt-BR" className={`${fontVariables} dark`}>
      <body className="bg-brand flex min-h-dvh items-center">
        <main className="section-container flex flex-col items-start gap-6">
          <span className="tag-code">&lt;erro 404 /&gt;</span>
          <h1 className="text-[clamp(40px,6vw,80px)] leading-[0.98] font-semibold tracking-[-0.02em]">
            Página não encontrada.
            <span className="block font-light text-ink-muted">Page not found.</span>
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="btn-primary">
              Voltar ao início <span aria-hidden>→</span>
            </Link>
            <Link href="/en" className="btn-secondary">
              Back to home <span aria-hidden>→</span>
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
