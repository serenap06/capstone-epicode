import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getHomePath } from "../utils/getHomePath";

// "guardiano" delle pagine protette: decide se mostrare la pagina o mandare altrove.
// role: il ruolo che serve per entrare ("admin" o "employee")
const ProtectedRoute = ({ role }) => {
  const { user, loading } = useAuth();

  // aspetto di sapere se c'è un utente salvato, altrimenti lo manderei al login per sbaglio
  if (loading) return <p>Caricamento...</p>;

  // nessuno collegato: torna al login
  if (!user) return <Navigate to="/" replace />;

  // collegato ma con il ruolo sbagliato: lo mando alla sua pagina iniziale
  if (user && user.role !== role) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }
  // tutto ok: Outlet mostra la pagina richiesta
  return <Outlet />;
};

export default ProtectedRoute;
