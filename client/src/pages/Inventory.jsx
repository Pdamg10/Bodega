import React from 'react';
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react';

const Inventory = () => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Inventario</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <Package size={48} className="mx-auto mb-4 opacity-20" />
        <p>Gestión de productos aquí</p>
      </div>
    </div>
  );
};

export default Inventory;
