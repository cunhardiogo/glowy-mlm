import { GraduacaoBadge } from '@/components/ui/GraduacaoBadge';
import { cn } from '@/lib/utils';

const GRADUACOES = ['BRONZE','PRATA','OURO','SAFIRA','RUBI','ESMERALDA','DIAMANTE','DUPLO DIAMANTE','TRIPLO DIAMANTE','DIAMANTE REAL','DIAMANTE COROA'];

interface Props {
  atual: string;
  pg: number;
  pg_proxima: number;
  proxima?: string;
}

export function ProgressoGraduacao({ atual, pg, pg_proxima, proxima }: Props) {
  const pct = pg_proxima > 0 ? Math.min(100, (pg / pg_proxima) * 100) : 0;
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-slate-500">Graduação atual</p>
          <GraduacaoBadge graduacao={atual} className="text-sm mt-1" />
        </div>
        {proxima && (
          <div className="text-right">
            <p className="text-sm text-slate-500">Próxima</p>
            <GraduacaoBadge graduacao={proxima} className="text-sm mt-1" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{pg.toLocaleString('pt-BR')} PG</span>
          <span className="text-slate-500">{pg_proxima.toLocaleString('pt-BR')} PG necessários</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-glowy-primary to-glowy-secondary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-11 gap-1">
        {GRADUACOES.map((g) => (
          <div key={g} className={cn('text-[10px] text-center p-1 rounded', g === atual.toUpperCase() ? 'bg-glowy-primary text-white' : 'bg-slate-100 text-slate-500')}>
            {g.split(' ')[0].slice(0, 4)}
          </div>
        ))}
      </div>
    </div>
  );
}
