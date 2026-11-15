import Badge from "../../common/badge/Badge";
import { formatFullName } from "../../../utils/formatFullName";
import { formatHourRange } from "../../../utils/formatTime";

// badge di un collega in turno: "Giulia Neri · 13 – 21".
// shift: il turno del collega; color: "white" sulle card magenta, altrimenti viola.
// Nome e orario sono in due pezzi "text-nowrap": se non c'è spazio il badge
// va a capo tra i due, mai a metà di un nome o di un orario
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
