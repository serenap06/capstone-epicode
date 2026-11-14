import api from "./api";

// Chiede i dati al server e li passa a onSuccess.
// Se la richiesta fallisce passa il messaggio di errore a onError.
export const loadData = async (path, onSuccess, onError) => {
  try {
    const data = await api(path);
    onSuccess(data);
  } catch (e) {
    onError(e.message);
  }
};
