import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  User, Shield, CreditCard, Bell, Database, Palette,
  Settings as SettingsIcon, Sliders, FileText, MessageSquare,
  Save, Download, Trash2, Clock, RefreshCw, Smartphone,
  Monitor, LogOut, CheckCircle, AlertTriangle
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Style Constants
const buttonStyle = "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
const inputStyle = "w-full border dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";
const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

const Settings = () => {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [status, setStatus] = useState({ type: '', message: '' });

  // Initialize tab from URL query param if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'billing', label: 'Pagos', icon: CreditCard },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'backups', label: 'Respaldos', icon: Database },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'system', label: 'Sistema', icon: SettingsIcon },
    { id: 'limits', label: 'Límites', icon: Sliders },
    { id: 'audit', label: 'Auditoría', icon: FileText },
    { id: 'support', label: 'Soporte', icon: MessageSquare },
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ajustes</h1>
          <p className="text-sm text-slate-500">Panel de control</p>
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

          {activeTab === 'profile' && <ProfileTab user={user} showStatus={showStatus} />}
          {activeTab === 'security' && <SecurityTab showStatus={showStatus} />}
          {activeTab === 'billing' && <BillingTab />}
          {activeTab === 'notifications' && <NotificationsTab showStatus={showStatus} />}
          {activeTab === 'backups' && <BackupsTab showStatus={showStatus} />}
          {activeTab === 'appearance' && <AppearanceTab darkMode={darkMode} toggleTheme={toggleTheme} />}
          {activeTab === 'system' && <SystemTab showStatus={showStatus} />}
          {activeTab === 'limits' && <LimitsTab />}
          {activeTab === 'audit' && <AuditTab />}
          {activeTab === 'support' && <SupportTab />}
        </div>
      </div>
    </div>
  );
};

// --- Sub-components (Tabs) ---

