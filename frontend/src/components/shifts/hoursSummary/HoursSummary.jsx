import "./hoursSummary.css";
import { getPercent } from "../../../utils/getPercent";
import { formatHours } from "../../../utils/formatHours";
import ProgressBar from "../../common/progressBar/ProgressBar";

// ore pianificate della settimana su ore di contratto; shiftCount: i turni della settimana
const HoursSummary = ({ hours, shiftCount }) => {
  const percent = getPercent(hours.scheduledHours, hours.weeklyHours);
  // "1 turno", "5 turni"
  const shiftLabel = shiftCount === 1 ? "turno" : "turni";

  return (
    <section className="app-card hours-summary" aria-label="Ore della settimana">
      {/* a sinistra il numero grande */}
      <div>
        <p className="hours-summary-label">Ore pianificate</p>
        <p className="hours-summary-value">
          {formatHours(hours.scheduledHours)} su {hours.weeklyHours} h
        </p>
      </div>
      {/* a destra barra e contratto (su telefono vanno sotto) */}
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
