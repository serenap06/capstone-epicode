// import
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// leggo utente, login e logout da qualsiasi componente
export const useAuth = () => useContext(AuthContext);
