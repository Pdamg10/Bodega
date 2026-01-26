import React, { useState, useEffect } from 'react';
import api from '../config/api';
import { Package, AlertTriangle, Clock, ArrowRightLeft, TrendingDown, TrendingUp, Calendar } from 'lucide-react';

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, movementsRes] = await Promise.all([
        api.get('/products'),
        api.get('/movements')
      ]);
      setProducts(productsRes.data);
      setMovements(movementsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const lowStockItems = products.filter(p => p.stock <= p.minStock);
  const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
  
  // Expiring soon (within 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const expiringItems = products.filter(p => {
    if (!p.expirationDate) return false;
    const expDate = new Date(p.expirationDate);
    return expDate >= today && expDate <= thirtyDaysFromNow;
  });

  const lastMovement = movements.length > 0 
    ? movements.sort((a, b) => new Date(b.date) - new Date(a.date))[0] 
    : null;

  if (loading) {
    return <div className="p-8 text-center">Cargando información...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Mi Inventario</h1>
        <p className="text-slate-500 dark:text-slate-400">Resumen general del estado de tus productos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Stock */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Package size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Stock Total</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{totalStock}</p>
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">Unidades disponibles</div>
        </div>

        {/* Low Stock */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <AlertTriangle size={24} />
            </div>
            {lowStockItems.length > 0 && (
              <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-1 rounded-full">
                {lowStockItems.length} Alertas
              </span>
            )}
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Por Agotarse</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{lowStockItems.length}</p>
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">Productos con stock bajo</div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
              <Clock size={24} />
            </div>
            {expiringItems.length > 0 && (
              <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-full">
                {expiringItems.length} Riesgos
              </span>
            )}
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Por Vencer</h3>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{expiringItems.length}</p>
          <div className="mt-2 text-xs text-slate-400 dark:text-slate-500">Próximos 30 días</div>
        </div>

        {/* Last Movement */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <ArrowRightLeft size={24} />
            </div>
          </div>
          <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Último Movimiento</h3>
          <div className="mt-1">
             {lastMovement ? (
                <>
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white text-lg">
                     {lastMovement.type === 'IN' ? <TrendingUp size={18} className="text-green-500" /> : <TrendingDown size={18} className="text-red-500" />}
                     {lastMovement.quantity} u.
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate w-full" title={lastMovement.productName}>
                    {lastMovement.productName}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {new Date(lastMovement.date).toLocaleDateString()}
                  </div>
                </>
             ) : (
               <p className="text-slate-400 text-sm italic">Sin registros</p>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" /> Stock Crítico
            </h2>
            <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">Ver todo</button>
          </div>
          <div className="p-0">
             {lowStockItems.length === 0 ? (
               <div className="p-8 text-center text-slate-400">Todo parece estar en orden</div>
             ) : (
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-900/50">
                   <tr>
                     <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Producto</th>
                     <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400 text-right">Disponible</th>
                     <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400 text-right">Mínimo</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                   {lowStockItems.slice(0, 5).map(item => (
                     <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                       <td className="px-6 py-3 text-slate-800 dark:text-white font-medium">{item.name}</td>
                       <td className="px-6 py-3 text-right text-red-600 dark:text-red-400 font-bold">{item.stock}</td>
                       <td className="px-6 py-3 text-right text-slate-500">{item.minStock}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             )}
          </div>
        </div>

        {/* Expiring Soon List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Calendar size={20} className="text-red-500" /> Próximos Vencimientos
            </h2>
            <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">Ver todo</button>
          </div>
           <div className="p-0">
             {expiringItems.length === 0 ? (
               <div className="p-8 text-center text-slate-400">No hay productos por vencer pronto</div>
             ) : (
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 dark:bg-slate-900/50">
                   <tr>
                     <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Producto</th>
                     <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400">Vence</th>
                     <th className="px-6 py-3 font-semibold text-slate-500 dark:text-slate-400 text-right">Días</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                   {expiringItems.slice(0, 5).map(item => {
                     const daysLeft = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                     return (
                       <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                         <td className="px-6 py-3 text-slate-800 dark:text-white font-medium">{item.name}</td>
                         <td className="px-6 py-3 text-slate-500">{new Date(item.expirationDate).toLocaleDateString()}</td>
                         <td className="px-6 py-3 text-right">
                           <span className={`px-2 py-1 rounded-full text-xs font-bold ${daysLeft <= 10 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                             {daysLeft} días
                           </span>
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
