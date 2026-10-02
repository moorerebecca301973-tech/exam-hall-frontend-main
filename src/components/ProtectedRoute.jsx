import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute() {
  const { adminToken } = useAuth();
  const location = useLocation();
  if (!adminToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

export function StudentRoute() {
  const { studentToken } = useAuth();
  const location = useLocation();
  if (!studentToken) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
