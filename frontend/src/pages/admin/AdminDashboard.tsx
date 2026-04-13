import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: async () => (await api.get('/admin/dashboard')).data });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <Kpi title="EIs ativos" icon={Users} value={data?.data?.eis_ativos} />
        <Kpi title="Volume do mês" icon={TrendingUp} value={data?.data ? <MoneyDisplay cents={Number(data.data.volume_centavos)} /> : null} />
        <Kpi title="Bônus provisionados" icon={Clock} value={data?.data ? <MoneyDisplay cents={Number(data.data.bonus_provisionados_centavos)} /> : null} />
        <Kpi title="Saques pendentes" icon={AlertTriangle} value={data?.data?.saques_pendentes} />
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-3">Alertas</h2>
        <ul className="space-y-2 text-sm">
          {(data?.data?.alertas ?? []).map((a: any, i: number) => (
            <li key={i} className="flex items-center gap-2 text-amber-700">
              <AlertTriangle size={14} /> {a.mensagem}
            </li>
          ))}
          {!data?.data?.alertas?.length && <li className="text-slate-500">Sem alertas.</li>}
        </ul>
      </div>
    </div>
  );
}

function Kpi({ title, icon: Icon, value }: any) {
  return (
    <div className="card p-5">
      <div className="flex justify-between text-slate-500 mb-2"><span className="text-sm">{title}</span><Icon size={18} /></div>
      {value !== undefined && value !== null ? <p className="text-2xl font-bold">{value}</p> : <Skeleton className="h-8 w-20" />}
    </div>
  );
}
