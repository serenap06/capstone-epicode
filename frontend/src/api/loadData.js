import api from "./api";

// carica i dati e li passa a onSuccess; se fallisce passa l'errore a onError.
// Esempio: loadData("/tasks/mine", (data) => setTasks(data.tasks), setError);
// È async, quindi restituisce una promise: con Promise.all la pagina sa quando
// sono arrivate tutte le richieste (per spegnere la rotellina)
export const loadData = async (path, onSuccess, onError) => {
  try {
    const data = await api(path);
    onSuccess(data);
  } catch (e) {
    onError(e.message);
  }
};
