// import
import "./kpiCard.css";
import { Link } from "react-router-dom";

// componente KpiCard: card colorata con un numero grande, delle righe o delle colonne.
// props: label, value, detail = riga sotto, color = primary, secondary, turquoise, orange o blue,
// to = se c'è la card è un link, rows = righe { label, note, value }, columns = colonne { label, value, detail },
// aside = accanto al titolo (es. un badge), compactRows = valori delle righe piccoli come i nomi
const KpiCard = ({
  label,
  value,
  detail,
  color,
  to,
  rows,
  columns,
  aside,
  compactRows = false,
}) => {
  // Link con "to", altrimenti div
  const Tag = to ? Link : "div";
  return (
    <Tag to={to} className={`kpi-card kpi-card-${color}`}>
      {/* titolo, con accanto aside se c'è */}
      <div className="kpi-card-top">
        <p className="kpi-card-label">{label}</p>
        {aside}
      </div>
      {value !== undefined && <p className="kpi-card-value">{value}</p>}
      {/* righe: nome (con la nota sotto) a sinistra, importo a destra */}
      {rows?.length > 0 && (
        <ul
          className={`kpi-card-rows ${compactRows ? "kpi-card-rows-compact" : ""}`}
        >
          {rows.map((row) => (
            <li key={row.key ?? row.label} className="kpi-card-row">
              <span className="kpi-card-row-name">
                {row.label}
                {row.note && <small>{row.note}</small>}
              </span>
              <strong className="kpi-card-row-value">{row.value}</strong>
            </li>
          ))}
        </ul>
      )}
      {/* colonne: nome, numero e riga sotto, separate da una linea sottile */}
      {columns?.length > 0 && (
        <div className="kpi-card-columns">
          {columns.map((column) => (
            <div key={column.key ?? column.label} className="kpi-card-column">
              <p className="kpi-card-column-label">{column.label}</p>
              <p className="kpi-card-value">{column.value}</p>
              <p className="kpi-card-detail">{column.detail}</p>
            </div>
          ))}
        </div>
      )}
      {detail && <p className="kpi-card-detail">{detail}</p>}
    </Tag>
  );
};

export default KpiCard;
