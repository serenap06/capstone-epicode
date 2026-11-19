// import
import { formatTime } from "../../../utils/formatTime";
import { CATEGORY } from "../../../utils/taskLabel";
import Badge from "../../common/badge/Badge";
import "./myTaskList.css";

// componente MyTaskList: le task di oggi della Home, con la casella. props: tasks, onToggle
const MyTaskList = ({ tasks, onToggle }) => {
  return (
    <ul className="my-task-list">
      {tasks.map((task) => {
        const isDone = task.status === "done";
        return (
          <li key={task._id} className="my-task-row">
            {/* id e htmlFor: si spunta anche cliccando il testo */}
            <input
              type="checkbox"
              id={`task-${task._id}`}
              className="my-task-check"
              checked={isDone}
              onChange={() => onToggle(task)} // fatta / da fare
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
                {/* fatta (con l'orario), oppure la scadenza */}
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
