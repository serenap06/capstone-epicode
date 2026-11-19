// import
import api from "./api";

// richieste delle task

// inverto lo stato (fatta / da fare)
export const toggleTaskStatus = async (task) => {
  const status = task.status === "done" ? "pending" : "done";
  const data = await api(`/tasks/${task._id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return data.task;
};

// metto la task aggiornata al posto della vecchia ({ ...task, ...updatedTask } tiene i campi che mancano)
export const replaceTask = (tasks, updatedTask) =>
  tasks.map((task) =>
    task._id === updatedTask._id ? { ...task, ...updatedTask } : task,
  );

// nuova task (una copia per persona)
export const createTask = async (taskData) => {
  const data = await api("/tasks", { method: "POST", body: taskData });
  return data.tasks;
};

// elimino la task per tutti
export const deleteTaskGroup = async (groupId) => {
  await api(`/tasks/group/${groupId}`, { method: "DELETE" });
};
