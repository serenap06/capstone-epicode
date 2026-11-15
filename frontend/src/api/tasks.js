import api from "./api";

// richieste sulle task usate da più pagine

// inverte lo stato (fatta / da fare) e restituisce la task aggiornata
export const toggleTaskStatus = async (task) => {
  const status = task.status === "done" ? "pending" : "done";
  const data = await api(`/tasks/${task._id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return data.task;
};

// mette nella lista la task aggiornata al posto della vecchia.
// { ...task, ...updatedTask } tiene i campi che il server non rimanda (es. il nome del negozio)
export const replaceTask = (tasks, updatedTask) =>
  tasks.map((task) =>
    task._id === updatedTask._id ? { ...task, ...updatedTask } : task,
  );

// crea la task (una copia per ogni persona)
export const createTask = async (taskData) => {
  const data = await api("/tasks", { method: "POST", body: taskData });
  return data.tasks;
};

// elimina la task per tutte le persone assegnate (tutto il gruppo)
export const deleteTaskGroup = async (groupId) => {
  await api(`/tasks/group/${groupId}`, { method: "DELETE" });
};
