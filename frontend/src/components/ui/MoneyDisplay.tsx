import { formatMoney } from '@/lib/utils';

interface Props { cents: number; className?: string; }

export function MoneyDisplay({ cents, className = '' }: Props) {
  return <span className={className}>{formatMoney(cents || 0)}</span>;
}
