import { formatTimeRange } from "../../../utils/formatTime";
import ColleagueBadge from "../colleagueBadge/ColleagueBadge";
import "./myShiftCard.css";

// card magenta della Home: il turno di oggi e i colleghi in turno.
// shift: undefined se oggi riposa; colleagues: i turni di oggi degli altri
const MyShiftCard = ({ shift, colleagues }) => {
  return (
    <section className="my-shift-card" aria-labelledby="my-shift-title">
      {/* a sinistra: l'orario del turno o "Riposo" */}
      <div>
        <h2 id="my-shift-title" className="my-shift-label">
          Il tuo turno di oggi
        </h2>
        <p className="my-shift-time">
          {shift ? formatTimeRange(shift.startAt, shift.endAt) : "Riposo"}
        </p>
      </div>
      {/* a destra i colleghi, in badge bianchi sulla card magenta */}
      <div className="my-shift-colleagues">
        <p className="my-shift-subtitle">Con te oggi</p>
        {colleagues.length === 0 && (
          <p className="my-shift-empty">Nessun collega in turno</p>
        )}
        <div className="my-shift-badges">
          {colleagues.map((colleague) => (
            <ColleagueBadge key={colleague._id} shift={colleague} color="white" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyShiftCard;
