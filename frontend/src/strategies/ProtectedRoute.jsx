// import
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getHomePath } from "../utils/getHomePath";

// componente ProtectedRoute: mostra la pagina solo a chi ha il ruolo giusto
const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();

  // aspetto di sapere se c'è un utente salvato
  if (loading) return <p>Caricamento...</p>;

  // nessuno collegato: login
  if (!user) return <Navigate to="/" replace />;

  // ruolo sbagliato: la sua pagina iniziale
  if (user.role !== role) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  // tutto ok: Outlet mostra la pagina
  return <Outlet />;
};

export default ProtectedRoute;
