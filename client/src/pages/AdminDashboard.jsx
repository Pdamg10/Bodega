import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { Users, UserPlus, Shield, Database, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const res = await axios.get('/api/backups');
      setBackups(res.data);
    } catch (error) {
      console.error('Error al obtener respaldos:', error);
    }
    setLoadingBackups(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/register', {
        username,
        password,
        role,
      });
      setMessage('Usuario creado correctamente');
      setUsername('');
      setPassword('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleCreateBackup = async () => {
    try {
      await axios.post('/api/backups');
      toast.success('Respaldo creado correctamente');
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear respaldo');
    }
  };

  const handleDownloadBackup = (filename) => {
    window.open(`${API_URL}/api/backups/download/${filename}`, '_blank');
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm('⚠️ ATENCIÓN: Esto reemplazará la base de datos actual. ¿Estás seguro?')) {
      return;
    }

    if (!window.confirm('Esta acción no se puede deshacer. Se creará un respaldo de seguridad. ¿Continuar?')) {
      return;
    }

    try {
      await axios.post(`/api/backups/restore/${filename}`);
      toast.success('✅ Base de datos restaurada correctamente. Recargando página...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al restaurar respaldo');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 bytes';
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-textMain">Panel de administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border borderSoft">
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
            <UserPlus size={24} className="text-accent" />
            Crear nuevo usuario
          </h2>

          {message && (
            <div className={`p-4 rounded-lg mb-4 ${message.includes('correctamente') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              Crear usuario
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border borderSoft">
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Shield size={24} className="text-accent" />
            Estado del sistema
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Base de datos</span>
              <span className="text-secondary font-bold">Conectada</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Servicio de respaldos</span>
              <span className="text-secondary font-bold">Activo</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total de respaldos</span>
              <span className="text-gray-800 font-mono">{backups.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border borderSoft">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <Database size={24} className="text-accent" />
            Respaldos de base de datos
          </h2>
          <div className="flex gap-2">
            <button
              onClick={fetchBackups}
              className="px-4 py-2 bg-secondary text-white rounded-lg flex items-center gap-2 transition-colors hover:bg-secondary/90"
            >
              <RefreshCw size={18} />
              Actualizar
            </button>
            <button
              onClick={handleCreateBackup}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent flex items-center gap-2 transition-colors"
            >
              <Database size={18} />
              Crear respaldo
            </button>
          </div>
        </div>

        <div className="overflow-hidden border borderSoft rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-600">Archivo</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Tamaño</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Creado</th>
                <th className="px-6 py-3 font-semibold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingBackups ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center">Cargando respaldos...</td></tr>
              ) : backups.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No hay respaldos. Crea el primero con el botón superior.</td></tr>
              ) : (
                backups.map((backup, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm text-gray-700">{backup.filename}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatBytes(backup.size)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(backup.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDownloadBackup(backup.filename)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Descargar"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleRestoreBackup(backup.filename)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Restaurar (PELIGRO)"
                        >
                          <AlertTriangle size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
