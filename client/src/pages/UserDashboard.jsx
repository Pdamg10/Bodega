import React, { useState, useEffect } from 'react';
import api from '../config/api';
import {
  Package, AlertTriangle, Clock, TrendingUp, TrendingDown,
  DollarSign, ShoppingCart, UserPlus, CreditCard, ChevronRight,
  ClipboardList, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const [data, setData] = useState({
    products: [],
    movements: [],
    customers: [],
    orders: [],
    history: [],
    activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prod, mov, cust, ord, hist, act] = await Promise.all([
        api.get('/products'),
        api.get('/movements'),
        api.get('/customers'),
        api.get('/orders'),
        api.get('/sales/history'),
        api.get('/activity')
      ]);
      setData({
        products: prod.data,
        movements: mov.data,
        customers: cust.data,
        orders: ord.data,
        history: hist.data,
        activity: act.data
      });
    } catch (error) {
      console.error('Error dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  // KPIs
  const totalSalesToday = 120.50; // Mock calculation or from history
  const pendingPayments = data.customers.reduce((acc, c) => acc + (c.debt?.currentDebt || 0), 0);
  const debtClients = data.customers.filter(c => c.debt?.currentDebt > 0).length;

  // Smart Alerts
  const lowStock = data.products.filter(p => p.stock <= p.minStock);
  const criticalStock = data.products.filter(p => p.stock === 0);
  const pendingOrders = data.orders.filter(o => o.status === 'pending');
  const overdueClients = data.customers.filter(c => c.debt?.daysOverdue > 7);

  // Quick Chart (CSS Bar Chart)
  const maxSales = Math.max(...data.history.map(h => h.sales), 1);

  if (loading) return <div className="p-8 text-center animate-pulse">Cargando panel de control...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">

      {/* Header & Actions */}
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-6 -mx-4 md:-mx-8 rounded-b-3xl mb-8 shadow-sm border-b border-white/20 dark:border-slate-700/50">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Panel de Control</h1>
          <p className="text-slate-500 dark:text-slate-300">Resumen operativo de tu negocio</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/user/sales" className="px-4 py-2 bg-primary text-white rounded-lg hover:brightness-90 font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all">
            <DollarSign size={18} /> Nueva Venta
          </Link>
          <Link to="/user/inventory" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-medium flex items-center gap-2 transition-all shadow-sm">
            <Package size={18} /> Producto
          </Link>
          <Link to="/user/clients" className="px-4 py-2 bg-white/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 font-medium flex items-center gap-2 transition-all shadow-sm">
            <UserPlus size={18} /> Cliente
          </Link>
        </div>
      </div>

      {/* 1. KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity">
            <DollarSign size={48} className="text-green-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Ventas del Día</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">${totalSalesToday}</h3>
          <p className="text-xs text-green-500 flex items-center gap-1 mt-2">
            <TrendingUp size={14} /> +12% vs ayer
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity">
            <Package size={48} className="text-blue-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Top Producto</p>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1 truncate">Arroz 1kg</h3>
          <p className="text-xs text-slate-400 mt-2">45 unidades vendidas</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity">
            <CreditCard size={48} className="text-orange-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Por Cobrar</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">${pendingPayments}</h3>
          <p className="text-xs text-orange-500 flex items-center gap-1 mt-2">
            {debtClients} clientes con deuda
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 relative overflow-hidden group hover:shadow-xl transition-all">
          <div className="absolute right-0 top-0 p-4 opacity-30 group-hover:opacity-50 transition-opacity">
            <ClipboardList size={48} className="text-purple-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Encargos</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{pendingOrders.length}</h3>
          <p className="text-xs text-purple-500 flex items-center gap-1 mt-2">
            Ver pendientes
          </p>
        </div>
      </div>

      {/* 2. Smart Alerts Area */}
      {(lowStock.length > 0 || overdueClients.length > 0) && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {criticalStock.map(p => (
            <div key={p.id} className="min-w-[250px] bg-red-50/90 dark:bg-red-900/40 backdrop-blur-sm border border-red-100 dark:border-red-800/50 p-4 rounded-xl flex items-start gap-3 animate-pulse">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-red-700 dark:text-red-300 text-sm">Sin Stock</h4>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">El producto <strong>{p.name}</strong> se ha agotado.</p>
              </div>
            </div>
          ))}
          {overdueClients.map(c => (
            <div key={c.id} className="min-w-[250px] bg-orange-50/90 dark:bg-orange-900/40 backdrop-blur-sm border border-orange-100 dark:border-orange-800/50 p-4 rounded-xl flex items-start gap-3">
              <Clock className="text-orange-500 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-orange-700 dark:text-orange-300 text-sm">Deuda Vencida</h4>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{c.firstName} debe ${c.debt.currentDebt} ({c.debt.daysOverdue} días).</p>
              </div>
            </div>
          ))}
          {lowStock.map(p => (
            <div key={p.id} className="min-w-[250px] bg-amber-50/90 dark:bg-amber-900/40 backdrop-blur-sm border border-amber-100 dark:border-amber-800/50 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={20} />
              <div>
                <h4 className="font-bold text-amber-700 dark:text-amber-300 text-sm">Stock Bajo</h4>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Quedan {p.stock} unidades de {p.name}.</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 3. Sales Chart (Last 7 Days) */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp size={20} /> Ventas (Últimos 7 días)
            </h3>
          </div>

          <div className="h-48 flex items-end gap-3 md:gap-6 justify-between px-2">
            {data.history.map((day, i) => {
              const heightPct = (day.sales / maxSales) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="relative w-full bg-slate-100/50 dark:bg-slate-700/50 rounded-t-lg h-full overflow-hidden flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-primary opacity-80 group-hover:opacity-100 transition-all rounded-t-lg relative"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        ${day.sales}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">{day.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Recent Activity Feed */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={20} /> Actividad Reciente
          </h3>
          <div className="space-y-4">
            {data.activity.slice(0, 5).map((log, i) => (
              <div key={i} className="flex gap-3 items-start pb-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 last:pb-0">
                <div className={`mt-1 p-1.5 rounded-full shrink-0 ${log.type === 'SALE' ? 'bg-green-100 text-green-600' :
                  log.type === 'PAYMENT' ? 'bg-blue-100 text-blue-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                  {log.type === 'SALE' ? <DollarSign size={12} /> :
                    log.type === 'PAYMENT' ? <CreditCard size={12} /> :
                      <AlertTriangle size={12} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{log.message}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex justify-between w-full">
                    <span>{log.user}</span>
                    <span>{new Date(log.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 5. Cuentas por Cobrar */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CreditCard size={20} className="text-primary" /> Cuentas por Cobrar
            </h3>
            <Link to="/user/clients" className="text-xs text-primary font-medium hover:underline">Ver todas</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Monto</th>
                  <th className="px-6 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {data.customers.filter(c => c.debt?.currentDebt > 0).slice(0, 5).map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{c.firstName} {c.lastName}</td>
                    <td className="px-6 py-3 font-bold text-slate-800 dark:text-white">${c.debt.currentDebt}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.debt.daysOverdue > 7 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {c.debt.daysOverdue} días
                      </span>
                    </td>
                  </tr>
                ))}
                {data.customers.filter(c => c.debt?.currentDebt > 0).length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">No hay deudas pendientes</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Encargos Pendientes */}
        <div className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ClipboardList size={20} className="text-purple-500" /> Encargos
            </h3>
            <button className="text-xs text-purple-500 font-medium hover:underline">Gestionar</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Detalle</th>
                  <th className="px-6 py-3 font-medium text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {pendingOrders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-3 font-medium text-slate-800 dark:text-white">{o.client}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{o.product}</td>
                    <td className="px-6 py-3 text-right">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-bold">
                        Pendiente
                      </span>
                    </td>
                  </tr>
                ))}
                {pendingOrders.length === 0 && (
                  <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">No hay encargos activos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserDashboard;
