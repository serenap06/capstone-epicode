// pagina iniziale in base al ruolo: "/admin" per il responsabile, "/employee" per il dipendente.
// Usata dopo il login, dal logo nella barra in alto e da ProtectedRoute
export const getHomePath = (role) =>
  role === "admin" ? "/admin" : "/employee";
