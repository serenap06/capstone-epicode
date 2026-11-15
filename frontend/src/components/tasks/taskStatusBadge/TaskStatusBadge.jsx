import Badge from "../../common/badge/Badge";

// testo e colore per ogni stato: così "Fatto" ha lo stesso colore in tutta l'app
const LABEL = { done: "Fatto", pending: "Da fare" };
const COLOR = { done: "primary", pending: "warning" };

// badge con lo stato di una task; name aggiunge davanti il nome della persona:
// <TaskStatusBadge status="done" /> → "Fatto"
// <TaskStatusBadge status="done" name="Marta Bianchi" /> → "Marta Bianchi · Fatto"
const TaskStatusBadge = ({ status, name }) => {
  return (
    <Badge color={COLOR[status]}>
      {name && `${name} · `}
      {LABEL[status]}
    </Badge>
  );
};

export default TaskStatusBadge;
