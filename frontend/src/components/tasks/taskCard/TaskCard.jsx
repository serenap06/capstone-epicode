import { formatTime } from "../../../utils/formatTime";
import { formatFullName } from "../../../utils/formatFullName";
import { getPercent } from "../../../utils/getPercent";
import { CATEGORY, PRIORITY } from "../../../utils/taskLabel";
import Badge from "../../common/badge/Badge";
import ProgressBar from "../../common/progressBar/ProgressBar";
import TaskStatusBadge from "../taskStatusBadge/TaskStatusBadge";
import "./taskCard.css";

// scheda di una task con le persone assegnate, per dashboard e pagina task
const TaskCard = ({ task }) => {
  const doneCount = task.assignees.filter((assignee) => assignee.status === "done").length;
  const total = task.assignees.length;
  const percent = getPercent(doneCount, total);
  const dueTime = formatTime(task.dueDate);

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-card-title">{task.title}</h3>
        <Badge color={task.isGlobal ? "secondary" : "primary"}>
          {task.isGlobal ? `Globale · ${task.store.name}` : task.store.name}
        </Badge>
      </div>

      <p className="task-card-meta">
        <span className="text-nowrap">Scade alle {dueTime} ·</span>{" "}
        <span className="text-nowrap">{CATEGORY[task.category]} ·</span>{" "}
        <span className="text-nowrap">Priorità {PRIORITY[task.priority]} ·</span>{" "}
        <span className="text-nowrap">
          {doneCount} su {total} completate
        </span>
      </p>

      <ProgressBar percent={percent} />

      <div className="task-card-people">
        {task.assignees.map((assignee) => (
          <TaskStatusBadge
            key={assignee.taskId}
            status={assignee.status}
            name={formatFullName(assignee.user)}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskCard;