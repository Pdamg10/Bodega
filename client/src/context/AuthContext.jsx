import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimer = useRef(null);

  // Inactivity timeout duration (1 minute = 60000ms)
  const INACTIVITY_LIMIT = 60000;

  const resetInactivityTimer = () => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    if (user) {
      logoutTimer.current = setTimeout(() => {
        logout();
      }, INACTIVITY_LIMIT);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      // Set initial timer
      resetInactivityTimer();

      // Events to track activity
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
      
      const handleActivity = () => {
        resetInactivityTimer();
      };

      events.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      return () => {
        if (logoutTimer.current) clearTimeout(logoutTimer.current);
        events.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [user]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const userData = { ...res.data.user, access_token: res.data.access_token };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
