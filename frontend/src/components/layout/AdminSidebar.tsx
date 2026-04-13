import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, FileText, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/credenciamentos', icon: FileText, label: 'Credenciamentos' },
  { to: '/admin/saques', icon: Wallet, label: 'Saques' },
  { to: '/admin/usuarios', icon: Users, label: 'Usuários' },
  { to: '/admin/ciclos', icon: RefreshCw, label: 'Ciclos' },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Admin</p>
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
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
