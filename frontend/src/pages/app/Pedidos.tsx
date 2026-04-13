import { useState } from 'react';
import { usePedidos, useCriarRecompra, useCriarUpgrade } from '@/hooks/usePedidos';
import { useAuth } from '@/hooks/useAuth';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Pedidos() {
  const { profile } = useAuth();
  const { data } = usePedidos();
  const recompra = useCriarRecompra();
  const upgrade = useCriarUpgrade();
  const [pix, setPix] = useState<string | null>(null);
  const [recompraValor, setRecompraValor] = useState('');
  const [showRecompraForm, setShowRecompraForm] = useState(false);

  const handleRecompra = async () => {
    const val = parseFloat(recompraValor.replace(',', '.'));
    if (!val || val < 10) return toast.error('Valor mínimo de R$ 10,00');
    try {
      const res = await recompra.mutateAsync({ valor_centavos: Math.round(val * 100) });
      setPix(res.data?.instrucoesPix ?? null);
      setShowRecompraForm(false);
      setRecompraValor('');
      toast.success('Pedido criado');
    } catch {}
  };

  const handleUpgrade = async () => {
    try {
      const res = await upgrade.mutateAsync();
      setPix(res.data?.instrucoesPix ?? null);
      toast.success('Pedido de upgrade criado');
    } catch {}
  };

  const pedidos: any[] = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => setShowRecompraForm(true)}>Fazer recompra</button>
          {profile?.kit_atual === 'STANDARD' && (
            <button className="btn-secondary" onClick={handleUpgrade} disabled={upgrade.isPending}>
              {upgrade.isPending ? 'Processando...' : 'Upgrade Premium'}
            </button>
          )}
        </div>
      </div>

      {showRecompraForm && (
        <div className="card p-4 flex gap-3 items-end">
          <div>
            <label className="label">Valor da recompra (R$)</label>
            <input
              type="number" min="10" step="0.01" className="input w-40"
              placeholder="Ex: 150,00"
              value={recompraValor}
              onChange={(e) => setRecompraValor(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={handleRecompra} disabled={recompra.isPending}>
            {recompra.isPending ? 'Gerando...' : 'Gerar PIX'}
          </button>
          <button className="btn-secondary" onClick={() => setShowRecompraForm(false)}>Cancelar</button>
        </div>
      )}

      {pix && (
        <div className="card p-5 bg-emerald-50 border-emerald-200">
          <h2 className="font-bold mb-2">Instruções de pagamento</h2>
          <p className="text-sm text-slate-700 whitespace-pre-line">{pix}</p>
          <button
            className="btn-secondary mt-3 text-sm"
            onClick={() => { navigator.clipboard.writeText(pix); toast.success('Copiado'); }}
          >
            Copiar
          </button>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-3 text-left">Data</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Kit</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{formatDate(p.created_at)}</td>
                <td className="p-3">{p.tipo}</td>
                <td className="p-3">{p.kit ?? '-'}</td>
                <td className="p-3"><StatusPill status={p.status} /></td>
                <td className="p-3 text-right"><MoneyDisplay cents={p.valor_centavos} /></td>
              </tr>
            ))}
            {!pedidos.length && (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">Nenhum pedido.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
