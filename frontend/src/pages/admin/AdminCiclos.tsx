import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDate } from '@/lib/utils';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import toast from 'react-hot-toast';

function cicloAtualRef(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function AdminCiclos() {
  const qc = useQueryClient();
  const [novoRef, setNovoRef] = useState(cicloAtualRef());

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin', 'ciclos'],
    queryFn: async () => (await api.get('/admin/ciclos')).data,
  });

  const abrir = useMutation({
    mutationFn: async (ref: string) => (await api.post('/admin/ciclos/abrir', { ref })).data,
    onSuccess: () => { toast.success('Ciclo aberto'); qc.invalidateQueries({ queryKey: ['admin', 'ciclos'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro'),
  });

  const fechar = useMutation({
    mutationFn: async (ref: string) => (await api.post(`/admin/ciclos/${ref}/fechar`)).data,
    onSuccess: () => { toast.success('Fechamento iniciado em background'); qc.invalidateQueries({ queryKey: ['admin', 'ciclos'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erro'),
  });

  const ciclos: any[] = Array.isArray(data) ? data : data.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ciclos</h1>

      <div className="card p-5">
        <h2 className="font-bold mb-3">Abrir novo ciclo</h2>
        <div className="flex gap-2 items-end">
          <div>
            <label className="text-sm text-slate-600 block mb-1">Referência (YYYY-MM-01)</label>
            <input
              type="text"
              className="input"
              value={novoRef}
              onChange={(e) => setNovoRef(e.target.value)}
              placeholder="2025-01-01"
            />
          </div>
          <button className="btn-primary" onClick={() => abrir.mutate(novoRef)} disabled={abrir.isPending}>
            {abrir.isPending ? 'Abrindo...' : 'Abrir ciclo'}
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Referência</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Aberto em</th>
              <th className="p-3 text-left">Fechado em</th>
              <th className="p-3 text-right">Total bônus</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-4 text-center text-slate-500">Carregando...</td></tr>}
            {ciclos.length === 0 && !isLoading && (
              <tr><td colSpan={6} className="p-4 text-center text-slate-500">Nenhum ciclo encontrado</td></tr>
            )}
            {ciclos.map((c: any) => (
              <tr key={c.ref_mes} className="border-t">
                <td className="p-3 font-mono font-semibold">{c.ref_mes?.slice(0, 7)}</td>
                <td className="p-3"><StatusPill status={c.status} /></td>
                <td className="p-3">{c.aberto_em ? formatDate(c.aberto_em) : '-'}</td>
                <td className="p-3">{c.fechado_em ? formatDate(c.fechado_em) : '-'}</td>
                <td className="p-3 text-right">
                  {c.total_bonus_centavos ? <MoneyDisplay cents={c.total_bonus_centavos} /> : '-'}
                </td>
                <td className="p-3">
                  {c.status === 'ABERTO' && (
                    <button
                      className="btn-danger text-xs py-1 px-2"
                      onClick={() => {
                        if (confirm(`Fechar ciclo ${c.ref_mes?.slice(0, 7)}? Esta ação não pode ser desfeita.`)) {
                          fechar.mutate(c.ref_mes);
                        }
                      }}
                      disabled={fechar.isPending}
                    >
                      Fechar
                    </button>
                  )}
                  {c.status === 'ERRO' && (
                    <button
                      className="btn-secondary text-xs py-1 px-2"
                      onClick={() => fechar.mutate(c.ref_mes)}
                      disabled={fechar.isPending}
                    >
                      Retentar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
