import { Award } from 'lucide-react';
import { cn } from '@/lib/utils';

const STYLES: Record<string, string> = {
  NENHUMA: 'bg-slate-100 text-slate-500 border-slate-200',
  BRONZE: 'bg-amber-700/10 text-amber-800 border-amber-700/30',
  PRATA: 'bg-slate-300/30 text-slate-700 border-slate-400/50',
  OURO: 'bg-yellow-400/20 text-yellow-800 border-yellow-500/50',
  SAFIRA: 'bg-sky-100 text-sky-800 border-sky-300',
  ESMERALDA: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  DIAMANTE: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  DUPLO_DIAMANTE: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  TRIPLO_DIAMANTE: 'bg-purple-100 text-purple-800 border-purple-300',
  IMPERIAL: 'bg-pink-100 text-pink-800 border-pink-300',
  EMBAIXADOR: 'bg-gradient-to-r from-pink-200 to-yellow-200 text-pink-900 border-pink-400',
  EMBAIXADOR_GLOBAL: 'bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900 border-amber-500',
};

const LABELS: Record<string, string> = {
  NENHUMA: 'Nenhuma',
  BRONZE: 'Bronze',
  PRATA: 'Prata',
  OURO: 'Ouro',
  SAFIRA: 'Safira',
  ESMERALDA: 'Esmeralda',
  DIAMANTE: 'Diamante',
  DUPLO_DIAMANTE: 'Duplo Diamante',
  TRIPLO_DIAMANTE: 'Triplo Diamante',
  IMPERIAL: 'Imperial',
  EMBAIXADOR: 'Embaixador',
  EMBAIXADOR_GLOBAL: 'Embaixador Global',
};

export function GraduacaoBadge({ graduacao, className }: { graduacao?: string; className?: string }) {
  const key = (graduacao || 'NENHUMA').toUpperCase();
  const style = STYLES[key] ?? STYLES.NENHUMA;
  const label = LABELS[key] ?? key;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold', style, className)}>
      <Award size={12} />
      {label}
    </span>
  );
}
