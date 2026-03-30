import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import DashboardLayout  from './components/DashboardLayout';
import AgentLayout      from './components/AgentLayout';
import Login            from './pages/Login';
import Dashboard        from './pages/Dashboard';
import Tickets          from './pages/Tickets';
import Agents           from './pages/Agents';
import Feedback         from './pages/Feedback';
import Notifications    from './pages/Notifications';
import AgentTickets     from './pages/AgentTickets';

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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
