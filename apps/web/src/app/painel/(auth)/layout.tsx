import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_IMAGES } from '@/lib/config';

export default function AuthLayout({ children }: LayoutProps<'/painel'>) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-[440px] flex-col items-center gap-8">
        <Image src={DEFAULT_IMAGES.logo} alt="Bruno Victor" width={200} height={59} priority className="h-[59px] w-[200px]" />
        {children}
        <Link href="/" className="text-sm text-ink-muted hover:text-ink">
          Voltar ao site
        </Link>
      </div>
    </main>
  );
}
