// import
import "./kpiCard.css";
import { Link } from "react-router-dom";

// componente KpiCard: card colorata con un numero grande, oppure con delle righe.
// props: label, value, detail = riga sotto, color = primary, secondary, turquoise, orange o blue,
// to = se c'è la card è un link, rows = righe { label, note, value } al posto del numero
const KpiCard = ({ label, value, detail, color, to, rows }) => {
  // Link con "to", altrimenti div
  const Tag = to ? Link : "div";
  return (
    <Tag to={to} className={`kpi-card kpi-card-${color}`}>
      <p className="kpi-card-label">{label}</p>
      {value !== undefined && <p className="kpi-card-value">{value}</p>}
      {/* righe: nome (con la nota sotto) a sinistra, importo a destra */}
      {rows?.length > 0 && (
        <ul className="kpi-card-rows">
          {rows.map((row) => (
            <li key={row.label} className="kpi-card-row">
              <span className="kpi-card-row-name">
                {row.label}
                {row.note && <small>{row.note}</small>}
              </span>
              <strong className="kpi-card-row-value">{row.value}</strong>
            </li>
          ))}
        </ul>
      )}
      {detail && <p className="kpi-card-detail">{detail}</p>}
    </Tag>
  );
};

export default KpiCard;
