import Badge from "../../common/badge/Badge";
import { formatFullName } from "../../../utils/formatFullName";
import { formatHourRange } from "../../../utils/formatTime";

// badge di un collega in turno: "Giulia Neri · 13 – 21".
// Nome e orario in due pezzi nowrap: se serve va a capo tra i due, mai a metà
const ColleagueBadge = ({ shift, color = "secondary" }) => {
  return (
    <Badge color={color}>
      <span className="text-nowrap">{formatFullName(shift.user)} ·</span>{" "}
      <span className="text-nowrap">
        {formatHourRange(shift.startAt, shift.endAt)}
      </span>
    </Badge>
  );
};

export default ColleagueBadge;
