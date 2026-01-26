import React from 'react';
import { ShoppingCart } from 'lucide-react';

const Sales = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Punto de Venta</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
        <p>Sistema de ventas aquí</p>
      </div>
    </div>
  );
};

export default Sales;
