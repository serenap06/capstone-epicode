import api from "./api";

// richieste che riguardano le task, usate da più pagine (Home e Le mie task)

// inverte lo stato di una task (fatta / da fare) e restituisce la task aggiornata
export const toggleTaskStatus = async (task) => {
  // se è fatta la rimetto da fare, altrimenti la segno come fatta
  const status = task.status === "done" ? "pending" : "done";
  const data = await api(`/tasks/${task._id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return data.task;
};

// restituisce la lista con la task aggiornata al posto di quella vecchia.
// { ...task, ...updatedTask }: prendo la task vecchia e sovrascrivo i campi con quelli nuovi
// (la vecchia ha il negozio completo di nome, quella del server potrebbe avere solo l'id)
export const replaceTask = (tasks, updatedTask) =>
  tasks.map((task) =>
    task._id === updatedTask._id ? { ...task, ...updatedTask } : task,
  );

// crea una task (una copia per ogni persona) e restituisce le copie create
export const createTask = async (taskData) => {
  const data = await api("/tasks", { method: "POST", body: taskData });
  return data.tasks;
};

// elimina tutte le copie di una task (il gruppo), per tutte le persone assegnate
export const deleteTaskGroup = async (groupId) => {
  await api(`/tasks/group/${groupId}`, { method: "DELETE" });
};
