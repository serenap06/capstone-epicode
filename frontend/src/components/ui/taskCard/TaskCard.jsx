import { formatTime } from "../../../utils/formatTime";
import { CATEGORY, PRIORITY } from "../../../utils/taskLabel";
import "./taskCard.css";

// scheda di una task con le persone assegnate, per dashboard e pagina task
const TaskCard = ({ task }) => {
  const doneCount = task.assignees.filter((assignee) => assignee.status === "done").length;
  const total = task.assignees.length;
  const percent = Math.round((doneCount / total) * 100);
  const dueTime = formatTime(task.dueDate);

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
        <span className="text-nowrap">Scade alle {dueTime} ·</span>{" "}
        <span className="text-nowrap">{CATEGORY[task.category]} ·</span>{" "}
        <span className="text-nowrap">Priorità {PRIORITY[task.priority]} ·</span>{" "}
        <span className="text-nowrap">
          {doneCount} su {total} completate
        </span>
      </p>

      <div className="task-card-bar" aria-hidden="true">
        <div className="task-card-bar-fill" style={{ width: `${percent}%` }} />
      </div>

      <div className="task-card-people">
        {task.assignees.map((assignee) => (
          <span
            key={assignee.taskId}
            className={`task-card-person ${assignee.status === "done" ? "task-card-person-done" : ""}`}
          >
            {assignee.user.name} {assignee.user.surname} ·{" "}
            {assignee.status === "done" ? "Fatto" : "Da fare"}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TaskCard;