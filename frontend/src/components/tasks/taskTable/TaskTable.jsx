// import
import "./taskTable.css";
import { Trash2 } from "lucide-react";

import { formatFullName } from "../../../utils/formatFullName";
import { formatTime } from "../../../utils/formatTime";
import { getPercent } from "../../../utils/getPercent";
import { CATEGORY, PRIORITY } from "../../../utils/taskLabel";

import Badge from "../../common/badge/Badge";
import Button from "../../common/button/Button";
import ProgressBar from "../../common/progressBar/ProgressBar";
import SortableHeader from "../../common/sortableHeader/SortableHeader";
import TaskStatusBadge from "../taskStatusBadge/TaskStatusBadge";

// componente TaskTable: le task di un giorno in tabella, da 1366px (sotto le card, stesse informazioni).
// props: tasks, sort e onSort = l'ordine (lo fa il server), onDelete = il cestino (chiede conferma)
const TaskTable = ({ tasks, sort, onSort, onDelete }) => {
  // props uguali per le intestazioni che ordinano
  const sortProps = { sort, onSort };

  return (
    // se non ci sta, scorre in orizzontale
    <div className="app-card app-table-wrap">
      <table className="app-table task-table">
        <thead>
          <tr>
            <SortableHeader label="Ora" field="time" {...sortProps} />
            <SortableHeader label="Task" field="title" {...sortProps} />
            <SortableHeader label="Negozio" field="store" {...sortProps} />
            <SortableHeader label="Categoria" field="category" {...sortProps} />
            <SortableHeader label="Priorità" field="priority" {...sortProps} />
            <SortableHeader
              label="Completate"
              field="progress"
              {...sortProps}
            />
            <th scope="col">Persone</th>
            <th scope="col">
              <span className="visually-hidden">Azioni</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            // quante persone l'hanno finita
            const doneCount = task.assignees.filter(
              (assignee) => assignee.status === "done",
            ).length;
            const total = task.assignees.length;
            return (
              <tr key={task._id}>
                <td>
                  <strong>{formatTime(task.dueDate)}</strong>
                </td>
                <td className="task-table-title">{task.title}</td>
                {/* viola se globale, magenta se per alcune persone (come nella card) */}
                <td>
                  <Badge color={task.isGlobal ? "secondary" : "primary"}>
                    {task.isGlobal
                      ? `Globale · ${task.store.name}`
                      : task.store.name}
                  </Badge>
                </td>
                <td>{CATEGORY[task.category]}</td>
                <td className="task-table-priority">
                  {PRIORITY[task.priority]}
                </td>
                {/* "1 su 2" con la barra sotto */}
                <td className="task-table-progress">
                  {doneCount} su {total}
                  <ProgressBar percent={getPercent(doneCount, total)} />
                </td>
                {/* un badge per persona, con nome e stato */}
                <td>
                  <div className="task-table-people">
                    {task.assignees.map((assignee) => (
                      <TaskStatusBadge
                        key={assignee.taskId}
                        status={assignee.status}
                        name={formatFullName(assignee.user)}
                      />
                    ))}
                  </div>
                </td>
                <td className="text-end">
                  {/* l'aria-label dice cosa fa */}
                  <Button
                    variant="danger"
                    className="app-button-icon"
                    aria-label={`Elimina per tutti: ${task.title}`}
                    onClick={() => onDelete(task)} // chiedo conferma prima di eliminare
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
