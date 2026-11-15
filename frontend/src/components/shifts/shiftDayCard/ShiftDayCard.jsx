import "./shiftDayCard.css";
import { Users } from "lucide-react";
import { formatTimeRange } from "../../../utils/formatTime";
import { formatDayName } from "../../../utils/formatDayName";
import ColleagueBadge from "../colleagueBadge/ColleagueBadge";

// un giorno della settimana: turno del dipendente e colleghi, oppure riposo.
// day: la data del giorno; shift: il turno del dipendente o undefined;
// colleagues: i turni dei colleghi in quel giorno; isToday: true se è oggi
const ShiftDayCard = ({ day, shift, colleagues, isToday }) => {
  // nome corto del giorno: "lun", "mar"...
  const dayName = formatDayName(day);
  // durata del turno: fine meno inizio dà i millisecondi,
  // diviso 3.600.000 (i millisecondi in un'ora) dà le ore
  const hours = shift
    ? (new Date(shift.endAt) - new Date(shift.startAt)) / 3600000
    : 0;

  return (
    // le classi cambiano l'aspetto: tratteggiata se è riposo, magenta se è oggi
    <article
      className={`shift-day ${shift ? "" : "shift-day-rest"} ${isToday ? "shift-day-today" : ""}`}
      aria-current={isToday ? "date" : undefined}
    >
      {/* casella con nome e numero del giorno */}
      <div className="shift-day-title">
        <span className="shift-day-name">{isToday ? "Oggi" : dayName}</span>
        <span className="shift-day-number">{day.getDate()}</span>
      </div>
      <div className="shift-day-content">
        {shift ? (
          // <> </> è un frammento: raggruppa due elementi senza aggiungere un div
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
                {/* icona dei due omini al posto della scritta "Con te";
                    il testo nascosto lo legge solo lo screen reader */}
                <Users
                  className="shift-day-with"
                  size={18}
                  aria-hidden="true"
                />
                <span className="visually-hidden">In turno con te:</span>
                {colleagues.map((colleague) => (
                  // badge bianco sulla card di oggi (che è magenta chiaro), viola sulle altre
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
