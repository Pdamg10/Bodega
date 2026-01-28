import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit, Users, Check, X, Trash2 } from 'lucide-react';
import api from '../../config/api';

const AdminBilling = () => {
    const [plans, setPlans] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        currency: 'USD',
        features: ['', '', '', ''],
        status: 'active'
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [plansRes, usersRes] = await Promise.all([
                api.get('/plans'),
                api.get('/users')
            ]);
            setPlans(plansRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, price: Number(formData.price) };
            if (editingId) {
                await api.put(`/plans/${editingId}`, payload);
            } else {
                await api.post('/plans', payload);
            }
            fetchData();
            setShowModal(false);
            resetForm();
        } catch (error) {
            alert('Error al guardar plan');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este plan?')) {
            try {
                await api.delete(`/plans/${id}`);
                fetchData();
            } catch (error) {
                alert('Error al eliminar');
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', price: '', currency: 'USD', features: ['', '', '', ''], status: 'active' });
        setEditingId(null);
    };

    const handleEdit = (plan) => {
        setFormData({
            ...plan,
            features: plan.features.length < 4 ? [...plan.features, '', '', ''].slice(0, 4) : plan.features
        });
        setEditingId(plan.id);
        setShowModal(true);
    };

    // Calculate subscribers per plan (Mock logic: Assuming users have a 'planId' or we just distribute them for demo)
    // Since users don't strictly have planId in the previous mock, let's just count all active users for 'Profesional' for demo purposes
    // or better, let's match by plan name if user has 'plan' field? 
    // Actually, let's just show '0' if no real link, or fake it for UI demo.
    // Real logic: const baseCount = users.filter(u => u.planId === plan.id).length

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <CreditCard className="text-primary" size={32} /> Gestión de Planes
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Crea y administra los planes de suscripción para tus usuarios.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2.5 bg-primary hover:brightness-90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                >
                    <Plus size={20} /> Crear Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {plans.map(plan => (
                    <div key={plan.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wide">{plan.name}</h3>
                                <p className="text-3xl font-bold text-primary mt-2">${plan.price} <span className="text-sm font-normal text-slate-400">/mes</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(plan)} className="p-2 text-slate-400 hover:text-primary bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-colors">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => handleDelete(plan.id)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 dark:bg-slate-700/50 rounded-lg transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            {plan.features.map((feat, i) => (
                                feat && (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <Check size={16} className="text-green-500 shrink-0" />
                                        <span>{feat}</span>
                                    </div>
                                )
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                                <Users size={16} />
                                <span className="text-sm font-medium">{users.filter(u => u.planId === plan.id).length} Suscriptores</span>
                            </div>
                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${plan.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-slate-100 text-slate-500'}`}>
                                {plan.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Subscribers Table (Demo) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Suscriptores Recientes</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuario</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Plan</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha Inicio</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{user.username}</td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                        {plans.find(p => p.id === user.planId)?.name || 'Sin Plan'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.isActive ? 'Activo' : 'Suspendido'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(user.startDate).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">{editingId ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Plan</label>
                                <input type="text" required className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio</label>
                                    <input type="number" required className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Moneda</label>
                                    <select className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white"
                                        value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Características (Top 4)</label>
                                {formData.features.map((feat, i) => (
                                    <input key={i} type="text" placeholder={`Característica ${i + 1}`} className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white mb-2"
                                        value={feat} onChange={e => {
                                            const newFeats = [...formData.features];
                                            newFeats[i] = e.target.value;
                                            setFormData({ ...formData, features: newFeats });
                                        }} />
                                ))}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:brightness-90 font-bold">Guardar Plan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBilling;
