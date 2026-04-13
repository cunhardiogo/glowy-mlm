import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { PointsBadge } from '@/components/ui/PointsBadge';
import { formatDate } from '@/lib/utils';

export default function Extrato() {
  const [tab, setTab] = useState<'pontos' | 'financeiro'>('pontos');
  const [ciclo, setCiclo] = useState('');

  const cicloParam = ciclo.length === 7 ? ciclo + '-01' : ciclo || undefined;

  const pontos = useQuery({
    queryKey: ['extrato', 'pontos', ciclo],
    queryFn: async () => (await api.get('/extrato/pontos', { params: { ciclo: cicloParam } })).data,
    enabled: tab === 'pontos',
  });
  const fin = useQuery({
    queryKey: ['extrato', 'financeiro', ciclo],
    queryFn: async () => (await api.get('/extrato/financeiro', { params: { ciclo: cicloParam } })).data,
    enabled: tab === 'financeiro',
  });

  const pontosRows: any[] = Array.isArray(pontos.data) ? pontos.data : pontos.data?.data ?? [];
  const finRows: any[] = Array.isArray(fin.data) ? fin.data : fin.data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Extrato</h1>
      <div className="flex gap-2 border-b items-center">
        {(['pontos', 'financeiro'] as const).map((t) => (
          <button
            key={t}
            className={`px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-glowy-primary text-glowy-primary' : 'text-slate-600'}`}
            onClick={() => setTab(t)}
          >
            {t === 'pontos' ? 'Pontos' : 'Bônus Financeiro'}
          </button>
        ))}
        <input
          className="input ml-auto max-w-[160px]"
          placeholder="Ciclo (YYYY-MM)"
          value={ciclo}
          onChange={(e) => setCiclo(e.target.value)}
        />
      </div>

      {tab === 'pontos' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Origem</th>
                <th className="p-3 text-left">Tipo pedido</th>
                <th className="p-3 text-center">PG</th>
                <th className="p-3 text-center">PB</th>
              </tr>
            </thead>
            <tbody>
              {pontosRows.map((r: any) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{formatDate(r.created_at)}</td>
                  <td className="p-3 text-slate-600">{r.origem ?? '-'}</td>
                  <td className="p-3">{r.pedido_tipo ?? '-'}</td>
                  <td className="p-3 text-center"><PointsBadge points={r.pg ?? 0} type="PG" /></td>
                  <td className="p-3 text-center"><PointsBadge points={r.pb ?? 0} type="PB" /></td>
                </tr>
              ))}
              {!pontosRows.length && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Nenhum movimento.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'financeiro' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Data</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-left">Origem</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {finRows.map((r: any) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{formatDate(r.created_at)}</td>
                  <td className="p-3 font-medium">{r.tipo}</td>
                  <td className="p-3 text-slate-600">{r.origem_nome ?? '-'}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3 text-right text-emerald-600 font-semibold">
                    <MoneyDisplay cents={r.valor_centavos} />
                  </td>
                </tr>
              ))}
              {!finRows.length && <tr><td colSpan={5} className="p-6 text-center text-slate-500">Nenhum lançamento.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
