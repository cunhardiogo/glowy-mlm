import { Wallet, Clock, Award, TrendingUp } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCarteira } from '@/hooks/useCarteira';
import { useGraduacaoAtual } from '@/hooks/useGraduacao';
import { useBonusResumo } from '@/hooks/useBonus';
import { useCicloAtual } from '@/hooks/useCiclo';
import { useDownline } from '@/hooks/useRede';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { GraduacaoBadge } from '@/components/ui/GraduacaoBadge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Dashboard() {
  const { username } = useParams();
  const { data: carteira } = useCarteira();
  const { data: grad } = useGraduacaoAtual();
  const { data: bonus } = useBonusResumo();
  const { data: ciclo } = useCicloAtual();
  const { data: rede } = useDownline(2);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Saldo disponível" icon={Wallet}>
          {carteira ? <MoneyDisplay cents={carteira.saldo_disponivel_centavos} className="text-2xl font-bold" /> : <Skeleton className="h-8 w-24" />}
        </Card>
        <Card title="Provisionado" icon={Clock}>
          {carteira ? <MoneyDisplay cents={carteira.saldo_provisionado_centavos} className="text-2xl font-bold" /> : <Skeleton className="h-8 w-24" />}
        </Card>
        <Card title="Graduação" icon={Award}>
          {grad ? <GraduacaoBadge graduacao={grad.graduacao} /> : <Skeleton className="h-6 w-16" />}
        </Card>
        <Card title="APM (mês)" icon={TrendingUp}>
          {ciclo ? (
            <>
              <p className="text-2xl font-bold">{ciclo.pb_apm ?? 0} PB</p>
              <div className="h-1.5 bg-slate-100 rounded-full mt-1"><div className="h-full bg-glowy-primary rounded-full" style={{ width: `${Math.min(100, ((ciclo.pb_apm ?? 0) / 50) * 100)}%` }} /></div>
            </>
          ) : <Skeleton className="h-8 w-20" />}
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="font-bold mb-3">Bônus do mês</h2>
          {bonus ? (
            <ul className="space-y-2">
              {(bonus.por_tipo ?? []).map((b: any) => (
                <li key={b.tipo} className="flex justify-between text-sm">
                  <span>{b.tipo}</span>
                  <MoneyDisplay cents={b.total_centavos} className="font-semibold" />
                </li>
              ))}
            </ul>
          ) : <Skeleton className="h-20 w-full" />}
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-3">Ativações recentes</h2>
          <ul className="space-y-2 text-sm">
            {(rede?.nodes ?? []).slice(0, 5).map((n: any) => (
              <li key={n.id} className="flex justify-between">
                <span>{n.nome}</span>
                <GraduacaoBadge graduacao={n.graduacao} />
              </li>
            ))}
            {!rede && <Skeleton className="h-20 w-full" />}
          </ul>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-3">Atalhos</h2>
        <div className="flex flex-wrap gap-2">
          <Link to={`/${username}/pedidos`} className="btn-primary">Fazer recompra</Link>
          <Link to={`/${username}/rede`} className="btn-secondary">Ver rede</Link>
          <Link to={`/${username}/saques`} className="btn-secondary">Solicitar saque</Link>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon: Icon, children }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2 text-slate-500">
        <span className="text-sm">{title}</span>
        <Icon size={18} />
      </div>
      {children}
    </div>
  );
}
