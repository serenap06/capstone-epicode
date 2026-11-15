import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// legge utente, login e logout da qualsiasi componente: const { user } = useAuth();
export const useAuth = () => useContext(AuthContext);
