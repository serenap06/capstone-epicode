// pagina iniziale del ruolo
export const getHomePath = (role) =>
  role === "admin" ? "/admin" : "/employee";
