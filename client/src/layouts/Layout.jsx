import React, { useState } from 'react';
import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, BarChart3, LogOut, Shield, Database, Settings, Menu, X, UserCog, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

import { useTheme } from '../context/ThemeContext';
import BrandIcon from '../components/BrandIcon';

const Layout = () => {
  const { user, logout, warningActive, secondsLeft } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backupMenuOpen, setBackupMenuOpen] = useState(false);

  if (!user) return <Navigate to="/login" />;

  const isActive = (path) => location.pathname === path;
  const linkClass = (path) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(path) ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`;

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
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin</div>
          <Link to="/admin" className={linkClass('/admin')} onClick={() => setMobileMenuOpen(false)}>
            <Shield size={20} /> Dashboard
          </Link>

          <Link to="/admin/backup" className={linkClass('/admin/backup')} onClick={() => setMobileMenuOpen(false)}>
            <Database size={20} /> Respaldo
          </Link>

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
        </>
      )}
    </nav>
  );

  const SidebarFooter = () => (
    <div className="pt-6 border-t border-slate-800 mt-auto">
      <div className="px-4 mb-4">
        <p className="text-sm font-medium text-white">{user.username}</p>
        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
      </div>
      <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-40 flex items-center px-4 justify-between">
        <span className="ml-12 font-bold text-lg text-slate-800 dark:text-white">Invexis</span>
        <button
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
          aria-label="Cambiar tema"
          title="Cambiar tema"
        >
          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Mobile Menu Button - Only show when menu is CLOSED */}
      {!mobileMenuOpen && (
        <button
          className="lg:hidden fixed top-3 left-4 z-50 p-2 bg-slate-900 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      )}

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col p-6 h-full">
        <SidebarContent />
      </aside>

      {/* Sidebar for Mobile */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 p-6 flex flex-col transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
        {/* Mobile Sidebar Header with Close Button */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <BrandIcon size={32} />
            </div>
            <h1 className="text-xl font-bold text-white">Invexis</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <SidebarNav />
        <SidebarFooter />
      </div>


      <main className="flex-1 overflow-auto w-full pt-20 lg:pt-0">
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
