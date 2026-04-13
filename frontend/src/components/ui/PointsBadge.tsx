import { cn } from '@/lib/utils';

interface Props { points: number; type?: 'PG' | 'PB'; className?: string; }

export function PointsBadge({ points, type = 'PB', className }: Props) {
  const color = type === 'PG' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', color, className)}>
      {points.toLocaleString('pt-BR')} {type}
    </span>
  );
}
