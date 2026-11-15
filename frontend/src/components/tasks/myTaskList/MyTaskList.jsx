import { formatTime } from "../../../utils/formatTime";
import { CATEGORY } from "../../../utils/taskLabel";
import Badge from "../../common/badge/Badge";
import "./myTaskList.css";

// lista delle task di oggi nella Home, con la casella per segnarle come fatte.
// tasks: le task di oggi; onToggle: la funzione della pagina che cambia lo stato
const MyTaskList = ({ tasks, onToggle }) => {
  return (
    <ul className="my-task-list">
      {tasks.map((task) => {
        const isDone = task.status === "done";
        return (
          <li key={task._id} className="my-task-row">
            {/* casella e etichetta sono collegate da id e htmlFor:
                cliccando sul testo si spunta anche la casella */}
            <input
              type="checkbox"
              id={`task-${task._id}`}
              className="my-task-check"
              checked={isDone}
              onChange={() => onToggle(task)}
            />
            <label
              htmlFor={`task-${task._id}`}
              className={`my-task-label ${isDone ? "my-task-done" : ""}`}
            >
              <span className="my-task-heading">
                <span className="my-task-title">{task.title}</span>
                {task.isGlobal && <Badge color="secondary">Globale</Badge>}
              </span>
              <span className="my-task-meta">
                <span className="text-nowrap">{CATEGORY[task.category]} ·</span>{" "}
                {/* fatta con orario, fatta senza orario, oppure la scadenza */}
                <span className="text-nowrap">
                  {isDone
                    ? task.completedAt
                      ? `fatta alle ${formatTime(task.completedAt)}`
                      : "fatta"
                    : `scade alle ${formatTime(task.dueDate)}`}
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
};

export default MyTaskList;
