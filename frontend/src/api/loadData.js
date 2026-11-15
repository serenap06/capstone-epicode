import api from "./api";

// carica i dati e li passa a onSuccess; se fallisce passa l'errore a onError.
// Esempio: loadData("/tasks/mine", (data) => setTasks(data.tasks), setError);
export const loadData = async (path, onSuccess, onError) => {
  try {
    const data = await api(path);
    onSuccess(data);
  } catch (e) {
    onError(e.message);
  }
};
