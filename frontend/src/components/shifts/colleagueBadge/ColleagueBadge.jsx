// import
import Badge from "../../common/badge/Badge";
import { formatFullName } from "../../../utils/formatFullName";
import { formatHourRange } from "../../../utils/formatTime";

// componente ColleagueBadge: "Giulia Neri · 13 – 21" (va a capo tra nome e orario, mai a metà).
// props: shift = il turno del collega, color
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
