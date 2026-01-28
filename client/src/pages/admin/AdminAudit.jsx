import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { FileText } from 'lucide-react';

const AdminAudit = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        api.get('/settings/audit')
            .then(res => setLogs(res.data || []))
            .catch(() => { });
    }, []);

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <FileText className="text-blue-600" size={32} /> Registro de Auditoría
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Historial de acciones y eventos del sistema.</p>
            </div>

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
                        {logs.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-slate-500">No hay registros de auditoría.</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAudit;
