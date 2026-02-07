import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, Printer, RefreshCw } from 'lucide-react';
import api from '../config/api';

const Reports = () => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [range, setRange] = useState({ from: '', to: '' });
  const [interval, setIntervalVal] = useState('diario'); // diario, semanal, quincenal, mensual, anual
  const [autoReload, setAutoReload] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        api.get('/movements'),
        api.get('/products'),
      ]);
      setMovements(mRes.data);
      setProducts(pRes.data);
    } catch {
      setMessage('Error cargando datos de reportes');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let id;
    if (autoReload) {
      id = setInterval(fetchData, 30000);
    }
    return () => id && clearInterval(id);
  }, [autoReload]);

  const productById = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);

  const filteredMovements = useMemo(() => {
    if (!range.from && !range.to) return movements;
    const from = range.from ? new Date(range.from) : null;
    const to = range.to ? new Date(range.to) : null;
    return movements.filter(m => {
      const d = new Date(m.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [movements, range]);

  const computeRevenueCost = (ms) => {
    let revenue = 0;
    let cost = 0;
    let units = 0;
    for (const m of ms) {
      const prod = productById[m.productId];
      if (!prod) continue;
      if (m.type === 'OUT') {
        revenue += (prod.price || 0) * m.quantity;
        // costo aproximado si no existe; se podría almacenar explícito en producto
        const c = typeof prod.cost === 'number' ? prod.cost : (prod.price || 0) * 0.6;
        cost += c * m.quantity;
        units += m.quantity;
      } else if (m.type === 'IN') {
        const c = typeof prod.cost === 'number' ? prod.cost : (prod.price || 0) * 0.6;
        cost += c * m.quantity;
      }
    }
    const profit = revenue - cost;
    const margin = revenue > 0 ? (profit / revenue) : 0;
    return { revenue, cost, profit, margin, units };
  };

  const buckets = useMemo(() => {
    const ms = filteredMovements.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const makeKey = (d) => {
      const dt = new Date(d);
      if (interval === 'diario') return dt.toISOString().slice(0, 10);
      if (interval === 'semanal') {
        const day = dt.getDay(); // 0 dom
        const mondayOffset = (day + 6) % 7;
        const monday = new Date(dt); monday.setDate(dt.getDate() - mondayOffset);
        return `Semana ${monday.toISOString().slice(0, 10)}`;
      }
      if (interval === 'quincenal') {
        const month = dt.getMonth() + 1, year = dt.getFullYear();
        const half = dt.getDate() <= 15 ? 'H1' : 'H2';
        return `${year}-${String(month).padStart(2, '0')} ${half}`;
      }
      if (interval === 'mensual') {
        const month = dt.getMonth() + 1, year = dt.getFullYear();
        return `${year}-${String(month).padStart(2, '0')}`;
      }
      const year = new Date(d).getFullYear();
      return `${year}`;
    };
    const map = new Map();
    for (const m of ms) {
      const key = makeKey(m.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    }
    const out = [];
    for (const [key, arr] of map.entries()) {
      const stats = computeRevenueCost(arr);
      out.push({ key, ...stats });
    }
    out.sort((a, b) => a.key.localeCompare(b.key));
    return out;
  }, [filteredMovements, interval, products]);

  const totals = useMemo(() => computeRevenueCost(filteredMovements), [filteredMovements, products]);

  const exportCSV = () => {
    const header = ['Periodo', 'Ventas', 'Costos', 'Ganancias', 'Margen', 'Unidades'];
    const rows = buckets.map(b => [b.key, b.revenue.toFixed(2), b.cost.toFixed(2), b.profit.toFixed(2), (b.margin * 100).toFixed(1) + '%', b.units]);
    const all = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([all], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'reporte.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    window.print();
  };

  return (
    <div className="p-8 lg:pt-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Reportes</h1>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-2 rounded-md flex items-center gap-2">
            <RefreshCw size={16} /> Actualizar
          </button>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={autoReload} onChange={(e) => setAutoReload(e.target.checked)} />
            Auto (30s)
          </label>
          <button onClick={exportCSV} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md flex items-center gap-2">
            <Download size={16} /> Exportar Excel
          </button>
          <button onClick={printPDF} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-2">
            <Printer size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      {message && <div className="mb-4 text-sm text-slate-700 dark:text-slate-200">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">Rango de fechas</div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input type="date" value={range.from} onChange={(e) => setRange(r => ({ ...r, from: e.target.value }))}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white" />
            <input type="date" value={range.to} onChange={(e) => setRange(r => ({ ...r, to: e.target.value }))}
              className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">Intervalo</div>
          <select value={interval} onChange={(e) => setIntervalVal(e.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-slate-800 dark:text-white">
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="quincenal">Quincenal</option>
            <option value="mensual">Mensual</option>
            <option value="anual">Anual</option>
          </select>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">KPIs</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Kpi label="Ventas totales" value={`$${totals.revenue.toFixed(2)}`} />
            <Kpi label="Ganancias netas" value={`$${totals.profit.toFixed(2)}`} />
            <Kpi label="Unidades vendidas" value={totals.units} />
            <Kpi label="Margen" value={`${(totals.margin * 100).toFixed(1)}%`} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Tendencias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartArea title="Ventas brutas" data={buckets.map(b => ({ x: b.key, y: b.revenue }))} color="#4f46e5" />
          <ChartArea title="Ganancias netas" data={buckets.map(b => ({ x: b.key, y: b.profit }))} color="#16a34a" />
          <ChartBars title="Unidades" data={buckets.map(b => ({ x: b.key, y: b.units }))} color="#0ea5e9" />
          <ChartLine title="Margen (%)" data={buckets.map(b => ({ x: b.key, y: Math.round(b.margin * 100) }))} color="#f59e0b" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Reporte detallado</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 dark:text-slate-300">
                <th className="px-3 py-2">Periodo</th>
                <th className="px-3 py-2">Ventas</th>
                <th className="px-3 py-2">Costos</th>
                <th className="px-3 py-2">Ganancias</th>
                <th className="px-3 py-2">Margen</th>
                <th className="px-3 py-2">Unidades</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map(b => (
                <tr key={b.key} className="border-t border-slate-100 dark:border-slate-700">
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{b.key}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">${b.revenue.toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">${b.cost.toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">${b.profit.toFixed(2)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{(b.margin * 100).toFixed(1)}%</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{b.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

function Kpi({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
      <div className="text-xs text-slate-600 dark:text-slate-300">{label}</div>
      <div className="text-lg font-semibold text-slate-800 dark:text-white">{value}</div>
    </div>
  );
}

function ChartArea({ title, data, color }) {
  const vbW = 100, vbH = 60, pad = 8;
  const xs = data.map(d => d.x), ys = data.map(d => d.y);
  const maxY = Math.max(1, ...ys);
  const stepX = (vbW - pad * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = vbH - pad - (d.y / maxY) * (vbH - pad * 2);
    return [x, y];
  });
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  const fillPath = `${path} L ${pad + (data.length - 1) * stepX},${vbH - pad} L ${pad},${vbH - pad} Z`;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
      <div className="text-sm font-medium text-slate-800 dark:text-white mb-2">{title}</div>
      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-44 md:h-40" role="img" aria-label={title}>
        <title>{title}</title>
        <rect x={pad} y={pad} width={vbW - pad * 2} height={vbH - pad * 2} fill="none" stroke="#334155" opacity="0.25" />
        <path d={fillPath} fill={`${color}22`} />
        <path d={path} stroke={color} fill="none" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="1.5" fill={color} />
        ))}
      </svg>
      <div className="mt-2 text-xs text-slate-500">
        {xs.length > 1 ? `${xs[0]} … ${xs[xs.length - 1]}` : (xs[0] || '-')}
      </div>
    </div>
  );
}

function ChartLine({ title, data, color }) {
  return <ChartArea title={title} data={data} color={color} />;
}

function ChartBars({ title, data, color }) {
  const vbW = 100, vbH = 60, pad = 8;
  const ys = data.map(d => d.y);
  const maxY = Math.max(1, ...ys);
  const barW = (vbW - pad * 2) / Math.max(1, data.length);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
      <div className="text-sm font-medium text-slate-800 dark:text-white mb-2">{title}</div>
      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full h-44 md:h-40" role="img" aria-label={title}>
        <title>{title}</title>
        <rect x={pad} y={pad} width={vbW - pad * 2} height={vbH - pad * 2} fill="none" stroke="#334155" opacity="0.25" />
        {data.map((d, i) => {
          const h = (d.y / maxY) * (vbH - pad * 2);
          const x = pad + i * barW + 0.8;
          const y = vbH - pad - h;
          return <rect key={i} x={x} y={y} width={barW - 1.6} height={h} fill={color} rx="2" />;
        })}
      </svg>
      <div className="mt-2 text-xs text-slate-500">
        {data.length > 1 ? `${data[0].x} … ${data[data.length - 1].x}` : (data[0]?.x || '-')}
      </div>
    </div>
  );
}
