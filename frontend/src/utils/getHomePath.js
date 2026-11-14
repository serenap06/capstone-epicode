// Pagina iniziale in base al ruolo: "/admin" oppure "/employee"
export const getHomePath = (role) =>
  role === "admin" ? "/admin" : "/employee";
