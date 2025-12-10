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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider">BODEGA</h1>
          <p className="text-sm text-gray-400 mt-1">Inventory System</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin') ? 'bg-accent text-white' : 'text-gray-300 hover:bg-secondary'
                }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </Link>
          )}

          <Link
            to="/inventory"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/inventory') ? 'bg-accent text-white' : 'text-gray-300 hover:bg-secondary'
              }`}
          >
            <Package size={20} />
            Inventory
          </Link>

          <Link
            to="/movements"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/movements') ? 'bg-accent text-white' : 'text-gray-300 hover:bg-secondary'
              }`}
          >
            <ShoppingCart size={20} />
            Movements
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/payments"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/payments') ? 'bg-accent text-white' : 'text-gray-300 hover:bg-secondary'
                }`}
            >
              <DollarSign size={20} />
              Payments
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/audit-logs"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/audit-logs') ? 'bg-accent text-white' : 'text-gray-300 hover:bg-secondary'
                }`}
            >
              <FileText size={20} />
              Audit Logs
            </Link>
          )}

          <Link
            to="/reports"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/reports') ? 'bg-accent text-white' : 'text-gray-300 hover:bg-secondary'
              }`}
          >
            <BarChart3 size={20} />
            Reports
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
