// import
import "./hoursStatus.css";
import { formatHours } from "../../../utils/formatHours";
import { getPercent } from "../../../utils/getPercent";
import Badge from "../../common/badge/Badge";
import ProgressBar from "../../common/progressBar/ProgressBar";

// componente HoursStatus: ore pianificate su contratto, con barra e stato
// (Completo magenta, Mancano arancio, In più viola). props: scheduled, contract
const HoursStatus = ({ scheduled, contract }) => {
  // un decimale: 39.99999 non diventa "mancano 0 h"
  const difference = Math.round((scheduled - contract) * 10) / 10;

  let badge;
  if (difference === 0) {
    badge = <Badge color="primary">Completo</Badge>;
  } else if (difference < 0) {
    // -difference: la scrivo positiva
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
