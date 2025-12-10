import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar } from 'lucide-react';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, totalSalesCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchSales();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/reports/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/reports/sales');
      // Process data for charts - Group by date
      const processed = res.data.reduce((acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString();
        if (!acc[date]) acc[date] = { date, sales: 0, quantity: 0 };
        acc[date].sales += (curr.Product?.price_usd || 0) * curr.quantity;
        acc[date].quantity += curr.quantity;
        return acc;
      }, {});
      
      setSalesData(Object.values(processed).reverse()); // Show oldest to newest
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Reports & Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm font-medium">Total Products</p>
          <p className="text-3xl font-bold text-primary mt-2">{stats.totalProducts}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
          <p className="text-gray-500 text-sm font-medium">Low Stock Items</p>
          <p className="text-3xl font-bold text-primary mt-2">{stats.lowStock}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-medium">Total Sales Transactions</p>
          <p className="text-3xl font-bold text-primary mt-2">{stats.totalSalesCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-accent" />
            Sales Trend (USD)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantity Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-accent" />
            Items Sold
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
