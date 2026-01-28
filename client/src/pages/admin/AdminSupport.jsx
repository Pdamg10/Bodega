import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import { MessageSquare } from 'lucide-react';

const AdminSupport = () => {
    const [msgs, setMsgs] = useState([]);

    useEffect(() => {
        api.get('/support/messages')
            .then(res => setMsgs(res.data || []))
            .catch(() => { });
    }, []);

    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <MessageSquare className="text-blue-600" size={32} /> Bandeja de Soporte
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Gestiona las consultas y tickets de suscriptores.</p>
            </div>

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

export default AdminSupport;
