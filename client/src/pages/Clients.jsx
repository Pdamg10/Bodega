import React from 'react';
import { Users } from 'lucide-react';

const Clients = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Clientes</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <Users size={48} className="mx-auto mb-4 opacity-20" />
        <p>Gestión de clientes y deudas aquí</p>
      </div>
    </div>
  );
};

export default Clients;
