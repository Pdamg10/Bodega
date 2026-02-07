import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, PlusCircle, Trash2, Edit2, Save } from 'lucide-react';
import api from '../config/api';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [singleSale, setSingleSale] = useState({ productId: '', quantity: 1 });
  const [batchItems, setBatchItems] = useState([{ productId: '', quantity: 1 }]);

  const productById = useMemo(
    () => Object.fromEntries(products.map(p => [p.id, p])),
    [products]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, mRes] = await Promise.all([
        api.get('/products'),
        api.get('/movements'),
      ]);
      setProducts(pRes.data);
      setMovements(mRes.data);
    } catch (e) {
      setMessage('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage('');
    setLoading(true);
    try {
      const payload = { productId: Number(singleSale.productId), quantity: Number(singleSale.quantity) };
      const res = await api.post('/sales/single', payload);
      setMovements(prev => [res.data.movement, ...prev]);
      setProducts(prev => prev.map(p => p.id === res.data.product.id ? res.data.product : p));
      setSingleSale({ productId: '', quantity: 1 });
      setMessage('Venta registrada');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error registrando venta';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setMessage('');
    setLoading(true);
    try {
      const validItems = batchItems
        .filter(i => i.productId && i.quantity > 0)
        .map(i => ({ productId: Number(i.productId), quantity: Number(i.quantity) }));
      if (validItems.length === 0) {
        setMessage('Agrega al menos un item válido');
        return;
      }
      const res = await api.post('/sales/batch', { items: validItems });
      // update products by refetch to keep stocks accurate
      await fetchData();
      setBatchItems([{ productId: '', quantity: 1 }]);
      setMessage(`Ventas registradas: ${res.data.movements.length}`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error registrando ventas múltiples';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const addBatchRow = () => {
    setBatchItems(prev => [...prev, { productId: '', quantity: 1 }]);
  };
  const removeBatchRow = (idx) => {
    setBatchItems(prev => prev.filter((_, i) => i !== idx));
  };
  const updateBatchRow = (idx, patch) => {
    setBatchItems(prev => prev.map((row, i) => i === idx ? { ...row, ...patch } : row));
  };

  const [editingId, setEditingId] = useState(null);
  const [editingQty, setEditingQty] = useState(1);
  const startEdit = (mv) => {
    setEditingId(mv.id);
    setEditingQty(mv.quantity);
  };
  const saveEdit = async (mv) => {
    try {
      const res = await api.put(`/movements/${mv.id}`, { quantity: Number(editingQty) });
      setMovements(prev => prev.map(m => m.id === mv.id ? res.data.movement : m));
      // update related product stock
      setProducts(prev => prev.map(p => p.id === res.data.product.id ? res.data.product : p));
      setEditingId(null);
      setMessage('Movimiento actualizado');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error actualizando movimiento';
      setMessage(msg);
    }
  };
  const deleteMovement = async (mv) => {
    try {
      const res = await api.delete(`/movements/${mv.id}`);
      setMovements(prev => prev.filter(m => m.id !== mv.id));
      // update product after revert
      const updated = res.data.product;
      if (updated) {
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      }
      setMessage('Movimiento eliminado');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error eliminando movimiento';
      setMessage(msg);
    }
  };

  return (
    <div className="p-8 lg:pt-20">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">Punto de Venta</h1>

      {message && (
        <div className="mb-4 text-sm text-slate-700 dark:text-slate-200">{message}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={20} className="text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Venta individual</h2>
          </div>
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Producto</label>
              <select
                value={singleSale.productId}
                onChange={(e) => setSingleSale(s => ({ ...s, productId: e.target.value }))}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
              >
                <option value="">Selecciona un producto</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Stock: {p.stock}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Cantidad</label>
              <input
                type="number"
                min={1}
                value={singleSale.quantity}
                onChange={(e) => setSingleSale(s => ({ ...s, quantity: e.target.value }))}
                className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
              />
              {singleSale.productId && productById[singleSale.productId] && (
                <p className="mt-1 text-xs text-slate-500">
                  Disponible: {productById[singleSale.productId].stock}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              disabled={loading}
            >
              Registrar venta
            </button>
          </form>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 p-6">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle size={20} className="text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Ventas múltiples</h2>
          </div>
          <form onSubmit={handleBatchSubmit} className="space-y-4">
            {batchItems.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-7">
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Producto</label>
                  <select
                    value={row.productId}
                    onChange={(e) => updateBatchRow(idx, { productId: e.target.value })}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  >
                    <option value="">Selecciona</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — Stock: {p.stock}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) => updateBatchRow(idx, { quantity: e.target.value })}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  />
                </div>
                <div className="col-span-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => removeBatchRow(idx)}
                    className="inline-flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md"
                    title="Eliminar fila"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addBatchRow}
                className="inline-flex items-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-md"
              >
                Agregar fila
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
              >
                Registrar ventas
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Movimientos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600 dark:text-slate-300">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(mv => (
                  <tr key={mv.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{mv.id}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-white ${mv.type === 'OUT' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {mv.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{mv.productName}</td>
                    <td className="px-3 py-2">
                      {editingId === mv.id ? (
                        <input
                          type="number"
                          min={1}
                          value={editingQty}
                          onChange={(e) => setEditingQty(e.target.value)}
                          className="w-24 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1 text-slate-800 dark:text-white"
                        />
                      ) : (
                        <span className="text-slate-700 dark:text-slate-200">{mv.quantity}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{new Date(mv.date).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {editingId === mv.id ? (
                          <button
                            onClick={() => saveEdit(mv)}
                            className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                          >
                            <Save size={14} /> Guardar
                          </button>
                        ) : (
                          <button
                            onClick={() => startEdit(mv)}
                            className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1 rounded"
                          >
                            <Edit2 size={14} /> Editar
                          </button>
                        )}
                        <button
                          onClick={() => deleteMovement(mv)}
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
      </div>
    </div>
  );
};

export default Sales;
