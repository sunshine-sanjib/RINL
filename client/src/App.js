import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintsPage from './pages/ComplaintsPage';
import NewComplaintPage from './pages/NewComplaintPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import MaintenancePage from './pages/MaintenancePage';
import NewMaintenancePage from './pages/NewMaintenancePage';
import MaintenanceDetailPage from './pages/MaintenanceDetailPage';
import ApprovalPage from './pages/ApprovalPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

import './App.css';

// Protected Route - any authenticated user
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner"/></div>;
  return user ? children : <Navigate to="/login" replace />;
};

// Role-based Route
const RoleRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// Public only (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="spinner"/></div>;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected — all authenticated users */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/complaints" element={<ProtectedRoute><ComplaintsPage /></ProtectedRoute>} />
      <Route path="/complaints/new" element={<ProtectedRoute><NewComplaintPage /></ProtectedRoute>} />
      <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
      <Route path="/maintenance/new" element={<ProtectedRoute><NewMaintenancePage /></ProtectedRoute>} />
      <Route path="/maintenance/:id" element={<ProtectedRoute><MaintenanceDetailPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Approvals — coordinator, eic, admin */}
      <Route path="/approvals" element={
        <RoleRoute roles={['coordinator', 'eic', 'admin']}>
          <ApprovalPage />
        </RoleRoute>
      } />

      {/* Admin only */}
      <Route path="/admin" element={
        <RoleRoute roles={['admin']}>
          <AdminPage />
        </RoleRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
          }}
        />
      </Router>
    </AuthProvider>
  );
}
