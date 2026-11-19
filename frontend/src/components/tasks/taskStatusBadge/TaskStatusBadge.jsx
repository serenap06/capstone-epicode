// import
import Badge from "../../common/badge/Badge";

// testo e colore di ogni stato
const LABEL = { done: "Fatto", pending: "Da fare" };
const COLOR = { done: "primary", pending: "warning" };

// componente TaskStatusBadge: lo stato, con name "Marta Bianchi · Fatto". props: status, name
const TaskStatusBadge = ({ status, name }) => {
  return (
    <Badge color={COLOR[status]}>
      {name && `${name} · `}
      {LABEL[status]}
    </Badge>
  );
};

export default TaskStatusBadge;
