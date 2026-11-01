import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Caricamento...</p>;

  if (!user) return <Navigate to="/" replace />;

  if (user && user.role !== role) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace />
    );
  }
  return <Outlet />;
};

export default ProtectedRoute;
