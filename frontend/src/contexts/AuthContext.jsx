import { createContext, useEffect, useState } from "react";
import api from "../api/api";
// contesto per l'accesso: tiene l'utente collegato e lo rende disponibile a tutta l'app
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// chiede al server l'utente collegato, con il nome del suo negozio (user.store.name).
// Il server capisce chi è dal token che api.js mette in ogni richiesta
const fetchProfile = async () => {
  const data = await api("/users/me");
  return data.user;
};

const AuthProvider = ({ children }) => {
  // user: l'utente collegato, oppure null se nessuno ha fatto il login
  const [user, setUser] = useState(null);
  // loading: true finché non so se c'è un utente salvato (serve a ProtectedRoute per aspettare)
  const [loading, setLoading] = useState(true);

  // all'apertura dell'app: se c'è un token salvato, recupero l'utente,
  // così chi ricarica la pagina resta dentro senza rifare il login
  useEffect(() => {
    const loadUser = async () => {
      // il token sta in localStorage con "Ricordami", altrimenti in sessionStorage
      const savedToken =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const profile = await fetchProfile();
        setUser(profile);
      } catch {
        // token scaduto o non valido: lo cancello e l'utente dovrà rifare il login
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setUser(null);
      } finally {
        // finally parte sempre, sia se è andata bene sia se c'è stato un errore
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // login: manda email e password, salva il token e poi carica l'utente completo.
  // Restituisce l'utente, così la pagina di login sa dove mandarlo in base al ruolo
  const login = async (email, password, remember) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    // con "Ricordami" il token resta anche chiudendo il browser (localStorage),
    // senza resta solo finché la scheda è aperta (sessionStorage)
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", data.token);
    const profile = await fetchProfile();
    setUser(profile);
    return profile;
  };
  // logout: cancello il token da entrambi i posti e tolgo l'utente
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  // tutto quello che metto in value lo può leggere ogni componente con useAuth()
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
