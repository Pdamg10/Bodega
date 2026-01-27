import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { Database, RefreshCw, Clock, Trash2, Download, Activity } from 'lucide-react';

const Backup = () => {
  const [backups, setBackups] = useState([]);
  const [logs, setLogs] = useState([]);
  const [schedule, setSchedule] = useState({ enabled: false, frequency: null, nextRun: null });
  const [storage, setStorage] = useState({ usedBytes: 0, capacityBytes: 0 });
  const [creating, setCreating] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchAll = async () => {
    try {
      const [bRes, lRes, sRes, stRes] = await Promise.all([
        api.get('/backups'),
        api.get('/backups/logs'),
        api.get('/backups/schedule'),
        api.get('/backups/storage'),
      ]);
      setBackups(bRes.data || []);
      setLogs(lRes.data || []);
      setSchedule(sRes.data || { enabled: false, frequency: null, nextRun: null });
      setStorage(stRes.data || { usedBytes: 0, capacityBytes: 0 });
    } catch (err) {
      console.error('Error cargando datos de respaldo', err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      await api.post('/backups/create');
      await fetchAll();
    } catch (err) {
      alert('Error al crear respaldo');
    } finally {
      setCreating(false);
    }
  };

  const handleApplySchedule = async (enabled, frequency) => {
    setSavingSchedule(true);
    try {
      const res = await api.post('/backups/schedule', { enabled, frequency });
      setSchedule(res.data);
    } catch (err) {
      alert('Error al guardar programación');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm('¿Restaurar el sistema desde este respaldo? Se sobrescribirá la información actual.')) return;
    try {
      await api.post('/backups/restore', { backupId: id });
      alert('Sistema restaurado correctamente');
      await fetchAll();
    } catch (err) {
      alert('Error al restaurar respaldo');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este respaldo?')) return;
    try {
      await api.delete(`/backups/${id}`);
      await fetchAll();
    } catch (err) {
      alert('Error al eliminar respaldo');
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/backups/download/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${id}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error al descargar respaldo');
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Gestión de Respaldos</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Administra los respaldos y la recuperación de tu sistema
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold shadow-lg shadow-blue-600/20"
          >
            <Database size={20} />
            <span className="hidden sm:inline">{creating ? 'Creando...' : 'Crear Respaldo Completo'}</span>
            <span className="sm:hidden">{creating ? 'Creando...' : 'Respaldar'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Respaldos Disponibles</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona un respaldo para restaurar o descargar</p>
            </div>
            <button
              onClick={fetchAll}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <RefreshCw size={16} /> Actualizar
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Nombre</th>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Fecha</th>
                  <th className="hidden md:table-cell px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400">Tamaño</th>
                  <th className="px-6 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {backups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-6 text-center text-slate-400">
                      No hay respaldos creados aún.
                    </td>
                  </tr>
                )}
                {backups.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-white">{b.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">ID: {b.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700 dark:text-slate-200">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(b.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {formatBytes(b.size)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleRestore(b.id)}
                        className="px-3 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={() => handleDownload(b.id)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Descargar"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
              <Clock size={18} /> Programación Automática
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Configura respaldos automáticos según la frecuencia deseada.
            </p>
            <div className="space-y-3">
              <select
                className="w-full border dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={schedule.enabled ? schedule.frequency || '' : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    handleApplySchedule(false, null);
                  } else {
                    handleApplySchedule(true, value);
                  }
                }}
                disabled={savingSchedule}
              >
                <option value="">Sin programación</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
              {schedule.enabled && schedule.nextRun && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Próximo respaldo: {new Date(schedule.nextRun).toLocaleString()}
                </p>
              )}
            </div>
          </div>


        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Activity size={18} className="text-slate-500 dark:text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Registro de actividad</h2>
        </div>
        <div className="max-h-72 overflow-auto">
          {logs.length === 0 && (
            <div className="px-6 py-6 text-center text-slate-400 text-sm">
              Aún no hay actividad de respaldo registrada.
            </div>
          )}
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {logs.map((log, index) => (
              <li key={index} className="px-6 py-3 flex items-start gap-3">
                <div className="mt-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${log.type === 'CREATE'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : log.type === 'RESTORE'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : log.type === 'DELETE'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300'
                      }`}
                  >
                    {log.type}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-800 dark:text-slate-100">{log.message}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(log.ts).toLocaleString()}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Backup;
