import { useState } from 'react';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';

export interface BonusRow {
  id: string;
  tipo: string;
  nivel?: number;
  origem_nome: string;
  percentual: number;
  base_centavos: number;
  valor_centavos: number;
}

export function BonusTable({ rows }: { rows: BonusRow[] }) {
  const [page, setPage] = useState(0);
  const perPage = 20;
  const pages = Math.max(1, Math.ceil(rows.length / perPage));
  const slice = rows.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left p-3">Tipo</th>
            <th className="text-left p-3">Nível</th>
            <th className="text-left p-3">Origem</th>
            <th className="text-right p-3">%</th>
            <th className="text-right p-3">Base</th>
            <th className="text-right p-3">Valor</th>
          </tr>
        </thead>
        <tbody>
          {slice.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.tipo}</td>
              <td className="p-3">{r.nivel ?? '-'}</td>
              <td className="p-3">{r.origem_nome}</td>
              <td className="p-3 text-right">{r.percentual}%</td>
              <td className="p-3 text-right"><MoneyDisplay cents={r.base_centavos} /></td>
              <td className="p-3 text-right font-semibold"><MoneyDisplay cents={r.valor_centavos} /></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">Nenhum bônus.</td></tr>}
        </tbody>
      </table>
      {pages > 1 && (
        <div className="flex items-center justify-between p-3 border-t">
          <button className="btn-secondary" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Anterior</button>
          <span className="text-sm">{page + 1} / {pages}</span>
          <button className="btn-secondary" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>Próxima</button>
        </div>
      )}
    </div>
  );
}
