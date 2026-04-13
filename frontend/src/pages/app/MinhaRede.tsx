import { useState } from 'react';
import { useDownline, useLinhas } from '@/hooks/useRede';
import { TreeView } from '@/components/rede/TreeView';
import { Skeleton } from '@/components/ui/Skeleton';
import { GraduacaoBadge } from '@/components/ui/GraduacaoBadge';
import { StatusPill } from '@/components/ui/StatusPill';

export default function MinhaRede() {
  const [tab, setTab] = useState<'arvore' | 'linhas'>('arvore');
  const [depth, setDepth] = useState(3);
  const { data: redeRaw, isLoading } = useDownline(depth);
  const { data: linhasRaw } = useLinhas();

  const rawNodes: any[] = redeRaw?.data?.nodes ?? redeRaw?.nodes ?? [];
  const linhas: any[] = Array.isArray(linhasRaw) ? linhasRaw : linhasRaw?.data ?? [];

  // Transform rede nodes to TreeView format
  const treeNodes = rawNodes.map((n: any) => ({
    id: n.id,
    parent_id: n.parent_id ?? null,
    depth: n.nivel_relativo ?? 0,
    nome: n.nome,
    graduacao: n.graduacao_reconhecimento,
    status: n.ativo_ciclo_atual ? 'ATIVO' : 'INATIVO',
    kit: n.kit_atual,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Minha Rede</h1>
      <div className="flex gap-2 border-b">
        {(['arvore', 'linhas'] as const).map((t) => (
          <button
            key={t}
            className={`px-4 py-2 text-sm font-medium ${tab === t ? 'border-b-2 border-glowy-primary text-glowy-primary' : 'text-slate-600'}`}
            onClick={() => setTab(t)}
          >
            {t === 'arvore' ? 'Árvore' : 'Linhas Diretas'}
          </button>
        ))}
      </div>

      {tab === 'arvore' && (
        <>
          {isLoading && <Skeleton className="h-[600px] w-full" />}
          {!isLoading && <TreeView tree={treeNodes} onLoadMore={() => setDepth((d) => d + 2)} />}
          {!isLoading && treeNodes.length === 0 && (
            <div className="card p-10 text-center text-slate-500">Nenhum membro na sua rede.</div>
          )}
        </>
      )}

      {tab === 'linhas' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-left">Nome</th>
                <th className="p-3 text-left">Kit</th>
                <th className="p-3 text-left">Ativo</th>
                <th className="p-3 text-left">Grad. Ciclo</th>
                <th className="p-3 text-right">PB Grupo</th>
                <th className="p-3 text-right">PB Pessoal</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l: any) => (
                <tr key={l.id} className="border-t">
                  <td className="p-3 font-medium">{l.nome}</td>
                  <td className="p-3">{l.kit_atual ?? '-'}</td>
                  <td className="p-3">
                    <StatusPill status={l.ativo_ciclo_atual ? 'ATIVO' : 'INATIVO'} />
                  </td>
                  <td className="p-3">
                    <GraduacaoBadge graduacao={l.graduacao_ciclo ?? 'NENHUMA'} />
                  </td>
                  <td className="p-3 text-right font-mono">{Number(l.pb_grupo).toLocaleString('pt-BR')}</td>
                  <td className="p-3 text-right font-mono">{Number(l.pb_pessoal).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
              {!linhas.length && (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhuma linha direta.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