const ProfileTab = ({ user, showStatus }) => {
  const [data, setData] = useState({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app we would PUT to /auth/profile
    showStatus('success', 'Perfil actualizado correctamente');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Perfil Personal</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Nombre</label>
              <input type="text" value={data.firstName} onChange={e => setData({ ...data, firstName: e.target.value })} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>Apellido</label>
              <input type="text" value={data.lastName} onChange={e => setData({ ...data, lastName: e.target.value })} className={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelStyle}>Correo Electrónico</label>
            <input type="email" value={data.email} onChange={e => setData({ ...data, email: e.target.value })} className={inputStyle} />
          </div>
          <div>
            <label className={labelStyle}>Teléfono</label>
            <input type="tel" value={data.phone} onChange={e => setData({ ...data, phone: e.target.value })} className={inputStyle} />
          </div>
          <div className="pt-2">
            <button type="submit" className={buttonStyle}>
              <Save size={18} /> Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SecurityTab = ({ showStatus }) => {
  const [pass, setPass] = useState({ current: '', new: '', confirm: '' });
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.get('/settings/sessions')
      .then(res => setSessions(res.data || []))
      .catch(() => { });
  }, []);

  const changePassword = (e) => {
    e.preventDefault();
    if (pass.new !== pass.confirm) return showStatus('error', 'Las contraseñas no coinciden');
    showStatus('success', 'Contraseña actualizada');
    setPass({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Seguridad</h2>

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Cambiar Contraseña</h3>
          <form onSubmit={changePassword} className="space-y-4 max-w-md">
            <input type="password" placeholder="Contraseña actual" className={inputStyle} value={pass.current} onChange={e => setPass({ ...pass, current: e.target.value })} />
            <input type="password" placeholder="Nueva contraseña" className={inputStyle} value={pass.new} onChange={e => setPass({ ...pass, new: e.target.value })} />
            <input type="password" placeholder="Confirmar nueva contraseña" className={inputStyle} value={pass.confirm} onChange={e => setPass({ ...pass, confirm: e.target.value })} />
            <button type="submit" className={buttonStyle}>Actualizar Contraseña</button>
          </form>
        </div>

        {/* 2FA Preview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Verificación en dos pasos (2FA)</h3>
            <p className="text-sm text-slate-500">Añade una capa extra de seguridad a tu cuenta.</p>
          </div>
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Configurar</button>
        </div>

        {/* Active Sessions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Sesiones Activas</h3>
            <button className="text-red-500 text-sm hover:underline">Cerrar todas las sesiones</button>
          </div>
          <div className="space-y-4">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                  {s.device.includes('iPhone') || s.device.includes('Mobile') ? <Smartphone size={20} className="text-slate-400" /> : <Monitor size={20} className="text-slate-400" />}
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">{s.device}</p>
                    <p className="text-xs text-slate-500">{s.ip} • {s.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  {s.current ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Actual</span> : <span className="text-xs text-slate-500">Activo: {new Date(s.lastActive).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BillingTab = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Facturación y Planes</h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20">
        <p className="text-blue-100 font-medium mb-1">Plan Actual</p>
        <h3 className="text-3xl font-bold mb-4">Profesional 🥈</h3>
        <p className="text-2xl font-bold mb-1">$29.99 <span className="text-sm font-normal text-blue-200">/mes</span></p>
        <p className="text-sm text-blue-200 mb-6">Próxima factura: 15 Feb 2026</p>
        <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-sm font-semibold">Gestionar Suscripción</button>
      </div>

      <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Métodos de Pago Aceptados</h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {['Transferencia Bancaria', 'Pago Móvil', 'Zelle', 'Efectivo', 'USDT'].map(m => (
            <span key={m} className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm border border-slate-200 dark:border-slate-600">
              {m}
            </span>
          ))}
          <button className="px-3 py-1 rounded-full border border-dashed border-slate-300 hover:border-blue-500 text-slate-400 hover:text-blue-500 text-sm transition-colors">+ Agregar</button>
        </div>

        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Configuración Comercial</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Moneda del Sistema</label>
            <select className={`${inputStyle} bg-white dark:bg-slate-900`}>
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>VES (Bs)</option>
            </select>
          </div>
          <div>
            <label className={labelStyle}>Días de gracia (Impago)</label>
            <input type="number" className={inputStyle} defaultValue={5} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

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
                <input type="checkbox" checked={config.channels.email} onChange={() => toggle('channels', 'email')} className="w-5 h-5 rounded text-blue-600" />
                <span className="text-slate-600 dark:text-slate-300">Correo Electrónico</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BackupsTab = ({ showStatus }) => {
  const [backups, setBackups] = useState([]);
  const [creating, setCreating] = useState(false);

  const fetchBackups = () => {
    api.get('/backups').then(res => setBackups(res.data || [])).catch(() => { });
  };

  useEffect(() => { fetchBackups(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await api.post('/backups/create');
      fetchBackups();
      showStatus('success', 'Respaldo creado correctamente');
    } catch {
      showStatus('error', 'Error creando respaldo');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Respaldos del Sistema</h2>
        <button onClick={handleCreate} disabled={creating} className={buttonStyle}>
          <Database size={18} /> {creating ? 'Creando...' : 'Crear Respaldo'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Archivo</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
              <th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {backups.map(b => (
              <tr key={b.id}>
                <td className="px-6 py-4 font-medium text-slate-800 dark:text-white">{b.name}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{new Date(b.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="text-blue-600 hover:text-blue-500" title="Descargar"><Download size={18} /></button>
                  <button className="text-emerald-600 hover:text-emerald-500" title="Restaurar"><RefreshCw size={18} /></button>
                  <button className="text-red-500 hover:text-red-400" title="Eliminar"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {backups.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-slate-500">No hay respaldos</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex gap-2"><Clock size={18} /> Automatización</h3>
          <p className="text-sm text-slate-500 mb-4">Configura la frecuencia de los respaldos automáticos.</p>
          <select className={`${inputStyle} bg-white dark:bg-slate-900`}>
            <option value="">Desactivado</option>
            <option value="daily">Diario (3:00 AM)</option>
            <option value="weekly">Semanal (Domingos)</option>
          </select>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-2 flex gap-2"><Trash2 size={18} /> Retención</h3>
          <p className="text-sm text-slate-500 mb-4">Eliminar copias antiguas automáticamente.</p>
          <select className={`${inputStyle} bg-white dark:bg-slate-900`}>
            <option value="7">Mantener últimos 7 días</option>
            <option value="30">Mantener últimos 30 días</option>
            <option value="90">Mantener últimos 90 días</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const AppearanceTab = ({ darkMode, toggleTheme }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Apariencia</h2>
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">Modo Oscuro</h3>
          <p className="text-sm text-slate-500">Cambia entre tema claro y oscuro.</p>
        </div>
        <button onClick={toggleTheme} className={`w-14 h-7 rounded-full transition-colors flex items-center px-1 ${darkMode ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
          <div className="w-5 h-5 rounded-full bg-white shadow-sm"></div>
        </button>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Color Principal</h3>
        <div className="flex gap-4">
          {['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#f59e0b'].map(c => (
            <button key={c} className="w-10 h-10 rounded-full border-2 border-white shadow-md ring-2 ring-transparent hover:ring-slate-300 transition-all" style={{ backgroundColor: c }}></button>
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

const LimitsTab = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Límites y Cuotas</h2>
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-8">
      <div>
        <div className="flex justify-between mb-2">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Productos por Usuario</label>
          <span className="text-blue-600 font-bold">500</span>
        </div>
        <input type="range" min="100" max="2000" defaultValue="500" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        <p className="text-xs text-slate-500 mt-1">Límite para planes básicos.</p>
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <label className="font-semibold text-slate-700 dark:text-slate-300">Clientes por Usuario</label>
          <span className="text-blue-600 font-bold">100</span>
        </div>
        <input type="range" min="50" max="1000" defaultValue="100" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
      </div>
    </div>
  </div>
);

const AuditTab = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { api.get('/settings/audit').then(r => setLogs(r.data || [])).catch(() => { }); }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Registro de Auditoría</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Acción</th>
              <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Detalle</th>
              <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Admin</th>
              <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-3 font-medium text-blue-600 dark:text-blue-400">{log.action}</td>
                <td className="px-6 py-3 text-slate-700 dark:text-slate-200">{log.detail}</td>
                <td className="px-6 py-3 text-slate-500">{log.admin}</td>
                <td className="px-6 py-3 text-slate-500">{new Date(log.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SupportTab = () => {
  const [msgs, setMsgs] = useState([]);
  useEffect(() => { api.get('/support/messages').then(r => setMsgs(r.data || [])).catch(() => { }); }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Bandeja de Soporte</h2>
      <div className="space-y-4">
        {msgs.map(msg => (
          <div key={msg.id} className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border ${msg.read ? 'border-slate-200 dark:border-slate-700' : 'border-blue-400 dark:border-blue-500 ring-1 ring-blue-100 dark:ring-blue-900'}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">{msg.subject}</h3>
                <p className="text-xs text-slate-500">De: {msg.user} • {new Date(msg.date).toLocaleString()}</p>
              </div>
              {!msg.read && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">Nuevo</span>}
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">{msg.text}</p>
            <div className="flex gap-2">
              <button className="text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg transition-colors">Responder</button>
              <button className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1.5">Marcar como leído</button>
            </div>
          </div>
        ))}
        {msgs.length === 0 && <p className="text-center text-slate-500">No hay mensajes.</p>}
      </div>
    </div>
  );
};

export default Settings;
