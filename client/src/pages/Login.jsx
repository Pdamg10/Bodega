import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(username, password);
    if (result.success) {
      navigate('/inventory');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary px-8 pt-10 pb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-wide">BODEGA</h1>
          <p className="text-white/90 mt-1">Sistema de inventario</p>
        </div>
        <div className="px-8 pt-8 pb-6 border-t borderSoft">
          <h2 className="text-xl font-semibold text-textMain mb-6">Iniciar sesión</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textMain mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              className="w-full px-4 py-2 border borderSoft rounded-lg bg-gray-50 text-textMain placeholder:text-textMuted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-textMain mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-2 pr-20 border borderSoft rounded-lg bg-gray-50 text-textMain placeholder:text-textMuted focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 my-1 px-3 text-sm font-medium rounded-lg text-textMuted hover:text-textMain hover:bg-gray-100 transition"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 active:scale-[0.99] shadow-md transition"
            >
            Ingresar
          </button>
        </form>
          <div className="mt-8 text-center text-sm text-textMuted">
            ¿Problemas para ingresar?{' '}
            <a href="#" className="font-semibold text-primary hover:text-accent transition">
              Contactar soporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
