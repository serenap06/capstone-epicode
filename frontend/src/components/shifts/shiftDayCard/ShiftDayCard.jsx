// import
import "./shiftDayCard.css";
import { Users } from "lucide-react";
import { formatTimeRange } from "../../../utils/formatTime";
import { formatDayName } from "../../../utils/formatDayName";
import { formatHours } from "../../../utils/formatHours";
import { getShiftHours } from "../../../utils/getShiftHours";
import ColleagueBadge from "../colleagueBadge/ColleagueBadge";

// componente ShiftDayCard: un giorno con il mio turno e i colleghi, oppure riposo.
// props: day, shift = undefined se riposo, colleagues, isToday
const ShiftDayCard = ({ day, shift, colleagues, isToday }) => {
  // "lun", "mar"...
  const dayName = formatDayName(day);
  // ore del turno (0 se riposo)
  const hours = shift ? getShiftHours(shift) : 0;
  // "1 ora", "8 ore"
  const hoursLabel = hours === 1 ? "ora" : "ore";

  return (
    // tratteggiata se riposo, magenta se oggi
    <article
      className={`app-card shift-day ${shift ? "" : "shift-day-rest"} ${isToday ? "shift-day-today" : ""}`}
      aria-current={isToday ? "date" : undefined}
    >
      {/* nome e numero del giorno */}
      <div className="shift-day-title">
        <span className="shift-day-name">{isToday ? "Oggi" : dayName}</span>
        <span className="shift-day-number">{day.getDate()}</span>
      </div>
      <div className="shift-day-content">
        {shift ? (
          // <> </> raggruppa senza un div
          <>
            <div>
              <h3 className="shift-day-time">
                {formatTimeRange(shift.startAt, shift.endAt)}
              </h3>
              <p className="shift-day-hours">
                {formatHours(hours)} {hoursLabel}
              </p>
            </div>
            {colleagues.length === 0 ? (
              <p className="shift-day-alone">Nessun collega in turno</p>
            ) : (
              <div className="shift-day-colleagues">
                {/* icona al posto di "Con te" (il testo nascosto è per lo screen reader) */}
                <Users
                  className="shift-day-with"
                  size={18}
                  aria-hidden="true"
                />
                <span className="visually-hidden">In turno con te:</span>
                {colleagues.map((colleague) => (
                  // bianco sulla card di oggi, viola sulle altre
                  <ColleagueBadge
                    key={colleague._id}
                    shift={colleague} // il turno del collega
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
