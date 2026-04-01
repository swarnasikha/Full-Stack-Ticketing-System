import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import DashboardLayout  from './components/DashboardLayout';
import AgentLayout      from './components/AgentLayout';

const Login         = lazy(() => import('./pages/Login'));
const Dashboard     = lazy(() => import('./pages/Dashboard'));
const Tickets       = lazy(() => import('./pages/Tickets'));
const Agents        = lazy(() => import('./pages/Agents'));
const Feedback      = lazy(() => import('./pages/Feedback'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AgentTickets  = lazy(() => import('./pages/AgentTickets'));

import { SearchProvider } from './context/SearchContext';

/** After login, redirect to correct area based on role */
function RoleRedirect() {
  const { role, loading } = useAuth();
  if (loading) return null;
  return role === 'agent'
    ? <Navigate to="/agent" replace />
    : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #dbeafe', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        }>
          <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Root → redirect based on role */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <RoleRedirect />
              </ProtectedRoute>
            }
          />

          {/* ── Admin routes ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SearchProvider>
                  <DashboardLayout />
                </SearchProvider>
              </ProtectedRoute>
            }
          >
            <Route index        element={<Dashboard />} />
            <Route path="tickets"       element={<Tickets />} />
            <Route path="agents"        element={<Agents />} />
            <Route path="feedback"      element={<Feedback />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          {/* ── Agent routes ── */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentTickets />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;