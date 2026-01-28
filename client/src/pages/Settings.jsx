import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bell, Palette, Settings as SettingsIcon, Sliders, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Style Constants
const buttonStyle = "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
const inputStyle = "w-full border dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";
const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('notifications');
  const [status, setStatus] = useState({ type: '', message: '' });

  // Initialize tab from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  const tabs = [
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'system', label: 'Sistema', icon: SettingsIcon },
    { id: 'limits', label: 'Límites', icon: Sliders },
  ];

  const showStatus = (type, msg) => {
    setStatus({ type, message: msg });
    setTimeout(() => setStatus({ type: '', message: '' }), 4000);
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.20))] lg:h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sidebar Tabs */}
      <div className="w-20 lg:w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-y-auto">
        <div className="p-6 hidden lg:block">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <SettingsIcon className="text-primary" size={32} /> Configuración
          </h1>
        </div>
        <nav className="flex-1 px-2 space-y-1 mt-4 lg:mt-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
              <tab.icon size={20} />
              <span className="hidden lg:block font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {status.message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${status.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
              <p className="font-medium">{status.message}</p>
            </div>
          )}

          {activeTab === 'notifications' && <NotificationsTab showStatus={showStatus} />}
          {activeTab === 'appearance' && <AppearanceTab darkMode={darkMode} toggleTheme={toggleTheme} showStatus={showStatus} />}
          {activeTab === 'system' && <SystemTab showStatus={showStatus} />}
          {activeTab === 'limits' && <LimitsTab showStatus={showStatus} />}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components (Tabs) ---

const NotificationsTab = ({ showStatus }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    api.get('/settings/notifications').then(res => setConfig(res.data)).catch(() => { });
  }, []);

  const toggle = (section, key) => {
    if (!config) return;
    const newConfig = { ...config, [section]: { ...config[section], [key]: !config[section][key] } };
    setConfig(newConfig);
    api.patch('/settings/notifications', newConfig);
    showStatus('success', 'Preferencias actualizadas');
  };

  if (!config) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Preferencias de Notificación</h2>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Para el Administrador</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.admin.userExpiring} onChange={() => toggle('admin', 'userExpiring')} className="w-5 h-5 rounded text-blue-600" />
                <span className="text-slate-600 dark:text-slate-300">Avisar cuando un usuario está por vencer</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.admin.userSuspended} onChange={() => toggle('admin', 'userSuspended')} className="w-5 h-5 rounded text-blue-600" />
                <span className="text-slate-600 dark:text-slate-300">Avisar cuando un usuario es suspendido autom.</span>
              </label>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Para el Usuario</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.user.closeCutoff} onChange={() => toggle('user', 'closeCutoff')} className="w-5 h-5 rounded text-blue-600" />
                <span className="text-slate-600 dark:text-slate-300">Enviar recordatorio cerca de fecha de corte</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.user.suspended} onChange={() => toggle('user', 'suspended')} className="w-5 h-5 rounded text-blue-600" />
                <span className="text-slate-600 dark:text-slate-300">Notificar al ser suspendido</span>
              </label>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 dark:bg-slate-700"></div>

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Canales de Envío</h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.channels.system} onChange={() => toggle('channels', 'system')} className="w-5 h-5 rounded text-blue-600" />
                <span className="text-slate-600 dark:text-slate-300">Panel de Sistema</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={config.channels.email} onChange={() => toggle('channels', 'email')} className="w-5 h-5 rounded text-primary" />
                <span className="text-slate-600 dark:text-slate-300">Correo Electrónico</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppearanceTab = ({ toggleTheme, showStatus }) => {
  const { darkMode, changeThemeColor, themeColor } = useTheme();

  const changeColor = (newColor) => {
    changeThemeColor(newColor);
    showStatus('success', 'Color de tema actualizado');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Apariencia</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Modo Oscuro</h3>
            <p className="text-sm text-slate-500">Cambia entre tema claro y oscuro.</p>
          </div>
          <button onClick={toggleTheme} className={`w-14 h-7 rounded-full transition-colors flex items-center px-1 ${darkMode ? 'bg-primary justify-end' : 'bg-slate-300 justify-start'}`}>
            <div className="w-5 h-5 rounded-full bg-white shadow-sm"></div>
          </button>
        </div>

        <div className="mb-8">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Color Principal</h3>
          <div className="flex gap-4">
            {['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#f59e0b'].map(c => (
              <button key={c}
                onClick={() => changeColor(c)}
                className={`w-10 h-10 rounded-full border-2 shadow-md transition-all ${themeColor === c ? 'border-slate-800 dark:border-white scale-110' : 'border-white dark:border-slate-600'}`}
                style={{ backgroundColor: c }}
              ></button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Densidad de Interfaz</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="density" defaultChecked className="text-blue-600" />
              <span className="text-slate-700 dark:text-slate-300">Normal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="density" className="text-blue-600" />
              <span className="text-slate-700 dark:text-slate-300">Compacto</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const SystemTab = ({ showStatus }) => {
  const [sys, setSys] = useState(null);
  useEffect(() => { api.get('/settings/system').then(r => setSys(r.data)).catch(() => { }); }, []);

  const save = () => {
    api.patch('/settings/system', sys);
    showStatus('success', 'Configuración de sistema guardada');
  };

  if (!sys) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Sistema</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Formato de Fecha</label>
            <select className={`${inputStyle} bg-white dark:bg-slate-900`} value={sys.dateFormat} onChange={e => setSys({ ...sys, dateFormat: e.target.value })}>
              <option value="DD/MM/YYYY">DD/MM/YYYY (27/01/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (01/27/2026)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Zona Horaria</label>
            <select className={`${inputStyle} bg-white dark:bg-slate-900`} value={sys.timezone} onChange={e => setSys({ ...sys, timezone: e.target.value })}>
              <option value="America/Caracas">America/Caracas</option>
              <option value="America/New_York">America/New_York</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
        <div className="pt-2">
          <button onClick={save} className={buttonStyle}>Guardar Configuración</button>
        </div>
      </div>
    </div>
  );
};

const LimitsTab = ({ showStatus }) => {
  const [limits, setLimits] = useState(null);

  useEffect(() => {
    api.get('/settings/system').then(r => setLimits(r.data.limits || { maxProducts: 500, maxClients: 100 })).catch(() => { });
  }, []);

  const handleChange = (key, value) => {
    setLimits(prev => ({ ...prev, [key]: Number(value) }));
  };

  const save = () => {
    api.patch('/settings/system', { limits });
    showStatus('success', 'Límites actualizados correctamente');
  };

  if (!limits) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Límites y Cuotas</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-8">
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Productos por Usuario</label>
            <span className="text-blue-600 font-bold">{limits.maxProducts}</span>
          </div>
          <input
            type="range" min="100" max="2000" step="50"
            value={limits.maxProducts}
            onChange={e => handleChange('maxProducts', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-slate-500 mt-1">Límite para planes básicos.</p>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Clientes por Usuario</label>
            <span className="text-blue-600 font-bold">{limits.maxClients}</span>
          </div>
          <input
            type="range" min="50" max="1000" step="10"
            value={limits.maxClients}
            onChange={e => handleChange('maxClients', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
        <div className="pt-2">
          <button onClick={save} className={buttonStyle}>Guardar Límites</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
