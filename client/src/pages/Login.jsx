import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Lock, User, Eye, EyeOff, Moon, Sun, ArrowRight } from 'lucide-react';
import BrandIcon from '../components/BrandIcon';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: New Password
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Existing login handler...
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (res.success) {
      if (res.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    } else {
      setError(res.message);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // In a real app, use axios to call the backend
      // But we need to use the 'api' instance which has the base URL
      // Import it dynamically or assume it's available. 
      // Better to import 'api' at the top. 
      // Since I can't easily add imports without rewriting the file, I'll use fetch with API_URL from env or default

      // WAIT: I should import 'api' from '../config/api'. 
      // I will replace the imports in a separate block or assume I can rewrite the whole file if needed.
      // Let's use the 'api' import I will add.
      const res = await import('../config/api').then(m => m.default.post('/users/verify-email', { email: resetEmail }));
      if (res.data.success) {
        setResetUserId(res.data.userId);
        setResetStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al verificar correo');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      await import('../config/api').then(m => m.default.put(`/users/${resetUserId}`, { password: newPassword }));
      setResetSuccess(true);
      setTimeout(() => {
        setIsResetting(false);
        setResetSuccess(false);
        setResetStep(1);
        setResetEmail('');
        setNewPassword('');
        setConfirmPassword('');
      }, 3000);
    } catch (err) {
      setError('Error al actualizar contraseña');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent transition-colors duration-300 relative">
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-lg hover:scale-110 transition-all border dark:border-slate-700"
      >
        {darkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="w-full max-w-md p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 dark:border dark:border-slate-700">
          <div className="p-8 pb-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                <BrandIcon size={64} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Invexis</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {isResetting ? (resetStep === 1 ? 'Recuperar Contraseña' : 'Establecer Nueva Contraseña') : 'Ingresa tus credenciales para acceder'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-center border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            {resetSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg mb-6 text-sm text-center border border-green-100 dark:border-green-900/30">
                Contraseña actualizada exitosamente. Redirigiendo al login...
              </div>
            )}

            {!isResetting ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Usuario</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Ingrese su usuario"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Contraseña</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-10 pr-10 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center justify-center gap-2 mt-2"
                >
                  Iniciar Sesión <ArrowRight size={20} />
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsResetting(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
                {resetStep === 1 ? (
                  <form onSubmit={handleVerifyEmail} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Correo Electrónico</label>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="ejemplo@correo.com"
                        required
                      />
                      <p className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                        Ingrese el correo asociado a su cuenta para verificar.
                      </p>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                    >
                      Verificar Correo
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Nueva contraseña"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Confirmar Contraseña</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Confirmar contraseña"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40"
                    >
                      Restablecer Contraseña
                    </button>
                  </form>
                )}

                <button
                  onClick={() => {
                    setIsResetting(false);
                    setResetStep(1);
                    setError('');
                  }}
                  className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
