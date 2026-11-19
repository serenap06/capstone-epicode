// import
import { translateError } from "./errors";

// indirizzo del backend, dal .env
const API_URL = import.meta.env.VITE_API_URL;

// fetch al backend: path es. "/tasks/mine"; method e body solo se servono (di base GET)
const api = async (path, { method = "GET", body } = {}) => {
  // token salvato al login
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  // file in un FormData: niente JSON, il Content-Type lo scrive il browser
  const isFormData = body instanceof FormData;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        // con il token il backend sa chi sono
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      // body: il FormData così com'è, il resto in JSON
      body: isFormData ? body : JSON.stringify(body),
    });
  } catch {
    // nessuna risposta: server spento o niente connessione
    throw new Error("Impossibile contattare il server, riprova tra poco");
  }
  // risposta non JSON: oggetto vuoto
  const data = await res.json().catch(() => ({}));

  // token scaduto: lo cancello e torno al login (non al login stesso: lì 401 = password sbagliata)
  if (res.status === 401 && token && path !== "/auth/login") {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.assign("/");
  }

  // errore: lo traduco e lo lancio a chi ha chiamato api()
  if (!res.ok) {
    throw new Error(translateError(data.message, res.status));
  }
  return data;
};

export default api;
