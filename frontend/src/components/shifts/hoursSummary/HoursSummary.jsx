// import
import "./hoursSummary.css";
import { getPercent } from "../../../utils/getPercent";
import { formatHours } from "../../../utils/formatHours";
import ProgressBar from "../../common/progressBar/ProgressBar";

// componente HoursSummary: ore pianificate su contratto della settimana. props: hours, shiftCount
const HoursSummary = ({ hours, shiftCount }) => {
  // senza contratto scrivo 0
  const contract = hours.weeklyHours ?? 0;
  const percent = getPercent(hours.scheduledHours, contract);
  // "1 turno", "5 turni"
  const shiftLabel = shiftCount === 1 ? "turno" : "turni";

  return (
    <section
      className="app-card hours-summary"
      aria-label="Ore della settimana"
    >
      {/* a sinistra il numero grande */}
      <div>
        <p className="hours-summary-label">Ore pianificate</p>
        <p className="hours-summary-value">
          {formatHours(hours.scheduledHours)} su {contract} h
        </p>
      </div>
      {/* a destra barra e contratto (su telefono sotto) */}
      <div className="hours-summary-progress">
        <ProgressBar percent={percent} />
        <p className="hours-summary-detail">
          <span className="text-nowrap">
            Contratto di {contract} ore a settimana ·
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
