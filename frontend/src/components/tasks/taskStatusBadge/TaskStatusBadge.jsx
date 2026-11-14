import Badge from "../../common/badge/Badge";

const LABEL = { done: "Fatto", pending: "Da fare" };
const COLOR = { done: "primary", pending: "warning" };

// badge con lo stato di una task; name aggiunge davanti il nome della persona
const TaskStatusBadge = ({ status, name }) => {
  return (
    <Badge color={COLOR[status]}>
      {name && `${name} · `}
      {LABEL[status]}
    </Badge>
  );
};

export default TaskStatusBadge;
