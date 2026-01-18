import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, DollarSign, BarChart3, LogOut, Users, FileText } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background text-textMain">
      {/* Sidebar */}
      <aside className="w-64 bg-surface text-textMain flex flex-col border-r borderSoft">
        <div className="p-6 bg-primary text-white">
          <h1 className="text-2xl font-bold tracking-wider">BODEGA</h1>
          <p className="text-sm opacity-80 mt-1">Sistema de inventario</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-accent/20 text-primary border border-accent' : 'text-textMain hover:bg-accent/10'
                }`}
            >
              <LayoutDashboard size={20} />
              Panel admin
            </Link>
          )}

          <Link
            to="/inventory"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/inventory') ? 'bg-accent/20 text-primary border border-accent' : 'text-textMain hover:bg-accent/10'
              }`}
          >
            <Package size={20} />
            Inventario
          </Link>

          <Link
            to="/movements"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/movements') ? 'bg-accent/20 text-primary border border-accent' : 'text-textMain hover:bg-accent/10'
              }`}
          >
            <ShoppingCart size={20} />
            Movimientos
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/payments"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/payments') ? 'bg-accent/20 text-primary border border-accent' : 'text-textMain hover:bg-accent/10'
                }`}
            >
              <DollarSign size={20} />
              Pagos
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/audit-logs"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/audit-logs') ? 'bg-accent/20 text-primary border border-accent' : 'text-textMain hover:bg-accent/10'
                }`}
            >
              <FileText size={20} />
              Registros de auditoría
            </Link>
          )}

          <Link
            to="/reports"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/reports') ? 'bg-accent/20 text-primary border border-accent' : 'text-textMain hover:bg-accent/10'
              }`}
          >
            <BarChart3 size={20} />
            Reportes
          </Link>
        </nav>

        <div className="p-4 border-t borderSoft">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-textMuted capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-primary hover:bg-accent/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
