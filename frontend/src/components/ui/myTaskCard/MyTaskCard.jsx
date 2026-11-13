import "./myTaskCard.css";

import { CATEGORY, PRIORITY } from "../../../utils/taskLabel";
import { formatTime } from "../../../utils/formatTime";
import { formatDue } from "../../../utils/formatDue";

const MyTaskCard = ({ task, onToggle }) => {
  const isDone = task.status === "done";
  return (
    <article className="my-task-card">
      <div className="my-task-card-body">
        <div className="my-task-card-header">
          <h3 className="my-task-card-title">{task.title}</h3>
          <div className="my-task-card-badges">
            <span
              className={`my-task-card-badge ${isDone ? "my-task-card-badge-done" : "my-task-card-badge-pending"}`}
            >
              {isDone ? "Fatto" : "Da fare"}
            </span>
            {task.isGlobal && (
              <span className="my-task-card-badge my-task-card-badge-global">
                Globale
              </span>
            )}
          </div>
        </div>
        {task.description && (
          <p className="my-task-card-description">{task.description}</p>
        )}
        <p className="my-task-card-meta">
          <span className="text-nowrap">
            {isDone ? "Scadeva" : "Scade"} {formatDue(task.dueDate)} ·
          </span>{" "}
          <span className="text-nowrap">{CATEGORY[task.category]} ·</span>{" "}
          <span className="text-nowrap">
            Priorità {PRIORITY[task.priority]}
          </span>
        </p>
      </div>
      {isDone ? (
        <p className="my-task-card-completed">
          {task.completedAt
            ? `Completata alle ${formatTime(task.completedAt)}`
            : "Completata"}
        </p>
      ) : (
        <button
          type="button"
          className="my-task-card-button"
          onClick={() => onToggle(task)}
        >
          Segna come fatto
        </button>
      )}
    </article>
  );
};

export default MyTaskCard;
