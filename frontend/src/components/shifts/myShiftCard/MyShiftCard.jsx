import { formatTimeRange } from "../../../utils/formatTime";
import ColleagueBadge from "../colleagueBadge/ColleagueBadge";
import "./myShiftCard.css";

// turno di oggi del dipendente, con i colleghi in turno nello stesso giorno
const MyShiftCard = ({ shift, colleagues }) => {
  return (
    <section className="my-shift-card" aria-labelledby="my-shift-title">
      <div>
        <h2 id="my-shift-title" className="my-shift-label">
          Il tuo turno di oggi
        </h2>
        <p className="my-shift-time">
          {shift ? formatTimeRange(shift.startAt, shift.endAt) : "Riposo"}
        </p>
      </div>
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
