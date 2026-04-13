import { cn } from '@/lib/utils';

const COLORS: Record<string, string> = {
  ATIVO: 'bg-emerald-100 text-emerald-800',
  INATIVO: 'bg-slate-200 text-slate-700',
  PENDENTE: 'bg-amber-100 text-amber-800',
  APROVADO: 'bg-emerald-100 text-emerald-800',
  REJEITADO: 'bg-red-100 text-red-800',
  PAGO: 'bg-emerald-100 text-emerald-800',
  ABERTO: 'bg-sky-100 text-sky-800',
  FECHADO: 'bg-slate-200 text-slate-700',
};

export function StatusPill({ status }: { status: string }) {
  const c = COLORS[status] ?? 'bg-slate-100 text-slate-700';
  return <span className={cn('inline-flex px-2 py-0.5 rounded-full text-xs font-medium', c)}>{status}</span>;
}
