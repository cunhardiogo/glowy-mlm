import { useState } from 'react';
import { Download, Gift, Users, Award, TrendingUp } from 'lucide-react';
import { useBonus, useBonusResumo } from '@/hooks/useBonus';
import { BonusCard } from '@/components/bonus/BonusCard';
import { BonusTable } from '@/components/bonus/BonusTable';

const TIPOS = [
  { tipo: 'PRIMEIRO_PEDIDO', nome: 'Primeiro Pedido', icon: TrendingUp },
  { tipo: 'UPGRADE', nome: 'Upgrade', icon: Users },
  { tipo: 'PRODUTIVIDADE', nome: 'Produtividade', icon: Gift },
  { tipo: 'EQUIPARACAO', nome: 'Equiparação', icon: Award },
];

export default function Bonus() {
  const [ciclo, setCiclo] = useState('');
  const [tipo, setTipo] = useState('');

  const cicloParam = ciclo.length === 7 ? ciclo + '-01' : ciclo || undefined;
  const { data: resumoRaw } = useBonusResumo(cicloParam);
  const { data: rowsRaw } = useBonus(cicloParam);

  const resumo = (resumoRaw as any)?.data ?? resumoRaw;
  const rows: any[] = Array.isArray(rowsRaw) ? rowsRaw : (rowsRaw as any)?.data ?? [];

  const filtered = rows.filter((r: any) => !tipo || r.tipo === tipo);

  const exportCSV = () => {
    const header = 'tipo,origem,valor\n';
    const body = filtered.map((r: any) => `${r.tipo},${r.origem_user_id ?? ''},${r.valor_centavos}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bonus-${cicloParam || 'atual'}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bônus</h1>
        <button className="btn-secondary flex items-center gap-1" onClick={exportCSV}>
          <Download size={16} /> CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TIPOS.map((t) => {
          const item = (resumo?.por_tipo ?? []).find((x: any) => x.tipo === t.tipo);
          return <BonusCard key={t.tipo} nome={t.nome} tipo={t.tipo} total_centavos={item?.total_centavos ?? 0} icon={t.icon} />;
        })}
      </div>

      <div className="flex gap-3">
        <input
          className="input max-w-[160px]"
          placeholder="Ciclo (YYYY-MM)"
          value={ciclo}
          onChange={(e) => setCiclo(e.target.value)}
        />
        <select className="input max-w-[220px]" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          {TIPOS.map((t) => <option key={t.tipo} value={t.tipo}>{t.nome}</option>)}
        </select>
      </div>

      <BonusTable rows={filtered} />
    </div>
  );
}
