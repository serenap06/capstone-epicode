import { createContext, useEffect, useState } from "react";
import api from "../api/api";
//contesto per l'accesso
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// utente collegato, con il nome del suo negozio (user.store.name)
const fetchProfile = async () => {
  const data = await api("/users/me");
  return data.user;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
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
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email, password, remember) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", data.token);
    const profile = await fetchProfile();
    setUser(profile);
    return profile;
  };
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setUser(null);
  };

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
