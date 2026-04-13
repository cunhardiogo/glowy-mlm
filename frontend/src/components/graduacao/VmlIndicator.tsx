import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LinhaVml {
  linha_id: string;
  nome: string;
  volume: number;
  limite: number;
  computado: number;
}

export function VmlIndicator({ linhas }: { linhas: LinhaVml[] }) {
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">VML por Linha Direta</h3>
      <div className="space-y-3">
        {linhas.map((l) => {
          const pct = l.limite > 0 ? Math.min(100, (l.volume / l.limite) * 100) : 0;
          const travada = l.volume > l.limite;
          return (
            <div key={l.linha_id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium flex items-center gap-1">
                  {travada && <AlertTriangle size={14} className="text-amber-500" />}
                  {l.nome}
                </span>
                <span className="text-slate-500">
                  {l.computado.toLocaleString('pt-BR')} / {l.limite.toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn('h-full transition-all', travada ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
              </div>
              {travada && <p className="text-xs text-amber-700 mt-1">Linha travada pelo VML</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
