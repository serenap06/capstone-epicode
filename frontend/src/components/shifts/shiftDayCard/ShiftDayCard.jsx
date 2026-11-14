import "./shiftDayCard.css";
import { Users } from "lucide-react";
import { formatTimeRange } from "../../../utils/formatTime";
import { formatDayName } from "../../../utils/formatDayName";
import ColleagueBadge from "../colleagueBadge/ColleagueBadge";

// un giorno della settimana: turno del dipendente e colleghi, oppure riposo
const ShiftDayCard = ({ day, shift, colleagues, isToday }) => {
  const dayName = formatDayName(day);
  const hours = shift
    ? (new Date(shift.endAt) - new Date(shift.startAt)) / 3600000
    : 0;

  return (
    <article
      className={`shift-day ${shift ? "" : "shift-day-rest"} ${isToday ? "shift-day-today" : ""}`}
      aria-current={isToday ? "date" : undefined}
    >
      <div className="shift-day-title">
        <span className="shift-day-name">{isToday ? "Oggi" : dayName}</span>
        <span className="shift-day-number">{day.getDate()}</span>
      </div>
      <div className="shift-day-content">
        {shift ? (
          <>
            <div>
              <h3 className="shift-day-time">
                {formatTimeRange(shift.startAt, shift.endAt)}
              </h3>
              <p className="shift-day-hours">{hours} ore</p>
            </div>
            {colleagues.length === 0 ? (
              <p className="shift-day-alone">Nessun collega in turno</p>
            ) : (
              <div className="shift-day-colleagues">
                <Users
                  className="shift-day-with"
                  size={18}
                  aria-hidden="true"
                />
                <span className="visually-hidden">In turno con te:</span>
                {colleagues.map((colleague) => (
                  <ColleagueBadge
                    key={colleague._id}
                    shift={colleague}
                    color={isToday ? "white" : "secondary"}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <h3 className="shift-day-time">Riposo</h3>
        )}
      </div>
    </article>
  );
};

export default ShiftDayCard;
