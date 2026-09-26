import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Loading RSVP Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-event"
        element={
          <ProtectedRoute>
            <CreateEvent />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:eventId"
        element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        }
      />

      {/* Default route */}
      <Route
        path="/"
        element={
          <Navigate
            to={user ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to={user ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;