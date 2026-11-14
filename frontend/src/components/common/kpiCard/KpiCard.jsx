import "./kpiCard.css";
import { Link } from "react-router-dom";

// scheletro cards per dashboard, vendite e report
const KpiCard = ({ label, value, detail, color, to }) => {
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
