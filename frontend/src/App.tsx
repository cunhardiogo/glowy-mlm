import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Layout
import { AppShell } from '@/components/layout/AppShell';
import { PrivateRoute } from '@/components/layout/PrivateRoute';
import { AdminRoute } from '@/components/layout/AdminRoute';

// Public pages
import Login from '@/pages/public/Login';
import Cadastro from '@/pages/public/Cadastro';

// App pages
import Dashboard from '@/pages/app/Dashboard';
import MinhaRede from '@/pages/app/MinhaRede';
import Pedidos from '@/pages/app/Pedidos';
import Extrato from '@/pages/app/Extrato';
import Bonus from '@/pages/app/Bonus';
import Graduacao from '@/pages/app/Graduacao';
import Saques from '@/pages/app/Saques';
import Documentos from '@/pages/app/Documentos';
import Perfil from '@/pages/app/Perfil';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminCredenciamentos from '@/pages/admin/AdminCredenciamentos';
import AdminSaques from '@/pages/admin/AdminSaques';
import AdminUsuarios from '@/pages/admin/AdminUsuarios';
import AdminCiclos from '@/pages/admin/AdminCiclos';

function AppRoutes() {

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/cadastro/:patrocinador" element={<Cadastro />} />

      {/* App - protected EI */}
      <Route
        path="/:username"
        element={
          <PrivateRoute>
            <AppShell>
              <Dashboard />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/:username/rede"
        element={
          <PrivateRoute>
            <AppShell>
              <MinhaRede />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/:username/pedidos"
        element={
          <PrivateRoute>
            <AppShell>
              <Pedidos />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/:username/extrato"
        element={
          <PrivateRoute>
            <AppShell>
              <Extrato />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/:username/bonus"
        element={
          <PrivateRoute>
            <AppShell>
              <Bonus />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/:username/graduacao"
        element={
          <PrivateRoute>
            <AppShell>
              <Graduacao />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/:username/saques"
        element={
          <PrivateRoute>
            <AppShell>
              <Saques />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/:username/documentos"
        element={
          <PrivateRoute>
            <AppShell>
              <Documentos />
            </AppShell>
          </PrivateRoute>
        }
      />
      <Route
        path="/:username/perfil"
        element={
          <PrivateRoute>
            <AppShell>
              <Perfil />
            </AppShell>
          </PrivateRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AppShell>
              <AdminDashboard />
            </AppShell>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/credenciamentos"
        element={
          <AdminRoute>
            <AppShell>
              <AdminCredenciamentos />
            </AppShell>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/saques"
        element={
          <AdminRoute>
            <AppShell>
              <AdminSaques />
            </AppShell>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <AdminRoute>
            <AppShell>
              <AdminUsuarios />
            </AppShell>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/ciclos"
        element={
          <AdminRoute>
            <AppShell>
              <AdminCiclos />
            </AppShell>
          </AdminRoute>
        }
      />

      {/* Redirects */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function RootRedirect() {
  const { user, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.tipo === 'ADMIN') return <Navigate to="/admin" replace />;
  if (profile?.username) return <Navigate to={`/${profile.username}`} replace />;
  return <Navigate to="/login" replace />;
}

export default AppRoutes;
