import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './layouts/Layout';

// Lazy load pages for performance
const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Reports = lazy(() => import('./pages/Reports'));
const Sales = lazy(() => import('./pages/Sales'));
const Settings = lazy(() => import('./pages/Settings'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));

// Loading component
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const App = () => {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                            {/* Public Route */}
                            <Route path="/login" element={<Login />} />

                            {/* Protected Routes */}
                            <Route element={<Layout />}>
                                <Route path="/" element={<Navigate to="/admin" replace />} />

                                {/* Admin Routes */}
                                <Route path="/admin" element={<AdminDashboard />} />
                                <Route path="/admin/inventory" element={<Inventory />} />
                                <Route path="/admin/sales" element={<Sales />} />
                                <Route path="/admin/clients" element={<Clients />} />
                                <Route path="/admin/reports" element={<Reports />} />
                                <Route path="/admin/settings" element={<Settings />} />

                                {/* User Routes (if applicable) */}
                                <Route path="/user" element={<UserDashboard />} />
                                <Route path="/user/inventory" element={<Inventory />} />
                                <Route path="/user/sales" element={<Sales />} />
                                <Route path="/user/clients" element={<Clients />} />
                                <Route path="/user/reports" element={<Reports />} />
                            </Route>

                            {/* Catch all */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </Suspense>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
