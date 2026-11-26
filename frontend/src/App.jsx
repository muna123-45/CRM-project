import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Tasks from "./pages/Tasks";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard */}
      <Route element={<ProtectedRoute requiredPermission="dashboard.view" />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* User Management */}
      <Route element={<ProtectedRoute requiredPermission="users.view" />}>
        <Route path="/users" element={<Users />} />
      </Route>

      <Route element={<ProtectedRoute requiredPermission="roles.view" />}>
        <Route path="/roles" element={<Roles />} />
      </Route>

      {/* Task Management */}
      <Route element={<ProtectedRoute requiredPermission="tasks.view" />}>
        <Route path="/tasks" element={<Tasks />} />
      </Route>

      {/* Default route */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
