import "./filterBar.css";
import { useId } from "react";

// menu a tendina di un filtro; allLabel è la prima voce, quella che non filtra ("Tutti i negozi")
const FilterSelect = ({ label, allLabel, options, value, onChange }) => {
  // id unico per collegare l'etichetta al menu
  const selectId = useId();

  return (
    <div>
      {/* etichetta letta solo dagli screen reader */}
      <label htmlFor={selectId} className="visually-hidden">
        {label}
      </label>
      <select
        id={selectId}
        className="filter-select"
        value={value}
        // event.target.value è la voce appena scelta
        onChange={(event) => onChange(event.target.value)}
      >
        {/* valore vuoto = nessun filtro */}
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
