// import
import "./kpiCard.css";
import { Link } from "react-router-dom";

// componente KpiCard: card colorata con un numero grande.
// props: label, value, detail = riga sotto, color = primary, secondary, turquoise, orange o blue,
// to = se c'è la card è un link
const KpiCard = ({ label, value, detail, color, to }) => {
  // Link con "to", altrimenti div
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
