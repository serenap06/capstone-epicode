import "./taskCard.css";

const PRIORITY = { low: "bassa", medium: "media", high: "alta" };
const CATEGORY = { operations: "Operativa", administrative: "Amministrativa" };

// scheda di una task con le persone assegnate, per dashboard e pagina task
const TaskCard = ({ task }) => {
  const doneCount = task.assignees.filter((a) => a.status === "done").length;
  const total = task.assignees.length;
  const percent = Math.round((doneCount / total) * 100);
  const dueTime = new Date(task.dueDate).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <span
          className={`task-card-badge ${task.isGlobal ? "task-card-badge-global" : ""}`}
        >
          {task.isGlobal ? `Globale · ${task.store.name}` : task.store.name}
        </span>
      </div>

      <p className="task-card-meta">
        Scade alle {dueTime} · {CATEGORY[task.category]} · Priorità{" "}
        {PRIORITY[task.priority]} · {doneCount} su {total} completate
      </p>

      <div className="task-card-bar" aria-hidden="true">
        <div className="task-card-bar-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="task-card-people">
        {task.assignees.map((a) => (
          <span
            key={a.taskId}
            className={`task-card-person ${a.status === "done" ? "task-card-person-done" : ""}`}
          >
            {a.user.name} {a.user.surname} ·{" "}
            {a.status === "done" ? "Fatto" : "Da fare"}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TaskCard;