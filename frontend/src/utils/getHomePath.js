// pagina iniziale del ruolo: "/admin" o "/employee"
export const getHomePath = (role) =>
  role === "admin" ? "/admin" : "/employee";
