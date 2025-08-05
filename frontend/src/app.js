import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientManagementPage from './pages/ClientManagementPage';
import ClientDetailPage from './pages/ClientDetailPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();
  console.log('App.js - Current location:', location.pathname);
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <ClientManagementPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clients/:clientId" 
        element={
          <ProtectedRoute>
            <ClientDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/test" 
        element={
          <div style={{ padding: '50px', backgroundColor: 'red', color: 'white' }}>
            <h1>TEST ROUTE WORKING!</h1>
            <p>If you can see this, routing is working.</p>
          </div>
        } 
      />
    </Routes>
  );
}

export default App;