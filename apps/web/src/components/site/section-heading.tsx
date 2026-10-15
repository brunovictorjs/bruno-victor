import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Cabeçalho de seção do design system: numeral de dois dígitos em mono + tag
 * de código (<projetos />) acima de um título curto, com ponto final.
 */
export function SectionHeading({
  index,
  tag,
  title,
  aside,
  tone = 'dark',
}: {
  index: string;
  tag: string;
  title: ReactNode;
  aside?: ReactNode;
  tone?: 'dark' | 'light';
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="flex flex-col gap-4">
        <span data-reveal className={cn('tag-code flex items-center gap-3', tone === 'light' && 'text-paper-muted')}>
          <span>{index}</span>
          <span aria-hidden className={cn('h-px w-8', tone === 'light' ? 'bg-paper-hairline' : 'bg-hairline')} />
          <span>&lt;{tag} /&gt;</span>
        </span>
        <h2 data-reveal className="text-[clamp(34px,4.4vw,52px)] leading-[1.04] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
