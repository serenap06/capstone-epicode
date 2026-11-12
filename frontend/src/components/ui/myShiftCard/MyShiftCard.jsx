import { formatTime } from "../../../utils/formatTime";
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
          {shift
            ? `${formatTime(shift.startAt)} – ${formatTime(shift.endAt)}`
            : "Riposo"}
        </p>
      </div>
      <div className="my-shift-colleagues">
        <p className="my-shift-subtitle">Con te oggi</p>
        {colleagues.length === 0 && (
          <p className="my-shift-empty">Nessun collega in turno</p>
        )}
        <div className="my-shift-badges">
          {colleagues.map((colleague) => (
            <span key={colleague._id} className="my-shift-badge">
              {colleague.user.name} {colleague.user.surname} ·{" "}
              {formatTime(colleague.startAt)} – {formatTime(colleague.endAt)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyShiftCard;
