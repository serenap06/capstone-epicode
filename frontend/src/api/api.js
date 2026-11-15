import { translateError } from "./errors";

// indirizzo del backend, preso dal file .env (VITE_API_URL)
const API_URL = import.meta.env.VITE_API_URL;

// api helper per non riscrivere sempre la fetch.
// path: la parte finale dell'indirizzo, per esempio "/tasks/mine"
// method e body si passano solo quando servono: di default è una GET senza corpo
const api = async (path, { method = "GET", body } = {}) => {
  // prendo il token salvato al login (in uno dei due posti)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      // se c'è il token lo aggiungo, così il backend sa chi sta facendo la richiesta
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    // il corpo va mandato come testo JSON
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();

  // se il server risponde con un errore, lo trasformo in un messaggio in italiano
  // e lo "lancio": lo prende il catch di chi ha chiamato api()
  if (!res.ok) {
    throw new Error(translateError(data.message, res.status));
  }
  return data;
};

export default api;
