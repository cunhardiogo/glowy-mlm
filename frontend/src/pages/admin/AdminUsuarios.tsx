import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { GraduacaoBadge } from '@/components/ui/GraduacaoBadge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminUsuarios() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'usuarios', search, page],
    queryFn: async () => (await api.get('/admin/usuarios', { params: { q: search, page } })).data,
  });

  const bloquear = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) =>
      (await api.patch(`/admin/usuarios/${id}/bloquear`, { ativo })).data,
    onSuccess: () => { toast.success('Atualizado'); qc.invalidateQueries({ queryKey: ['admin', 'usuarios'] }); },
    onError: () => toast.error('Erro'),
  });

  const rows: any[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Usuários</h1>

      <input
        type="search"
        placeholder="Buscar por nome, email ou username..."
        className="input w-full max-w-md"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Kit</th>
              <th className="p-3 text-left">Graduação</th>
              <th className="p-3 text-left">Cadastro</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8} className="p-4 text-center text-slate-500">Carregando...</td></tr>}
            {rows.map((u: any) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.nome}</td>
                <td className="p-3 text-slate-600">{u.username}</td>
                <td className="p-3">{u.tipo}</td>
                <td className="p-3">{u.kit_atual ?? '-'}</td>
                <td className="p-3"><GraduacaoBadge graduacao={u.graduacao_reconhecimento} /></td>
                <td className="p-3">{formatDate(u.created_at)}</td>
                <td className="p-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.status_ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.status_ativo ? 'Ativo' : 'Bloqueado'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    className="btn-secondary text-xs py-1 px-2"
                    onClick={() => bloquear.mutate({ id: u.id, ativo: !u.status_ativo })}
                  >
                    {u.status_ativo ? 'Bloquear' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
        <span className="self-center text-sm text-slate-600">Página {page}</span>
        <button className="btn-secondary" disabled={rows.length < 50} onClick={() => setPage((p) => p + 1)}>Próxima</button>
      </div>
    </div>
  );
}
