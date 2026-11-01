import { createContext, useEffect, useState } from "react";
import api from "../api/api";
//contesto per l'accesso
export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token"),
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await api("/auth/me");
        setUser(me);
      } catch {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setToken(null);
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
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
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
