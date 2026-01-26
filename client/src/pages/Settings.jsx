import React, { useState } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { UserCog, Save, CheckCircle, AlertTriangle, Moon, Sun, Palette } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [adminData, setAdminData] = useState({ username: '', newPassword: '' });
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    
    try {
      await api.put('/auth/profile', { id: user.id, ...adminData });
      setStatus({ type: 'success', message: 'Credenciales actualizadas correctamente' });
      setAdminData({ username: '', newPassword: '' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Error al actualizar credenciales' });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto transition-colors duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Configuración</h1>
        <p className="text-slate-500 dark:text-slate-400">Administra tu cuenta y preferencias</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <Palette size={24} className="text-purple-600" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Apariencia</h2>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-white">Tema de la interfaz</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona tu preferencia visual</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {darkMode ? <><Moon size={20} /> Modo Oscuro</> : <><Sun size={20} /> Modo Claro</>}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <UserCog size={24} className="text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Perfil de Administrador</h2>
        </div>
        
        <div className="p-8">
          {status.message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <p className="font-medium">{status.message}</p>
            </div>
          )}

          <form onSubmit={handleUpdateAdmin} className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nuevo Usuario</label>
              <input 
                type="text" 
                className="w-full border dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={adminData.username}
                onChange={e => setAdminData({...adminData, username: e.target.value})}
                placeholder="Dejar vacío para no cambiar"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nueva Contraseña</label>
              <input 
                type="password" 
                className="w-full border dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={adminData.newPassword}
                onChange={e => setAdminData({...adminData, newPassword: e.target.value})}
                placeholder="Dejar vacío para no cambiar"
              />
            </div>
            
            <div className="pt-4">
              <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Save size={20} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
