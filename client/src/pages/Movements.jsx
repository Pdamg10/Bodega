import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ArrowUpCircle, ArrowDownCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Movements = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [type, setType] = useState('OUT'); // OUT (Sale), IN (Purchase)
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await axios.get('/api/movements');
      setMovements(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return alert('Por favor selecciona un producto');

    try {
      await axios.post('/api/movements', {
        product_id: selectedProduct.id,
        type,
        quantity: parseInt(quantity),
        note,
      });

      // Reset and refresh
      setQuantity('');
      setNote('');
      setSelectedProduct(null);
      setSearchTerm('');
      fetchMovements();
      fetchProducts();
      toast.success('Transacción registrada correctamente');
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      toast.error(error.response?.data?.message || 'Error al crear movimiento');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <h1 className="text-3xl font-bold text-textMain">Nueva transacción</h1>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar producto</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedProduct(null);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                />
              </div>

              {/* Dropdown Results */}
              {searchTerm && !selectedProduct && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSearchTerm(product.name);
                      }}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                    >
                      <span>{product.name}</span>
                      <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedProduct && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex justify-between">
                <span>Seleccionado: <strong>{selectedProduct.name}</strong></span>
                <span>Stock: {selectedProduct.stock}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('OUT')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'OUT'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-red-200 text-gray-500'
                  }`}
              >
                <ArrowUpCircle size={24} />
                <span className="font-bold">VENTA (SALIDA)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('IN')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${type === 'IN'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-green-200 text-gray-500'
                  }`}
              >
                <ArrowDownCircle size={24} />
                <span className="font-bold">COMPRA (ENTRADA)</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                rows="2"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-textMain py-3 rounded-lg font-bold hover:bg-secondary transition-colors"
            >
              Confirmar transacción
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-2xl font-bold text-gray-700">Movimientos recientes</h2>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">Fecha</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Tipo</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Producto</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Cant.</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">Cargando...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center">No hay movimientos registrados</td></tr>
              ) : (
                movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(mov.date).toLocaleDateString()} {new Date(mov.date).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${mov.type === 'IN' ? 'bg-green-100 text-green-700' :
                          mov.type === 'OUT' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {mov.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{mov.Product?.name}</td>
                    <td className="px-6 py-4 font-mono">{mov.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{mov.User?.username}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Movements;
