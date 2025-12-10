import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      const res = await axios.get('http://localhost:3001/api/backups');
      setBackups(res.data);
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
    setLoadingBackups(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/auth/register', {
        username,
        password,
        role,
      });
      setMessage('User created successfully');
      setUsername('');
      setPassword('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating user');
    }
  };

  const handleCreateBackup = async () => {
    try {
      await axios.post('http://localhost:3001/api/backups');
      toast.success('Backup created successfully');
      fetchBackups();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating backup');
    }
  };

  const handleDownloadBackup = (filename) => {
    window.open(`http://localhost:3001/api/backups/download/${filename}`, '_blank');
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm('⚠️ WARNING: This will replace your current database. Are you absolutely sure?')) {
      return;
    }

    if (!window.confirm('This action cannot be undone. A safety backup will be created. Continue?')) {
      return;
    }

    try {
      await axios.post(`http://localhost:3001/api/backups/restore/${filename}`);
      toast.success('✅ Database restored successfully. Refreshing page...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error restoring backup');
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create User Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
            <UserPlus size={24} className="text-accent" />
            Create New User
          </h2>

          {message && (
            <div className={`p-4 rounded-lg mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition-colors"
            >
              Create User
            </button>
          </form>
        </div>

        {/* System Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Shield size={24} className="text-accent" />
            System Status
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Database Status</span>
              <span className="text-green-600 font-bold">Connected</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Backup Service</span>
              <span className="text-green-600 font-bold">Active</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Backups</span>
              <span className="text-gray-800 font-mono">{backups.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Management Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <Database size={24} className="text-accent" />
            Database Backups
          </h2>
          <div className="flex gap-2">
            <button
              onClick={fetchBackups}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              onClick={handleCreateBackup}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-colors"
            >
              <Database size={18} />
              Create Backup
            </button>
          </div>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-600">Filename</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Size</th>
                <th className="px-6 py-3 font-semibold text-gray-600">Created</th>
                <th className="px-6 py-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingBackups ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center">Loading backups...</td></tr>
              ) : backups.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No backups found. Create your first backup above.</td></tr>
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
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleRestoreBackup(backup.filename)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Restore (WARNING)"
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
