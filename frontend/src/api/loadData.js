import api from "./api";

// chiede i dati al server e li passa a onSuccess.
// Se la richiesta fallisce passa il messaggio di errore a onError.
// Così nelle pagine un caricamento è una riga sola, senza try/catch:
// loadData("/tasks/mine", (data) => setTasks(data.tasks), setError);
export const loadData = async (path, onSuccess, onError) => {
  try {
    const data = await api(path);
    onSuccess(data);
  } catch (e) {
    onError(e.message);
  }
};
