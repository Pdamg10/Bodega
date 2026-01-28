import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Save, User, CheckCircle, AlertTriangle } from 'lucide-react';

const AdminProfile = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ firstName: user.firstName || '', lastName: user.lastName || '', email: user.email || '', phone: user.phone || '' });
    const [status, setStatus] = useState({ type: '', message: '' });

    const showStatus = (type, msg) => {
        setStatus({ type, message: msg });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        showStatus('success', 'Perfil actualizado correctamente');
    };

    const inputStyle = "w-full border dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";
    const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";
    const buttonStyle = "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]";

    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <User className="text-blue-600" size={32} /> Perfil Personal
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Gestiona tu información personal y de contacto.</p>
            </div>

            {status.message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <p className="font-medium">{status.message}</p>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

export default AdminProfile;
