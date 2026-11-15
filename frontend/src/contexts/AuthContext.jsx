import { createContext, useEffect, useState } from "react";
import api from "../api/api";
// contesto dell'accesso: l'utente collegato, disponibile in tutta l'app
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// l'utente collegato, con il nome del negozio (il server lo riconosce dal token)
const fetchProfile = async () => {
  const data = await api("/users/me");
  return data.user;
};

const AuthProvider = ({ children }) => {
  // user: l'utente collegato, oppure null
  const [user, setUser] = useState(null);
  // loading: true finché non so se c'è un utente salvato
  const [loading, setLoading] = useState(true);

  // all'apertura: se c'è un token recupero l'utente, così ricaricando la pagina si resta dentro
  useEffect(() => {
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
        // token scaduto o non valido: lo cancello
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setUser(null);
      } finally {
        // finally parte sempre, anche dopo un errore
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // login: salva il token e restituisce l'utente, così la pagina sa dove mandarlo
  const login = async (email, password, remember) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    // "Ricordami": localStorage resta anche chiudendo il browser, sessionStorage no
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

  // value: quello che i componenti leggono con useAuth()
  // (setUser serve al Profilo, per rimettere l'utente aggiornato)
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
