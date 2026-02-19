import React, { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, LogOut, Shield, Database, Settings, Menu, X, UserCog, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

import { useTheme } from '../context/ThemeContext';
import BrandIcon from '../components/BrandIcon';

const Layout = () => {
  const { user, logout, warningActive, secondsLeft, loading } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backupMenuOpen, setBackupMenuOpen] = useState(false);

  if (loading || (typeof loading === 'undefined' && !user)) return <div className="flex items-center justify-center min-h-screen bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!user && !loading) return <Navigate to="/login" />;

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(path) ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`;

  const handleDownloadBackup = async () => {
    try {
      const response = await api.get('/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setBackupMenuOpen(false);
    } catch (error) {
      alert('Error al generar el respaldo');
    }
  };

  const handleRestoreBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        await api.post('/restore', jsonData);
        alert('Respaldo restaurado exitosamente');
        setBackupMenuOpen(false);
        window.location.reload();
      } catch (error) {
        alert('Error al restaurar el respaldo');
      }
    };
    reader.readAsText(file);
  };

  const SidebarNav = () => (
    <nav className="flex-1 space-y-2">
      {user.role === 'admin' ? (
        <>
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-2 mb-1">General</div>
          <Link to="/admin" className={linkClass('/admin')} onClick={() => setMobileMenuOpen(false)}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>

          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-1">Mi Cuenta</div>
          <Link to="/admin/profile" className={linkClass('/admin/profile')} onClick={() => setMobileMenuOpen(false)}>
            <UserCog size={20} /> Perfil
          </Link>
          <Link to="/admin/security" className={linkClass('/admin/security')} onClick={() => setMobileMenuOpen(false)}>
            <Shield size={20} /> Seguridad
          </Link>
          <Link to="/admin/billing" className={linkClass('/admin/billing')} onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart size={20} /> Pagos
          </Link>

          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-1">Gestión</div>
          <Link to="/admin/support" className={linkClass('/admin/support')} onClick={() => setMobileMenuOpen(false)}>
            <Users size={20} /> Soporte
          </Link>
          <Link to="/admin/audit" className={linkClass('/admin/audit')} onClick={() => setMobileMenuOpen(false)}>
            <BarChart3 size={20} /> Auditoría
          </Link>
          <Link to="/admin/backups" className={linkClass('/admin/backups')} onClick={() => setMobileMenuOpen(false)}>
            <Database size={20} /> Respaldos
          </Link>

          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-1">Sistema</div>
          <Link to="/admin/settings" className={linkClass('/admin/settings')} onClick={() => setMobileMenuOpen(false)}>
            <Settings size={20} /> Configuración
          </Link>
        </>
      ) : (
        <>
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Menu</div>
          <Link to="/user" className={linkClass('/user')} onClick={() => setMobileMenuOpen(false)}>
            <LayoutDashboard size={20} /> Inicio
          </Link>
          <Link to="/user/inventory" className={linkClass('/user/inventory')} onClick={() => setMobileMenuOpen(false)}>
            <Package size={20} /> Inventario
          </Link>
          <Link to="/user/sales" className={linkClass('/user/sales')} onClick={() => setMobileMenuOpen(false)}>
            <ShoppingCart size={20} /> Ventas
          </Link>
          <Link to="/user/clients" className={linkClass('/user/clients')} onClick={() => setMobileMenuOpen(false)}>
            <Users size={20} /> Clientes
          </Link>
          <Link to="/user/reports" className={linkClass('/user/reports')} onClick={() => setMobileMenuOpen(false)}>
            <BarChart3 size={20} /> Reportes
          </Link>
        </>
      )}
    </nav>
  );

  const SidebarFooter = () => (
    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="px-4 mb-4">
        <p className="text-sm font-medium text-slate-800 dark:text-white">{user.username}</p>
        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
      </div>
      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-500 transition-colors">
        <LogOut size={20} /> Cerrar Sesión
      </button>
    </div>
  );

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <BrandIcon size={32} />
          </div>
          <h1 className="text-xl font-bold text-white">Invexis</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-800 text-slate-200"
          aria-label="Cambiar tema"
          title="Cambiar tema"
        >
          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
      <SidebarNav />
      <SidebarFooter />
    </>
  );

  return (
    <div className="flex transition-colors duration-300 min-h-screen bg-transparent">
      {/* Mobile Top Bar (Visible only on mobile) */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 z-40 flex items-center px-4 justify-between">
        <span className="ml-12 font-bold text-lg text-slate-800 dark:text-white">Invexis</span>
        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100/50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200"
          aria-label="Cambiar tema"
          title="Cambiar tema"
        >
          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Desktop Toggle Button (Always visible on desktop, top-left) */}
      <div className="hidden lg:flex fixed top-4 left-4 z-[100]">
        <button
          className="p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-white rounded-lg shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Button - Mobile Only */}
      {!mobileMenuOpen && (
        <button
          className="lg:hidden fixed top-3 left-4 z-50 p-2 bg-slate-900/80 backdrop-blur-sm text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Unified Sidebar (Desktop + Mobile) */}
      {/* 
        Desktop Logic:
        - Fixed position, hidden by default (-translate-x-full).
        - Opens on click (mobileMenuOpen) OR Hover.
        - MouseEnter on container opens it. MouseLeave closes it (if not forced open via state, but sticking to simple hover + toggle).
        - To ensure "disappear when not using", we use a group-hover strategy or simple state.
        
        Let's use the 'mobileMenuOpen' state for both mobile and desktop toggle, 
        plus a hover trigger for desktop.
      */}
      {/* Backdrop Overlay for closing sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Unified Sidebar (Desktop + Mobile) */}
      <div
        className={`fixed inset-y-0 left-0 w-64 z-50 flex flex-col transition-transform duration-300 shadow-2xl 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between mb-6 px-6 pt-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <BrandIcon size={32} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Invexis</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>

          {/* Desktop Theme Toggle inside Sidebar */}
          <button
            onClick={toggleTheme}
            className="hidden lg:inline-flex items-center gap-2 px-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            aria-label="Cambiar tema"
          >
            {darkMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div className="px-4 flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <SidebarFooter />
      </div>

      {/* Invisible Hover Strip for Desktop to trigger sidebar if closed */}


      <main className="flex-1 w-full pt-20 lg:pt-0 min-h-screen bg-transparent transition-colors duration-300">
        <Outlet />
        {warningActive && (
          <div className="fixed bottom-4 right-4 z-50 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-xl shadow">
            Se cerrará sesión por inactividad en {secondsLeft}s
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
