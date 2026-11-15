import Badge from "../../common/badge/Badge";

// testo e colore di ogni stato, uguali in tutta l'app
const LABEL = { done: "Fatto", pending: "Da fare" };
const COLOR = { done: "primary", pending: "warning" };

// badge dello stato; con name: "Marta Bianchi · Fatto"
const TaskStatusBadge = ({ status, name }) => {
  return (
    <Badge color={COLOR[status]}>
      {name && `${name} · `}
      {LABEL[status]}
    </Badge>
  );
};

export default TaskStatusBadge;
