import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import Movements from './pages/Movements';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import Payments from './pages/Payments';
import AuditLogs from './pages/AuditLogs';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/inventory" />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="movements" element={<Movements />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="payments" element={<Payments />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
