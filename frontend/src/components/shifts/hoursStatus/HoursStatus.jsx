import "./hoursStatus.css";
import { formatHours } from "../../../utils/formatHours";
import { getPercent } from "../../../utils/getPercent";
import Badge from "../../common/badge/Badge";
import ProgressBar from "../../common/progressBar/ProgressBar";

// ore pianificate su ore di contratto, con barra e stato. Colori come nel resto dell'app:
// Completo magenta (come "Fatto"), Mancano arancio (come "Da fare"), In più viola
const HoursStatus = ({ scheduled, contract }) => {
  // arrotondo a un decimale, così 39.99999 non diventa "mancano 0 h"
  const difference = Math.round((scheduled - contract) * 10) / 10;

  let badge;
  if (difference === 0) {
    badge = <Badge color="primary">Completo</Badge>;
  } else if (difference < 0) {
    // -difference: la differenza è negativa, la scrivo positiva ("Mancano 8 h")
    badge = <Badge color="warning">Mancano {formatHours(-difference)} h</Badge>;
  } else {
    badge = <Badge color="secondary">{formatHours(difference)} h in più</Badge>;
  }

  return (
    <div className="hours-status">
      <p className="hours-status-value">
        {formatHours(scheduled)} / {contract} h
      </p>
      <ProgressBar percent={getPercent(scheduled, contract)} />
      <div>{badge}</div>
    </div>
  );
};

export default HoursStatus;
