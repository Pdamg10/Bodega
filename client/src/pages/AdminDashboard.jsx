import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { Users, UserPlus, Search, Edit, Trash2, Save, X, AlertTriangle, Bell } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { darkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    firstName: '',
    lastName: '',
    cedula: '',
    phone: '',
    email: '',
    paymentMethod: 'Efectivo',
    paymentAmount: 0,
    startDate: '',
    cutoffDate: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      checkNotifications(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  const checkNotifications = (usersData) => {
    const today = new Date();
    const alerts = [];
    usersData.forEach(user => {
      if (user.cutoffDate) {
        const cutoff = new Date(user.cutoffDate);
        const diffTime = cutoff - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0 && diffDays <= 5) {
          alerts.push({
            id: user.id,
            message: `El usuario ${user.firstName} ${user.lastName} tiene corte en ${diffDays} días.`
          });
        }
      }
    });
    setNotifications(alerts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowModal(false);
      fetchUsers();
      resetForm();
    } catch (error) {
      alert('Error al guardar usuario');
    }
  };

  const handleEdit = (user) => {
    setFormData({
      ...user,
      password: '' // Don't show password, require new one only if changing
    });
    setEditingId(user.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert('Error al eliminar usuario');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'user',
      firstName: '',
      lastName: '',
      cedula: '',
      phone: '',
      email: '',
      paymentMethod: 'Efectivo',
      paymentAmount: 0,
      startDate: '',
      cutoffDate: ''
    });
    setEditingId(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto transition-colors duration-300">
      
      {/* Notifications Area */}
      {notifications.length > 0 && (
        <div className="mb-6 space-y-2">
          {notifications.map((note, index) => (
            <div key={index} className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-xl flex items-center gap-3 text-yellow-800 dark:text-yellow-200 animate-in fade-in slide-in-from-top-4">
              <AlertTriangle className="shrink-0" size={20} />
              <p className="font-medium">{note.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Gestión de Usuarios</h1>
          <p className="text-slate-500 dark:text-slate-400">Administra el acceso y facturación de tus clientes</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold shadow-lg shadow-blue-600/20"
          >
            <UserPlus size={20} />
            <span className="hidden sm:inline">Nuevo Usuario</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Usuario</th>
                <th className="hidden md:table-cell px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Nombre Completo</th>
                <th className="hidden lg:table-cell px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Contacto</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Plan</th>
                <th className="hidden sm:table-cell px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Estado</th>
                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{user.username}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">{user.role}</div>
                    <div className="md:hidden text-xs text-slate-500 mt-1">{user.firstName} {user.lastName}</div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    <div className="text-slate-900 dark:text-white">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user.cedula}</div>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4">
                    <div className="text-sm text-slate-600 dark:text-slate-300">{user.email}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-200">${user.paymentAmount}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Corte: {user.cutoffDate ? new Date(user.cutoffDate).toLocaleDateString() : '-'}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {user.isActive ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(user)} className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Eliminar">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Usuario</label>
                  <input type="text" required className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña {editingId && '(Dejar vacío para mantener)'}</label>
                  <input type="password" required={!editingId} className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                  <input type="text" required className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apellido</label>
                  <input type="text" required className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cédula</label>
                  <input type="text" required className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono</label>
                  <input type="text" className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                   Facturación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto Mensual</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input type="number" className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 pl-7 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={formData.paymentAmount ?? ''} onChange={e => setFormData({...formData, paymentAmount: e.target.value === '' ? '' : Number(e.target.value)})} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de Corte</label>
                    <input type="date" className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                      value={formData.cutoffDate} onChange={e => setFormData({...formData, cutoffDate: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700 mt-6 sticky bottom-0 bg-white dark:bg-slate-800">
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20 transition-colors">
                  {editingId ? 'Actualizar Usuario' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
