import { ReactNode, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: ReactNode }) {
  const { username: routeUsername } = useParams();
  const { profile } = useAuth();
  const username = routeUsername || profile?.username || '';
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <Header onToggleSidebar={() => setOpen((v) => !v)} />
      <div className="flex-1 flex overflow-hidden">
        <aside
          className={cn(
            'fixed md:static inset-y-16 left-0 z-20 w-64 bg-white border-r border-slate-200 transform transition-transform md:transform-none',
            open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          )}
        >
          {profile?.tipo === 'ADMIN'
            ? <AdminSidebar onNavigate={() => setOpen(false)} />
            : <Sidebar username={username} onNavigate={() => setOpen(false)} />
          }
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
