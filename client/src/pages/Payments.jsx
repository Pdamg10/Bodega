import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, CheckCircle, Clock } from 'lucide-react';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/api/payments');
      setPayments(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-textMain">Pagos y facturación</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border borderSoft">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Cliente</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Monto</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Fecha de vencimiento</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Estado</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Fecha de pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center">Cargando...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center">No se encontraron registros de pago</td></tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{payment.User?.username}</td>
                  <td className="px-6 py-4 font-mono">${payment.amount}</td>
                  <td className="px-6 py-4 text-gray-600">{payment.due_date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                      payment.status === 'PAID' ? 'bg-green-100 text-green-700' :
                      payment.status === 'LATE' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {payment.status === 'PAID' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {payment.status === 'PAID'
                        ? 'Pagado'
                        : payment.status === 'LATE'
                          ? 'Atrasado'
                          : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {payment.date_paid ? new Date(payment.date_paid).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
