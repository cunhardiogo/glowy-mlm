import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminCredenciamentos() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin', 'credenciamentos'], queryFn: async () => (await api.get('/admin/credenciamentos')).data.data });
  const [sel, setSel] = useState<any>(null);

  const aprovar = useMutation({
    mutationFn: async ({ id, acao, motivo }: { id: string; acao: 'APROVAR' | 'REJEITAR'; motivo?: string }) =>
      (await api.post(`/admin/credenciamentos/${id}/${acao.toLowerCase()}`, { motivo })).data,
    onSuccess: () => { toast.success('Atualizado'); setSel(null); qc.invalidateQueries({ queryKey: ['admin', 'credenciamentos'] }); },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Credenciamentos</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="p-3 text-left">Data</th><th className="p-3 text-left">Nome</th><th className="p-3 text-left">Kit</th><th className="p-3 text-left">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {(data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{formatDate(c.created_at)}</td>
                <td className="p-3">{c.nome}</td>
                <td className="p-3">{c.kit_atual ?? '-'}</td>
                <td className="p-3"><StatusPill status={c.status_docs} /></td>
                <td className="p-3"><button className="btn-secondary" onClick={() => setSel(c)}>Revisar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSel(null)}>
          <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-3">{sel.nome}</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-slate-500">CPF</dt><dd>{sel.cpf}</dd>
              <dt className="text-slate-500">Email</dt><dd>{sel.email}</dd>
              <dt className="text-slate-500">Patrocinador</dt><dd>{sel.patrocinador_nome ?? '-'}</dd>
              <dt className="text-slate-500">Kit</dt><dd>{sel.kit_atual ?? '-'}</dd>
            </dl>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {sel.documentos?.map((d: any) => (
                <a key={d.id} href={d.url} target="_blank" rel="noreferrer" className="card p-3 block">
                  <p className="font-medium text-sm">{d.tipo}</p>
                  <p className="text-xs text-glowy-primary">Abrir</p>
                </a>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <button className="btn-danger flex-1" onClick={() => {
                const motivo = prompt('Motivo da rejeição:') || '';
                aprovar.mutate({ id: sel.id, acao: 'REJEITAR', motivo });
              }}>Rejeitar</button>
              <button className="btn-primary flex-1" onClick={() => aprovar.mutate({ id: sel.id, acao: 'APROVAR' })}>Aprovar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
