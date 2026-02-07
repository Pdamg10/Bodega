import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Bell, Settings as SettingsIcon, Sliders, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Style Constants
const buttonStyle = "flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
const inputStyle = "w-full border dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all";
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
    { id: 'system', label: 'Sistema', icon: SettingsIcon },
    { id: 'limits', label: 'Límites', icon: Sliders },
  ];

  const showStatus = (type, msg) => {
    setStatus({ type, message: msg });
    setTimeout(() => setStatus({ type: '', message: '' }), 4000);
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.20))] lg:h-screen overflow-hidden bg-transparent transition-colors duration-300">
      {/* Sidebar Tabs */}
      <div className="w-20 lg:w-64 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border-r border-white/20 dark:border-slate-700/50 flex flex-col overflow-y-auto">
        <div className="p-6 hidden lg:block pt-20"> {/* Added pt-20 to avoid overlap with global menu button */}
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
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
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
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-8"> {/* Adjusted top padding for mobile overlap */}
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

  const NotificationSwitch = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer transition-colors group">
      <span className="text-slate-700 dark:text-slate-300 font-medium group-hover:text-primary transition-colors">{label}</span>
      <div className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
      </div>
    </label>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Preferencias de Notificación</h2>

      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-lg">Para el Administrador</h3>
            <div className="space-y-1">
              <NotificationSwitch
                checked={config.admin.userExpiring}
                onChange={() => toggle('admin', 'userExpiring')}
                label="Avisar cuando un usuario está por vencer"
              />
              <NotificationSwitch
                checked={config.admin.userSuspended}
                onChange={() => toggle('admin', 'userSuspended')}
                label="Avisar cuando un usuario es suspendido autom."
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50"></div>

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-lg">Para el Usuario</h3>
            <div className="space-y-1">
              <NotificationSwitch
                checked={config.user.closeCutoff}
                onChange={() => toggle('user', 'closeCutoff')}
                label="Enviar recordatorio cerca de fecha de corte"
              />
              <NotificationSwitch
                checked={config.user.suspended}
                onChange={() => toggle('user', 'suspended')}
                label="Notificar al ser suspendido"
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50"></div>

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-lg">Canales de Envío</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NotificationSwitch
                checked={config.channels.system}
                onChange={() => toggle('channels', 'system')}
                label="Panel de Sistema"
              />
              <NotificationSwitch
                checked={config.channels.email}
                onChange={() => toggle('channels', 'email')}
                label="Correo Electrónico"
              />
            </div>
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
      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 space-y-4">
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
      <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6 space-y-8">
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Productos por Usuario</label>
            <span className="text-primary font-bold">{limits.maxProducts}</span>
          </div>
          <input
            type="range" min="100" max="2000" step="50"
            value={limits.maxProducts}
            onChange={e => handleChange('maxProducts', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <p className="text-xs text-slate-500 mt-1">Límite para planes básicos.</p>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-semibold text-slate-700 dark:text-slate-300">Clientes por Usuario</label>
            <span className="text-primary font-bold">{limits.maxClients}</span>
          </div>
          <input
            type="range" min="50" max="1000" step="10"
            value={limits.maxClients}
            onChange={e => handleChange('maxClients', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
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
