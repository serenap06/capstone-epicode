// import
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

// componente TaskCard: una task del responsabile con le persone e il loro stato.
// props: task, onDelete (la Dashboard non lo passa)
const TaskCard = ({ task, onDelete }) => {
  // quante persone l'hanno finita
  const doneCount = task.assignees.filter(
    (assignee) => assignee.status === "done",
  ).length;
  const total = task.assignees.length;
  const percent = getPercent(doneCount, total);
  const dueTime = formatTime(task.dueDate);

  return (
    <div className="app-card task-card">
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        {/* viola se globale, magenta se per alcune persone */}
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

      {/* un badge per persona, con nome e stato */}
      <div className="task-card-people">
        {task.assignees.map((assignee) => (
          <TaskStatusBadge
            key={assignee.taskId}
            status={assignee.status}
            name={formatFullName(assignee.user)}
          />
        ))}
      </div>

      {/* cestino solo se la pagina passa onDelete */}
      {onDelete && (
        <div className="task-card-actions">
          {/* l'aria-label dice cosa fa */}
          <Button
            variant="danger"
            className="app-button-icon"
            aria-label={`Elimina per tutti: ${task.title}`}
            onClick={() => onDelete(task)} // chiedo conferma prima di eliminare
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
