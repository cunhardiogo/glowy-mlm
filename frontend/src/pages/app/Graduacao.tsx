import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useGraduacaoAtual, useHistoricoGraduacao } from '@/hooks/useGraduacao';
import { useLinhas } from '@/hooks/useRede';
import { ProgressoGraduacao } from '@/components/graduacao/ProgressoGraduacao';
import { VmlIndicator } from '@/components/graduacao/VmlIndicator';
import { Skeleton } from '@/components/ui/Skeleton';

const GRAD_NIVEL: Record<string, number> = {
  NENHUMA: 0, BRONZE: 1, PRATA: 2, OURO: 3, SAFIRA: 4,
  RUBI: 5, ESMERALDA: 6, DIAMANTE: 7,
};

export default function Graduacao() {
  const { data: gradRaw } = useGraduacaoAtual();
  const { data: histRaw } = useHistoricoGraduacao();
  const { data: linhasRaw } = useLinhas();

  const grad = (gradRaw as any)?.data ?? gradRaw;
  const hist: any[] = Array.isArray(histRaw) ? histRaw : (histRaw as any)?.data ?? [];
  const linhas: any[] = Array.isArray(linhasRaw) ? linhasRaw : (linhasRaw as any)?.data ?? [];

  const histChart = hist.map((h: any) => ({
    ciclo: h.ciclo_ref?.slice(0, 7) ?? '',
    nivel: GRAD_NIVEL[h.graduacao?.toUpperCase()] ?? 0,
    graduacao: h.graduacao,
  })).reverse();

  const vmlLinhas = linhas.map((l: any) => ({
    linha_id: l.id,
    nome: l.nome,
    volume: Number(l.pb_grupo ?? 0),
    limite: Math.round(Number(l.pb_grupo ?? 0) * (grad?.vml_percentual ?? 100) / 100),
    computado: Number(l.pb_grupo ?? 0),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Graduação</h1>

      {grad ? (
        <ProgressoGraduacao
          atual={grad.graduacao ?? 'NENHUMA'}
          pg={Number(grad.pg_atual ?? 0)}
          pg_proxima={Number(grad.pg_proxima ?? 0)}
          proxima={grad.proxima}
        />
      ) : <Skeleton className="h-40 w-full" />}

      {vmlLinhas.length > 0 && <VmlIndicator linhas={vmlLinhas} />}

      <div className="card p-4">
        <h3 className="font-semibold mb-3">Histórico de Graduação</h3>
        {hist.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={histChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ciclo" />
                <YAxis domain={[0, 7]} tickCount={8} />
                <Tooltip formatter={(value: number) => {
                  const entry = histChart.find(h => GRAD_NIVEL[h.graduacao?.toUpperCase()] === value);
                  return entry?.graduacao ?? value;
                }} />
                <Line type="monotone" dataKey="nivel" stroke="#2E9D5A" strokeWidth={2} dot={{ fill: '#2E9D5A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Sem histórico disponível.</p>
        )}
      </div>
    </div>
  );
}
