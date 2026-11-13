import { formatTime } from "../../../utils/formatTime";
import { CATEGORY } from "../../../utils/taskLabel";
import "./myTaskList.css";

// task del dipendente con la casella per segnarle come fatte
const MyTaskList = ({ tasks, onToggle }) => {
  return (
    <ul className="my-task-list">
      {tasks.map((task) => {
        const isDone = task.status === "done";
        return (
          <li key={task._id} className="my-task-row">
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
                {task.isGlobal && (
                  <span className="my-task-badge">Globale</span>
                )}
              </span>
              <span className="my-task-meta">
                <span className="text-nowrap">{CATEGORY[task.category]} ·</span>{" "}
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
