import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getHomePath } from "../utils/getHomePath";

const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Caricamento...</p>;

  if (!user) return <Navigate to="/" replace />;

  if (user && user.role !== role) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
