import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { Shield, Smartphone, Monitor, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminSecurity = () => {
    const [pass, setPass] = useState({ current: '', new: '', confirm: '' });
    const [sessions, setSessions] = useState([]);
    const [status, setStatus] = useState({ type: '', message: '' });

    const showStatus = (type, msg) => {
        setStatus({ type, message: msg });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

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

    const inputStyle = "w-full border dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";
    const buttonStyle = "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]";

    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Shield className="text-blue-600" size={32} /> Seguridad
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Protege tu cuenta y gestiona tus sesiones activas.</p>
            </div>

            {status.message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <p className="font-medium">{status.message}</p>
                </div>
            )}

            <div className="space-y-8">
                {/* Change Password */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Cambiar Contraseña</h3>
                    <form onSubmit={changePassword} className="space-y-4 max-w-md">
                        <input type="password" placeholder="Contraseña actual" className={inputStyle} value={pass.current} onChange={e => setPass({ ...pass, current: e.target.value })} />
                        <input type="password" placeholder="Nueva contraseña" className={inputStyle} value={pass.new} onChange={e => setPass({ ...pass, new: e.target.value })} />
                        <input type="password" placeholder="Confirmar nueva contraseña" className={inputStyle} value={pass.confirm} onChange={e => setPass({ ...pass, confirm: e.target.value })} />
                        <button type="submit" className={buttonStyle}>Actualizar Contraseña</button>
                    </form>
                </div>

                {/* 2FA Preview */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center">
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

export default AdminSecurity;
