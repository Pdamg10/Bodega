import React, { useEffect, useMemo, useState } from 'react';
import { Package, Plus, Search, Edit, Trash2, Save, UploadCloud, FileSpreadsheet, Image as ImageIcon, X } from 'lucide-react';
import api from '../config/api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    expirationDate: '',
    photoData: null,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = products.filter(p =>
      (!categoryFilter || (p.category || '') === categoryFilter)
    );
    if (!q) return base;
    return base.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }, [products, search, categoryFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (e) {
      setMessage('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openNew = () => {
    setForm({
      id: null,
      name: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      expirationDate: '',
      photoData: null,
    });
    setShowForm(true);
  };
  const openEdit = (p) => {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category || '',
      price: p.price,
      cost: p.cost ?? '',
      stock: p.stock,
      minStock: p.minStock ?? '',
      expirationDate: p.expirationDate || '',
      photoData: p.photoData || null,
    });
    setShowForm(true);
  };
  const closeForm = () => {
    setShowForm(false);
    setForm(prev => ({ ...prev, photoData: prev.photoData })); // keep state
  };
  const onFilePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, photoData: reader.result }));
    };
    reader.readAsDataURL(file);
  };
  const submitForm = async (e) => {
    e.preventDefault();
    setMessage('');
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      cost: Number(form.cost || 0),
      stock: Number(form.stock || 0),
      minStock: Number(form.minStock || 0),
      expirationDate: form.expirationDate || '',
      photoData: form.photoData || null,
    };
    try {
      if (form.id) {
        const res = await api.put(`/products/${form.id}`, payload);
        setProducts(prev => prev.map(p => p.id === form.id ? res.data : p));
        setMessage('Producto actualizado');
      } else {
        const res = await api.post('/products', payload);
        setProducts(prev => [res.data, ...prev]);
        setMessage('Producto creado');
      }
      setShowForm(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error guardando producto';
      setMessage(msg);
    }
  };

  const deleteProduct = async (p) => {
    if (!confirm('¿Eliminar producto?')) return;
    try {
      await api.delete(`/products/${p.id}`);
      setProducts(prev => prev.filter(x => x.id !== p.id));
      setMessage('Producto eliminado');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error eliminando producto';
      setMessage(msg);
    }
  };

  const exportCSV = async () => {
    try {
      const res = await api.get('/products/export', { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'productos.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage('Error exportando productos');
    }
  };

  const importCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const text = reader.result.toString();
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        const header = lines.shift();
        const cols = header.split(',').map(c => c.replace(/^"+|"+$/g,''));
        const idx = Object.fromEntries(cols.map((c,i)=>[c,i]));
        const items = lines.map(l => {
          // naive CSV parsing; supports quoted values without embedded commas
          const parts = l.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const val = (k) => {
            const raw = parts[idx[k]] ?? '';
            return raw.replace(/^"+|"+$/g,'');
          };
          return {
            name: val('name'),
            category: val('category'),
            price: Number(val('price') || 0),
            cost: Number(val('cost') || 0),
            stock: Number(val('stock') || 0),
            minStock: Number(val('minStock') || 0),
            expirationDate: val('expirationDate') || '',
          };
        });
        const res = await api.post('/products/import', { products: items });
        setProducts(prev => [...res.data.created, ...prev]);
        setMessage(`Importados ${res.data.created.length} productos`);
        e.target.value = '';
      } catch {
        setMessage('Error importando CSV');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Inventario</h1>
        <div className="flex items-center gap-2">
          <button onClick={openNew} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={20} /> Nuevo Producto
          </button>
          <label className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer">
            <UploadCloud size={18} /> Importar Excel (CSV)
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={importCSV} />
          </label>
          <button onClick={exportCSV} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FileSpreadsheet size={18} /> Exportar Excel
          </button>
        </div>
      </div>

      {message && <div className="mb-4 text-sm text-slate-700 dark:text-slate-200">{message}</div>}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search size={18} className="text-slate-500" />
          <input
            placeholder="Buscar por nombre o categoría"
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
            value={categoryFilter}
            onChange={(e)=>setCategoryFilter(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 dark:text-slate-300">
                <th className="px-3 py-2">Foto</th>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Categoría</th>
                <th className="px-3 py-2">Precio</th>
                <th className="px-3 py-2">Costo</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Caducidad</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-3 py-2">
                    {p.photoData ? (
                      <img src={p.photoData} alt={p.name} className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <ImageIcon className="text-slate-400" size={24} />
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{p.name}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{p.category || '-'}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">${p.price?.toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">${(p.cost ?? 0).toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{p.stock}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{p.expirationDate || '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1 rounded"
                      >
                        <Edit size={14} /> Editar
                      </button>
                      <button
                        onClick={() => deleteProduct(p)}
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
          <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{form.id ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={closeForm} className="text-slate-600 dark:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitForm} className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Categoría</label>
                  <input
                    value={form.category}
                    onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.cost}
                    onChange={(e) => setForm(f => ({ ...f, cost: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm(f => ({ ...f, stock: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Stock mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minStock}
                    onChange={(e) => setForm(f => ({ ...f, minStock: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Caducidad</label>
                  <input
                    type="date"
                    value={form.expirationDate}
                    onChange={(e) => setForm(f => ({ ...f, expirationDate: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Foto del producto</label>
                <input type="file" accept="image/*" onChange={onFilePhoto} />
                {form.photoData && (
                  <img src={form.photoData} alt="preview" className="mt-2 w-20 h-20 object-cover rounded" />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white">
                  Cancelar
                </button>
                <button type="submit" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md">
                  <Save size={16} /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
