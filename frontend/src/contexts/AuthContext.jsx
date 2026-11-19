// import
import { createContext, useEffect, useState } from "react";
import api from "../api/api";
// contesto dell'accesso: l'utente collegato in tutta l'app
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// prendo il mio profilo dal server (il token dice chi sono)
const fetchProfile = async () => {
  const data = await api("/users/me");
  return data.user;
};

// componente AuthProvider: tiene l'utente, il login e il logout
const AuthProvider = ({ children }) => {
  // utente collegato, oppure null
  const [user, setUser] = useState(null);
  // true finché non so se c'è un utente salvato
  const [loading, setLoading] = useState(true);

  // all'apertura: con un token salvato recupero l'utente (ricaricando si resta dentro)
  useEffect(() => {
    // leggo il token salvato e chiedo il profilo
    const loadUser = async () => {
      // localStorage con "Ricordami", altrimenti sessionStorage
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
        // token non valido: lo cancello
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setUser(null);
      } finally {
        // finally parte sempre
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // login: salvo il token e restituisco l'utente (la pagina sa dove mandarlo)
  const login = async (email, password, remember) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    // "Ricordami": localStorage resta anche chiudendo il browser
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", data.token);
    const profile = await fetchProfile();
    setUser(profile);
    return profile;
  };
  // logout: cancello il token e tolgo l'utente
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

  // value: quello che si legge con useAuth()
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
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
