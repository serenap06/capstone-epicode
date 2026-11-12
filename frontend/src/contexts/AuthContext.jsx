import { createContext, useEffect, useState } from "react";
import api from "../api/api";
//contesto per l'accesso
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

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
        const me = await api("/auth/me");
        setUser(me);
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
    setUser(data.user);
    return data.user;
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
