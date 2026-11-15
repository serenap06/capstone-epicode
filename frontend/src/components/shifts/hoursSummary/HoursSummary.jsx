import "./hoursSummary.css";
import { getPercent } from "../../../utils/getPercent";
import ProgressBar from "../../common/progressBar/ProgressBar";

// ore pianificate nella settimana rispetto alle ore di contratto.
// hours: { scheduledHours, weeklyHours } dal server (/shifts/hours);
// shiftCount: quanti turni ha il dipendente nella settimana
const HoursSummary = ({ hours, shiftCount }) => {
  // quanto è piena la barra: ore pianificate su ore di contratto
  const percent = getPercent(hours.scheduledHours, hours.weeklyHours);
  // singolare o plurale: "1 turno", "5 turni"
  const shiftLabel = shiftCount === 1 ? "turno" : "turni";

  return (
    <section className="hours-summary" aria-label="Ore della settimana">
      {/* a sinistra il numero grande */}
      <div>
        <p className="hours-summary-label">Ore pianificate</p>
        <p className="hours-summary-value">
          {hours.scheduledHours} su {hours.weeklyHours} h
        </p>
      </div>
      {/* a destra la barra e la riga del contratto (su telefono vanno sotto) */}
      <div className="hours-summary-progress">
        <ProgressBar percent={percent} />
        <p className="hours-summary-detail">
          <span className="text-nowrap">
            Contratto di {hours.weeklyHours} ore a settimana ·
          </span>{" "}
          <span className="text-nowrap">
            {shiftCount} {shiftLabel}
          </span>
        </p>
      </div>
    </section>
  );
};

export default HoursSummary;
