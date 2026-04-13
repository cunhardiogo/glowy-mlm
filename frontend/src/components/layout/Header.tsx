import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GraduacaoBadge } from '@/components/ui/GraduacaoBadge';
import { MoneyDisplay } from '@/components/ui/MoneyDisplay';
import { useCarteira } from '@/hooks/useCarteira';

export function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { profile, signOut } = useAuth();
  const { data: carteira } = useCarteira();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2" onClick={onToggleSidebar}><Menu size={20} /></button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-glowy-primary to-glowy-secondary" />
          <span className="font-bold text-glowy-dark">Glowy Life</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-semibold">{profile?.nome}</span>
          <div className="flex items-center gap-2">
            <GraduacaoBadge graduacao={profile?.graduacao_ciclo_atual} />
            <span className="text-xs text-slate-600">
              <MoneyDisplay cents={carteira?.saldo_disponivel_centavos ?? 0} />
            </span>
          </div>
        </div>
        <button className="btn-secondary" onClick={signOut} title="Sair">
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
