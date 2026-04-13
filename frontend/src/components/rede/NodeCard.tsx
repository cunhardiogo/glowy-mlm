import { Handle, Position } from 'reactflow';
import { initials } from '@/lib/utils';
import { GraduacaoBadge } from '@/components/ui/GraduacaoBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { PointsBadge } from '@/components/ui/PointsBadge';

export interface NodeCardData {
  nome: string;
  graduacao?: string;
  status: string;
  pb_ciclo?: number;
  kit?: 'STANDARD' | 'PREMIUM';
}

export function NodeCard({ data }: { data: NodeCardData }) {
  return (
    <div className="card p-3 w-56">
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-glowy-primary text-white flex items-center justify-center font-bold text-sm">
          {initials(data.nome)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{data.nome}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <GraduacaoBadge graduacao={data.graduacao} />
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <StatusPill status={data.status} />
        {data.pb_ciclo !== undefined && <PointsBadge points={data.pb_ciclo} type="PB" />}
        <span className="text-slate-500 font-semibold">{data.kit === 'PREMIUM' ? 'P' : 'S'}</span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
