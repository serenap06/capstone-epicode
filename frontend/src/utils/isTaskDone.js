// una task di più persone è fatta solo quando l'hanno finita tutte (every)
export const isTaskDone = (task) =>
  task.assignees.every((assignee) => assignee.status === "done");
