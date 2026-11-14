import api from "./api";

// inverte lo stato di una task (fatta / da fare) e restituisce la task aggiornata
export const toggleTaskStatus = async (task) => {
  const status = task.status === "done" ? "pending" : "done";
  const data = await api(`/tasks/${task._id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return data.task;
};

// restituisce la lista con la task aggiornata al posto di quella vecchia
export const replaceTask = (tasks, updatedTask) =>
  tasks.map((task) =>
    task._id === updatedTask._id ? { ...task, ...updatedTask } : task,
  );
