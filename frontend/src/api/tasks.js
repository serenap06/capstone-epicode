import api from "./api";

export const toggleTaskStatus = async (task) => {
  const status = task.status === "done" ? "pending" : "done";
  const data = await api(`/tasks/${task._id}/status`, {
    method: "PATCH",
    body: { status },
  });
  return data.task;
};
