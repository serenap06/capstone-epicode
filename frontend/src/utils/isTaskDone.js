// una task assegnata a più persone è fatta solo quando l'hanno completata tutte.
// every restituisce true solo se la condizione vale per ogni persona assegnata
export const isTaskDone = (task) =>
  task.assignees.every((assignee) => assignee.status === "done");
