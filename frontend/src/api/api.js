import { translateError } from "./errors";

// indirizzo del backend, dal file .env
const API_URL = import.meta.env.VITE_API_URL;

// fa la fetch al backend. path: per esempio "/tasks/mine";
// method e body solo quando servono (di base è una GET)
const api = async (path, { method = "GET", body } = {}) => {
  // il token salvato al login
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // i file viaggiano in un FormData: niente JSON, il Content-Type lo scrive il browser
  const isFormData = body instanceof FormData;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        // se c'è il token lo aggiungo: così il backend sa chi sono
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      // il corpo: il FormData così com'è, il resto come testo JSON
      body: isFormData ? body : JSON.stringify(body),
    });
  } catch {
    // fetch fallisce senza risposta quando il server è spento o manca la connessione
    throw new Error("Impossibile contattare il server, riprova tra poco");
  }
  // se la risposta non è JSON (per esempio una pagina di errore) uso un oggetto vuoto
  const data = await res.json().catch(() => ({}));

  // token scaduto mentre si usa l'app: lo cancello e torno al login.
  // Al login no: lì 401 vuol dire solo email o password sbagliate
  if (res.status === 401 && token && path !== "/auth/login") {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.assign("/");
  }

  // errore dal server: lo traduco e lo lancio al catch di chi ha chiamato api()
  if (!res.ok) {
    throw new Error(translateError(data.message, res.status));
  }
  return data;
};

export default api;
