import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_TABS = ['SOLICITADO', 'APROVADO', 'PAGO', 'REJEITADO'] as const;
type StatusTab = (typeof STATUS_TABS)[number];

export default function AdminSaques() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<StatusTab>('SOLICITADO');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'saques', tab],
    queryFn: async () => (await api.get('/admin/saques', { params: { status: tab } })).data,
  });
  const rows: any[] = data?.data ?? [];

  const mutate = useMutation({
    mutationFn: async ({ id, acao, obs }: { id: string; acao: 'aprovar' | 'pagar' | 'rejeitar'; obs?: string }) =>
      (await api.patch(`/admin/saques/${id}/${acao}`, obs ? { observacao: obs } : {})).data,
    onSuccess: () => { toast.success('Atualizado'); qc.invalidateQueries({ queryKey: ['admin', 'saques'] }); },
    onError: () => toast.error('Erro ao processar'),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saques</h1>

      <div className="flex gap-2 border-b">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-4 py-2 text-sm font-medium ${tab === s ? 'border-b-2 border-glowy-primary text-glowy-primary' : 'text-slate-600'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">CPF</th>
              <th className="p-3 text-left">Chave PIX</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">Carregando...</td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-slate-500">Nenhum saque com status {tab}</td></tr>
            )}
            {rows.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{formatDate(s.solicitado_em)}</td>
                <td className="p-3">{s.users?.nome ?? '-'}</td>
                <td className="p-3">{s.users?.cpf ?? '-'}</td>
                <td className="p-3 font-mono text-xs">{s.pix_chave} <span className="text-slate-400">({s.pix_tipo})</span></td>
                <td className="p-3 text-right font-semibold"><MoneyDisplay cents={s.valor_centavos} /></td>
                <td className="p-3"><StatusPill status={s.status} /></td>
                <td className="p-3">
                  <div className="flex gap-1 justify-end">
                    {s.status === 'SOLICITADO' && (
                      <>
                        <button className="btn-primary text-xs py-1 px-2" onClick={() => mutate.mutate({ id: s.id, acao: 'aprovar' })}>Aprovar</button>
                        <button className="btn-danger text-xs py-1 px-2" onClick={() => {
                          const obs = prompt('Motivo da rejeição:') ?? '';
                          mutate.mutate({ id: s.id, acao: 'rejeitar', obs });
                        }}>Rejeitar</button>
                      </>
                    )}
                    {s.status === 'APROVADO' && (
                      <button className="btn-primary text-xs py-1 px-2" onClick={() => mutate.mutate({ id: s.id, acao: 'pagar' })}>Marcar pago</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
