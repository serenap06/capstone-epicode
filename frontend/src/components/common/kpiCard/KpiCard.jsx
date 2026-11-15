import "./kpiCard.css";
import { Link } from "react-router-dom";

// scheletro cards per dashboard, vendite e report: card colorata con un numero grande.
// label: titolo piccolo, value: il numero, detail: riga sotto (facoltativa),
// color: colore della card (primary, secondary, turquoise, orange, blue),
// to: se c'è, la card diventa un link a quella pagina
const KpiCard = ({ label, value, detail, color, to }) => {
  // se c'è un indirizzo la card è un Link, altrimenti un semplice div
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
