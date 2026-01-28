import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { Database, Download, RefreshCw, Trash2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminBackups = () => {
    const [backups, setBackups] = useState([]);
    const [creating, setCreating] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const showStatus = (type, msg) => {
        setStatus({ type, message: msg });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

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

    const buttonStyle = "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
    const inputStyle = "w-full border dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";

    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Database className="text-blue-600" size={32} /> Respaldos del Sistema
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Crea, restaura y gestiona las copias de seguridad de la base de datos.</p>
                </div>
                <button onClick={handleCreate} disabled={creating} className={buttonStyle}>
                    <Database size={18} /> {creating ? 'Creando...' : 'Crear Respaldo'}
                </button>
            </div>

            {status.message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <p className="font-medium">{status.message}</p>
                </div>
            )}

            <div className="space-y-8">
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
        </div>
    );
};

export default AdminBackups;
