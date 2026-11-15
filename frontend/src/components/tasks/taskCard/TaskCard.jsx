import { formatTime } from "../../../utils/formatTime";
import { formatFullName } from "../../../utils/formatFullName";
import { getPercent } from "../../../utils/getPercent";
import { CATEGORY, PRIORITY } from "../../../utils/taskLabel";

import Badge from "../../common/badge/Badge";
import ProgressBar from "../../common/progressBar/ProgressBar";
import Button from "../../common/button/Button";

import TaskStatusBadge from "../taskStatusBadge/TaskStatusBadge";

import { Trash2 } from "lucide-react";
import "./taskCard.css";

// card di una task del responsabile; assignees: le persone assegnate, ognuna con il suo stato
const TaskCard = ({ task, onDelete }) => {
  // quante persone l'hanno finita
  const doneCount = task.assignees.filter(
    (assignee) => assignee.status === "done",
  ).length;
  const total = task.assignees.length;
  const percent = getPercent(doneCount, total);
  const dueTime = formatTime(task.dueDate);

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        {/* viola se è globale, magenta se è per alcune persone */}
        <Badge color={task.isGlobal ? "secondary" : "primary"}>
          {task.isGlobal ? `Globale · ${task.store.name}` : task.store.name}
        </Badge>
      </div>

      <p className="task-card-meta">
        <span className="text-nowrap">Scade alle {dueTime} ·</span>{" "}
        <span className="text-nowrap">{CATEGORY[task.category]} ·</span>{" "}
        <span className="text-nowrap">
          Priorità {PRIORITY[task.priority]} ·
        </span>{" "}
        <span className="text-nowrap">
          {doneCount} su {total} completate
        </span>
      </p>

      <ProgressBar percent={percent} />

      {/* un badge per ogni persona, con nome e stato */}
      <div className="task-card-people">
        {task.assignees.map((assignee) => (
          <TaskStatusBadge
            key={assignee.taskId}
            status={assignee.status}
            name={formatFullName(assignee.user)}
          />
        ))}
      </div>

      {/* solo se la pagina passa onDelete (la Dashboard no); aria-label con il titolo */}
      {onDelete && (
        <div className="task-card-actions">
          <Button
            variant="danger"
            aria-label={`Elimina per tutti: ${task.title}`}
            onClick={() => onDelete(task)}
          >
            <Trash2 size={16} aria-hidden="true" />
            Elimina
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
