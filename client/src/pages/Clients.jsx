import React, { useEffect, useMemo, useState } from 'react';
import { Users, Plus, Edit, Trash2, Save, Search, X } from 'lucide-react';
import api from '../config/api';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    firstName: '',
    lastName: '',
    cedula: '',
    phone: '',
    debtEnabled: false,
    parts: '',
    installmentAmount: '',
    frequency: '',
    orderEnabled: false,
    product: '',
    payInAdvance: false,
    advanceAmount: '',
    notes: '',
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.cedula || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  }, [clients, search]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customers');
      setClients(res.data);
    } catch {
      setMessage('Error cargando clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openNew = () => {
    setForm({
      id: null,
      firstName: '',
      lastName: '',
      cedula: '',
      phone: '',
      debtEnabled: false,
      parts: '',
      installmentAmount: '',
      frequency: '',
      orderEnabled: false,
      product: '',
      payInAdvance: false,
      advanceAmount: '',
      notes: '',
    });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setForm({
      id: c.id,
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      cedula: c.cedula || '',
      phone: c.phone || '',
      debtEnabled: !!c.debt?.enabled,
      parts: c.debt?.parts ?? '',
      installmentAmount: c.debt?.installmentAmount ?? '',
      frequency: c.debt?.frequency ?? '',
      orderEnabled: !!c.specialOrder?.enabled,
      product: c.specialOrder?.product ?? '',
      payInAdvance: !!c.specialOrder?.payInAdvance,
      advanceAmount: c.specialOrder?.advanceAmount ?? '',
      notes: c.specialOrder?.notes ?? '',
    });
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);

  const submitForm = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit
    setMessage('');
    setLoading(true); // Start loading
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      cedula: form.cedula,
      phone: form.phone,
      debt: {
        enabled: form.debtEnabled,
        parts: Number(form.parts || 0),
        installmentAmount: Number(form.installmentAmount || 0),
        frequency: form.debtEnabled ? form.frequency || null : null,
      },
      specialOrder: {
        enabled: form.orderEnabled,
        product: form.orderEnabled ? form.product || '' : '',
        payInAdvance: form.orderEnabled ? !!form.payInAdvance : false,
        advanceAmount: form.orderEnabled ? Number(form.advanceAmount || 0) : 0,
        notes: form.orderEnabled ? form.notes || '' : '',
      }
    };
    try {
      if (form.id) {
        const res = await api.put(`/customers/${form.id}`, payload);
        setClients(prev => prev.map(c => c.id === form.id ? res.data : c));
        setMessage('Cliente actualizado');
      } else {
        const res = await api.post('/customers', payload);
        setClients(prev => [res.data, ...prev]);
        setMessage('Cliente creado');
      }
      setShowForm(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error guardando cliente';
      setMessage(msg);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const deleteClient = async (c) => {
    if (!confirm('¿Eliminar cliente?')) return;
    try {
      await api.delete(`/customers/${c.id}`);
      setClients(prev => prev.filter(x => x.id !== c.id));
      setMessage('Cliente eliminado');
    } catch {
      setMessage('Error eliminando cliente');
    }
  };

  return (
    <div className="p-8 lg:pt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Clientes</h1>
        <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Nuevo Cliente
        </button>
      </div>

      {message && <div className="mb-4 text-sm text-slate-700 dark:text-slate-200">{message}</div>}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search size={18} className="text-slate-500" />
          <input
            placeholder="Buscar por nombre, cédula o teléfono"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 dark:text-slate-300">
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Cédula</th>
                <th className="px-3 py-2">Teléfono</th>
                <th className="px-3 py-2">Deuda</th>
                <th className="px-3 py-2">Encargo</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{c.firstName} {c.lastName}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{c.cedula || '-'}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{c.phone || '-'}</td>
                  <td className="px-3 py-2">
                    {c.debt?.enabled && c.debt.parts > 0 ? (
                      <span className="text-slate-700 dark:text-slate-200">
                        {c.debt.parts} cuotas de ${Number(c.debt.installmentAmount || 0).toFixed(2)} — {c.debt.frequency}
                      </span>
                    ) : (
                      <span className="text-slate-500">Sin deuda</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {c.specialOrder?.enabled ? (
                      <span className="text-slate-700 dark:text-slate-200">
                        {c.specialOrder.product} — {c.specialOrder.payInAdvance ? `Anticipo $${Number(c.specialOrder.advanceAmount || 0).toFixed(2)}` : 'Pago al llegar'}
                      </span>
                    ) : (
                      <span className="text-slate-500">Sin encargo</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1 rounded"
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button
                        onClick={() => deleteClient(c)}
                        className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{form.id ? 'Editar cliente' : 'Nuevo cliente'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-600 dark:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Nombre</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Apellido</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Cédula</label>
                  <input
                    value={form.cedula}
                    onChange={(e) => setForm(f => ({ ...f, cedula: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Teléfono</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-700 dark:text-slate-200">Deuda</div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.debtEnabled}
                      onChange={(e) => setForm(f => ({ ...f, debtEnabled: e.target.checked }))}
                    />
                    Activo
                  </label>
                </div>
                {form.debtEnabled && (
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Partes</label>
                      <input
                        type="number"
                        min="1"
                        value={form.parts}
                        onChange={(e) => setForm(f => ({ ...f, parts: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Monto por parte</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.installmentAmount}
                        onChange={(e) => setForm(f => ({ ...f, installmentAmount: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Frecuencia</label>
                      <select
                        value={form.frequency}
                        onChange={(e) => setForm(f => ({ ...f, frequency: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                      >
                        <option value="">Selecciona</option>
                        <option value="semanal">Semanal</option>
                        <option value="quincenal">Quincenal</option>
                        <option value="mensual">Mensual</option>
                      </select>
                    </div>
                    <div className="col-span-4 text-xs text-slate-600 dark:text-slate-300">
                      Total estimado: ${((Number(form.parts || 0) * Number(form.installmentAmount || 0)) || 0).toFixed(2)}
                    </div>
                    <div className="col-span-4">
                      <DebtSchedulePreview parts={Number(form.parts || 0)} frequency={form.frequency} baseDate={new Date()} />
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-700 dark:text-slate-200">Encargo</div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.orderEnabled}
                      onChange={(e) => setForm(f => ({ ...f, orderEnabled: e.target.checked }))}
                    />
                    Activo
                  </label>
                </div>
                {form.orderEnabled && (
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Producto solicitado</label>
                      <input
                        value={form.product}
                        onChange={(e) => setForm(f => ({ ...f, product: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Pago por adelantado</label>
                      <select
                        value={form.payInAdvance ? 'si' : 'no'}
                        onChange={(e) => setForm(f => ({ ...f, payInAdvance: e.target.value === 'si' }))}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                      >
                        <option value="no">No</option>
                        <option value="si">Sí</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Anticipo</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.advanceAmount}
                        onChange={(e) => setForm(f => ({ ...f, advanceAmount: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Notas</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  <Save size={16} /> {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;

function DebtSchedulePreview({ parts, frequency, baseDate }) {
  if (!parts || !frequency) return <div className="text-xs text-slate-500">Configura partes y frecuencia para ver vencimientos</div>;
  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };
  const addMonths = (d, n) => {
    const x = new Date(d);
    x.setMonth(x.getMonth() + n);
    return x;
  };
  const dueDates = [];
  for (let i = 1; i <= Math.min(parts, 6); i++) {
    let date;
    if (frequency === 'semanal') date = addDays(baseDate, 7 * i);
    else if (frequency === 'quincenal') date = addDays(baseDate, 14 * i);
    else date = addMonths(baseDate, i);
    dueDates.push(date.toLocaleDateString());
  }
  return (
    <div className="text-xs text-slate-600 dark:text-slate-300">
      Próximos vencimientos: {dueDates.join(' · ')}
    </div>
  );
}
