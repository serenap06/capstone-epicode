import "./hoursSummary.css";
import { getPercent } from "../../../utils/getPercent";
import ProgressBar from "../../common/progressBar/ProgressBar";

// ore pianificate nella settimana rispetto alle ore di contratto
const HoursSummary = ({ hours, shiftCount }) => {
  const percent = getPercent(hours.scheduledHours, hours.weeklyHours);
  const shiftLabel = shiftCount === 1 ? "turno" : "turni";

  return (
    <section className="hours-summary" aria-label="Ore della settimana">
      <div>
        <p className="hours-summary-label">Ore pianificate</p>
        <p className="hours-summary-value">
          {hours.scheduledHours} su {hours.weeklyHours} h
        </p>
      </div>
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
