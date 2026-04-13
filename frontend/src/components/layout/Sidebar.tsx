import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Receipt, Gift, Award, Wallet, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: 'rede', icon: Users, label: 'Minha Rede' },
  { to: 'pedidos', icon: ShoppingBag, label: 'Pedidos' },
  { to: 'extrato', icon: Receipt, label: 'Extrato' },
  { to: 'bonus', icon: Gift, label: 'Bônus' },
  { to: 'graduacao', icon: Award, label: 'Graduação' },
  { to: 'saques', icon: Wallet, label: 'Saques' },
  { to: 'documentos', icon: FileText, label: 'Documentos' },
  { to: 'perfil', icon: User, label: 'Perfil' },
];

export function Sidebar({ username, onNavigate }: { username: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to ? `/${username}/${it.to}` : `/${username}`}
          end={it.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition',
              isActive ? 'bg-glowy-primary text-white' : 'text-slate-700 hover:bg-slate-100'
            )
          }
        >
          <it.icon size={18} />
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}
