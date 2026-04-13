import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useCarteira, useSaques, useCriarSaque } from '@/hooks/useCarteira';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatDate } from '@/lib/utils';

const schema = z.object({
  valor_reais: z.coerce.number().min(10),
  pix_tipo: z.enum(['CPF', 'EMAIL', 'TELEFONE', 'ALEATORIA']),
  pix_chave: z.string().min(3),
});
type F = z.infer<typeof schema>;

export default function Saques() {
  const { data: carteira } = useCarteira();
  const { data: saques } = useSaques();
  const criar = useCriarSaque();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (d: F) => {
    try {
      await criar.mutateAsync({ valor_centavos: Math.round(d.valor_reais * 100), pix_tipo: d.pix_tipo, pix_chave: d.pix_chave });
      toast.success('Saque solicitado');
      reset();
    } catch {}
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saques</h1>

      <div className="card p-5">
        <p className="text-sm text-slate-500">Saldo disponível</p>
        <p className="text-3xl font-bold text-glowy-primary"><MoneyDisplay cents={carteira?.saldo_disponivel_centavos ?? 0} /></p>
      </div>

      <form className="card p-5 space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <h2 className="font-semibold">Solicitar saque</h2>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="label">Valor (R$)</label>
            <input type="number" step="0.01" className="input" {...register('valor_reais')} />
            {errors.valor_reais && <p className="text-xs text-red-600">mínimo R$ 10</p>}
          </div>
          <div>
            <label className="label">Tipo PIX</label>
            <select className="input" {...register('pix_tipo')}>
              <option value="CPF">CPF</option>
              <option value="EMAIL">Email</option>
              <option value="TELEFONE">Telefone</option>
              <option value="ALEATORIA">Aleatória</option>
            </select>
          </div>
          <div>
            <label className="label">Chave</label>
            <input className="input" {...register('pix_chave')} />
          </div>
        </div>
        <button className="btn-primary" disabled={isSubmitting}>Solicitar</button>
      </form>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="p-3 text-left">Data</th><th className="p-3 text-left">Chave</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Valor</th></tr></thead>
          <tbody>
            {(saques ?? []).map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{formatDate(s.created_at)}</td>
                <td className="p-3">{s.pix_chave}</td>
                <td className="p-3"><StatusPill status={s.status} /></td>
                <td className="p-3 text-right"><MoneyDisplay cents={s.valor_centavos} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
