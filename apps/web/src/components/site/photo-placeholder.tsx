import { ImageIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

/** Espaço reservado quando um projeto ainda não tem imagem. */
export function PhotoPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('bg-brand flex flex-col items-center justify-center gap-3 text-line-strong', className)}>
      <ImageIcon size={40} />
      <span className="font-mono text-xs font-light text-ink-muted">&lt;{label.toLowerCase()} /&gt;</span>
    </div>
  );
}
