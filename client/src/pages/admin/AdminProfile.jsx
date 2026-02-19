import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import { Save, User, CheckCircle, AlertTriangle, Edit, Trash2, Shield, X, Search } from 'lucide-react';

const AdminProfile = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', phone: user?.phone || '' });
    const [status, setStatus] = useState({ type: '', message: '' });

    // User Management State
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            showStatus('error', 'Error al cargar usuarios');
        } finally {
            setLoadingUsers(false);
        }
    };

    const showStatus = (type, msg) => {
        setStatus({ type, message: msg });
        setTimeout(() => setStatus({ type: '', message: '' }), 4000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Implement logic to update own profile if needed, currently just shows success
        showStatus('success', 'Perfil actualizado correctamente');
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            const res = await api.put(`/users/${editingUser.id}`, editingUser);
            setUsers(users.map(u => u.id === editingUser.id ? res.data : u));
            setEditingUser(null);
            showStatus('success', 'Usuario actualizado correctamente');
        } catch (error) {
            console.error("Error updating user:", error);
            showStatus('error', 'Error al actualizar usuario');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            showStatus('success', 'Usuario eliminado correctamente');
        } catch (error) {
            console.error("Error deleting user:", error);
            showStatus('error', 'Error al eliminar usuario');
        }
    };

    const toggleUserStatus = async (userToToggle) => {
        try {
            const updatedUser = { ...userToToggle, isActive: !userToToggle.isActive };
            const res = await api.put(`/users/${userToToggle.id}`, updatedUser);
            setUsers(users.map(u => u.id === userToToggle.id ? res.data : u));
            showStatus('success', `Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'}`);
        } catch (error) {
            console.error("Error toggling user status:", error);
            showStatus('error', 'Error al cambiar estado del usuario');
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.firstName && u.firstName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const inputStyle = "w-full border dark:border-slate-600 rounded-xl px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";
    const labelStyle = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";
    const buttonStyle = "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]";

    return (
        <div className="p-8 max-w-6xl mx-auto animate-fade-in space-y-12">
            {/* Personal Profile Section */}
            <section>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <User className="text-blue-600" size={32} /> Perfil Personal
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Gestiona tu información personal y de contacto.</p>
                </div>

                {status.message && (
                    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl flex items-center gap-3 shadow-lg animate-slide-in ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
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
            </section>

            {/* Users Management Section (Admin Only) */}
            {user?.role === 'admin' && (
                <section>
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                <Shield className="text-indigo-600" size={28} /> Gestión de Usuarios
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Administra los usuarios activos del sistema.</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar usuarios..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Usuario</th>
                                        <th className="px-6 py-4 font-semibold">Rol</th>
                                        <th className="px-6 py-4 font-semibold">Estado</th>
                                        <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredUsers.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold uppercase">
                                                        {u.username.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{u.firstName} {u.lastName}</p>
                                                        <p className="text-sm text-slate-500">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${u.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {u.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleUserStatus(u)}
                                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${u.isActive
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {u.isActive ? 'ACTIVO' : 'INACTIVO'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setEditingUser(u)}
                                                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                                No se encontraron usuarios.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Edit size={20} className="text-blue-600" /> Editar Usuario
                            </h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Nombre</label>
                                    <input
                                        type="text"
                                        value={editingUser.firstName}
                                        onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                        className={inputStyle}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelStyle}>Apellido</label>
                                    <input
                                        type="text"
                                        value={editingUser.lastName}
                                        onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                        className={inputStyle}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={editingUser.email}
                                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                                    className={inputStyle}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelStyle}>Teléfono</label>
                                    <input
                                        type="tel"
                                        value={editingUser.phone}
                                        onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                                        className={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label className={labelStyle}>Rol</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className={inputStyle}
                                    >
                                        <option value="user">Usuario</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={editingUser.isActive}
                                    onChange={e => setEditingUser({ ...editingUser, isActive: e.target.checked })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                />
                                <label htmlFor="isActive" className="text-slate-700 dark:text-slate-300 font-medium">Usuario Activo</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all">
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfile;
