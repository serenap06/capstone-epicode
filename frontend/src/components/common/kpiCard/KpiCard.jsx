import "./kpiCard.css";
import { Link } from "react-router-dom";

// card colorata con un numero grande (dashboard, vendite, report).
// detail: riga sotto, facoltativa; color: primary, secondary, turquoise, orange o blue;
// to: se c'è, la card è un link
const KpiCard = ({ label, value, detail, color, to }) => {
  // con "to" la card è un Link, altrimenti un div
  const Tag = to ? Link : "div";
  return (
    <Tag to={to} className={`kpi-card kpi-card-${color}`}>
      <p className="kpi-card-label">{label}</p>
      <p className="kpi-card-value">{value}</p>
      {detail && <p className="kpi-card-detail">{detail}</p>}
    </Tag>
  );
};

export default KpiCard;
