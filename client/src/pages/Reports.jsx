import React from 'react';
import { BarChart3 } from 'lucide-react';

const Reports = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Reportes</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
        <BarChart3 size={48} className="mx-auto mb-4 opacity-20" />
        <p>Gráficas y estadísticas aquí</p>
      </div>
    </div>
  );
};

export default Reports;
