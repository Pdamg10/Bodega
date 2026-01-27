import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './layouts/Layout';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Sales = lazy(() => import('./pages/Sales'));
const Clients = lazy(() => import('./pages/Clients'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Backup = lazy(() => import('./pages/Backup'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const RoleRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
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
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              !user
                ? <Navigate to="/login" />
                : user.role === 'admin'
                  ? <Navigate to="/admin" />
                  : <Navigate to="/inventory" />
            }
          />

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
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
