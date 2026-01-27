import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Clients from './pages/Clients';
import Reports from './pages/Reports';
import Layout from './layouts/Layout';
import Settings from './pages/Settings';
import Backup from './pages/Backup';

const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/inventory" />} />
        
        {/* Admin Routes */}
        <Route path="admin" element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
        <Route path="admin/backup" element={<RoleRoute role="admin"><Backup /></RoleRoute>} />
        <Route path="admin/settings" element={<RoleRoute role="admin"><Settings /></RoleRoute>} />
        
        {/* User Routes */}
        <Route path="dashboard" element={<RoleRoute role="user"><UserDashboard /></RoleRoute>} />
        <Route path="inventory" element={<RoleRoute role="user"><Inventory /></RoleRoute>} />
        <Route path="sales" element={<RoleRoute role="user"><Sales /></RoleRoute>} />
        <Route path="clients" element={<RoleRoute role="user"><Clients /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute role="user"><Reports /></RoleRoute>} />
      </Route>
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  </AuthProvider>
);

export default App;
