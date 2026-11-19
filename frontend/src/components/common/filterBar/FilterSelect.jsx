// import
import "./filterBar.css";
import { useId } from "react";

// componente FilterSelect: menu a tendina di un filtro.
// props: label, allLabel = la prima voce che non filtra ("Tutti i negozi"), options, value, onChange
const FilterSelect = ({ label, allLabel, options, value, onChange }) => {
  // id per collegare etichetta e menu
  const selectId = useId();

  return (
    <div>
      {/* etichetta solo per lo screen reader */}
      <label htmlFor={selectId} className="visually-hidden">
        {label}
      </label>
      <select
        id={selectId}
        className="filter-select"
        value={value}
        // la voce appena scelta
        onChange={(event) => onChange(event.target.value)}
      >
        {/* "" = nessun filtro */}
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSelect;
