// task fatta solo se l'hanno finita tutti
export const isTaskDone = (task) =>
  task.assignees.every((assignee) => assignee.status === "done");
