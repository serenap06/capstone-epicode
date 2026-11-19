// import
import api from "./api";

// prendo i dati e li passo a onSuccess, l'errore a onError.
// Es. loadData("/tasks/mine", (data) => setTasks(data.tasks), setError).
// Restituisce una promise: con Promise.all so quando sono arrivate tutte
export const loadData = async (path, onSuccess, onError) => {
  try {
    const data = await api(path);
    onSuccess(data);
  } catch (e) {
    onError(e.message);
  }
};
