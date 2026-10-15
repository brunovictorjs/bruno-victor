import { StarIcon } from '@/components/icons';

export function Stars({ rating, label, className }: { rating: number; label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={className ?? 'flex gap-1 text-ink'}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} size={16} filled={i < rating} />
      ))}
    </div>
  );
}
