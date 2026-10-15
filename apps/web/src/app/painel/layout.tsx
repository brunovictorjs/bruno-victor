import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SITE_URL } from '@/lib/config';
import { fontVariables } from '../fonts';
import '../globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Painel', template: '%s — Painel BV' },
  robots: { index: false, follow: false },
};

/** Root layout do painel administrativo (sempre em português). */
export default function PainelLayout({ children }: LayoutProps<'/painel'>) {
  return (
    <html lang="pt-BR" className={`${fontVariables} dark`}>
      <body className="min-h-dvh">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  );
}
