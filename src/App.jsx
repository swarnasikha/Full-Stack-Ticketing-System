import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { SearchProvider } from "./context/SearchContext";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tickets = lazy(() => import("./pages/Tickets"));
const CreateTicket = lazy(() => import("./pages/CreateTicket"));
const TicketDetails = lazy(() => import("./pages/TicketDetails"));
const Agents = lazy(() => import("./pages/Agents"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AgentTickets = lazy(() => import("./pages/AgentTickets"));

function RoleRedirect() {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh"
        }}
      >
        Loading...
      </div>
    );
  }

  if (role === "manager") {
    return <Navigate to="/dashboard" replace />;
  }

  if (role === "user") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                background: "#f8fafc"
              }}
            >
              <div>Loading...</div>
            </div>
          }
        >
          <Routes>
            {/* Login */}
            <Route path="/login" element={<Login />} />

            {/* Root */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleRedirect />
                </ProtectedRoute>
              }
            />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["user", "manager"]}>
                  <SearchProvider>
                    <Dashboard />
                  </SearchProvider>
                </ProtectedRoute>
              }
            />

            {/* Tickets */}
            <Route
              path="/tickets"
              element={
                <ProtectedRoute allowedRoles={["user", "manager"]}>
                  <SearchProvider>
                    <Tickets />
                  </SearchProvider>
                </ProtectedRoute>
              }
            />

            {/* Create Ticket */}
            <Route
              path="/tickets/new"
              element={
                <ProtectedRoute allowedRoles={["user", "manager"]}>
                  <CreateTicket />
                </ProtectedRoute>
              }
            />

            {/* Ticket Details + History */}
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute allowedRoles={["user", "manager"]}>
                  <TicketDetails />
                </ProtectedRoute>
              }
            />

            {/* Manager: Agents */}
            <Route
              path="/agents"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <Agents />
                </ProtectedRoute>
              }
            />

            {/* Feedback */}
            <Route
              path="/feedback"
              element={
                <ProtectedRoute allowedRoles={["user", "manager"]}>
                  <Feedback />
                </ProtectedRoute>
              }
            />

            {/* Notifications */}
            <Route
              path="/notifications"
              element={
                <ProtectedRoute allowedRoles={["user", "manager"]}>
                  <Notifications />
                </ProtectedRoute>
              }
            />

            {/* Manager: Agent Tickets */}
            <Route
              path="/agent"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <AgentTickets />
                </ProtectedRoute>
              }
            />

            {/* Unknown route */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;