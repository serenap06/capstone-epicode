import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// scorciatoia per leggere il contesto dell'accesso da qualsiasi componente:
// const { user, login, logout } = useAuth();
export const useAuth = () => useContext(AuthContext);
