import "./myTaskCard.css";

import { CATEGORY, PRIORITY } from "../../../utils/taskLabel";
import { formatTime } from "../../../utils/formatTime";
import { formatDue } from "../../../utils/formatDue";
import Badge from "../../common/badge/Badge";
import TaskStatusBadge from "../taskStatusBadge/TaskStatusBadge";

// card di una task del dipendente, nella pagina "Le mie task".
// task: la task da mostrare; onToggle: la funzione della pagina che la segna come fatta o da fare
const MyTaskCard = ({ task, onToggle }) => {
  const isDone = task.status === "done";
  return (
    <article className="my-task-card">
      {/* a sinistra: titolo, badge, descrizione e dettagli */}
      <div className="my-task-card-body">
        <div className="my-task-card-header">
          <h3 className="my-task-card-title">{task.title}</h3>
          <div className="my-task-card-badges">
            <TaskStatusBadge status={task.status} />
            {task.isGlobal && <Badge color="secondary">Globale</Badge>}
          </div>
        </div>
        {task.description && (
          <p className="my-task-card-description">{task.description}</p>
        )}
        {/* ogni pezzo in un text-nowrap: va a capo intero, mai a metà */}
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
      {/* a destra: se è fatta, l'orario e "Annulla"; altrimenti il bottone "Segna come fatto" */}
      {isDone ? (
        <div className="my-task-card-completed">
          <p className="my-task-card-completed-text">
            {task.completedAt
              ? `Fatto alle ${formatTime(task.completedAt)}`
              : "Fatto"}
          </p>
          {/* aria-label con il titolo: in pagina ci sono più "Annulla" uguali */}
          <button
            type="button"
            className="my-task-card-undo"
            aria-label={`Annulla il completamento di ${task.title}`}
            onClick={() => onToggle(task)}
          >
            <span className="my-task-card-undo-label">Annulla</span>
          </button>
        </div>
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
