import "./shiftDayCard.css";
import { Users } from "lucide-react";
import { formatTimeRange } from "../../../utils/formatTime";
import { formatDayName } from "../../../utils/formatDayName";
import { formatHours } from "../../../utils/formatHours";
import { getShiftHours } from "../../../utils/getShiftHours";
import ColleagueBadge from "../colleagueBadge/ColleagueBadge";

// un giorno della settimana: il mio turno con i colleghi, oppure riposo.
// shift: undefined se riposo; isToday: true se è oggi
const ShiftDayCard = ({ day, shift, colleagues, isToday }) => {
  // "lun", "mar"...
  const dayName = formatDayName(day);
  // durata del turno in ore (0 se è riposo)
  const hours = shift ? getShiftHours(shift) : 0;
  // singolare con 1: "1 ora", "8 ore"
  const hoursLabel = hours === 1 ? "ora" : "ore";

  return (
    // tratteggiata se è riposo, magenta se è oggi
    <article
      className={`app-card shift-day ${shift ? "" : "shift-day-rest"} ${isToday ? "shift-day-today" : ""}`}
      aria-current={isToday ? "date" : undefined}
    >
      {/* casella con nome e numero del giorno */}
      <div className="shift-day-title">
        <span className="shift-day-name">{isToday ? "Oggi" : dayName}</span>
        <span className="shift-day-number">{day.getDate()}</span>
      </div>
      <div className="shift-day-content">
        {shift ? (
          // <> </> raggruppa senza aggiungere un div
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
                {/* icona al posto di "Con te"; il testo nascosto è per lo screen reader */}
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
